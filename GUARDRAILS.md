# 🛡️ BriefVoice AI Guardrails Architecture

In BriefVoice, the backend interacts with Large Language Models (LLMs) via OpenRouter to generate structured summaries and extract action items from raw meeting transcripts. Because LLMs can hallucinate, output malformed data, or inject conversational filler, we have implemented a strict **four-layer guardrail system** to guarantee system stability and data integrity.

*Note: As this is a 100% TypeScript/Fastify application, we opted for native TypeScript validation ecosystems (Zod) rather than heavy cross-language bridges like the Python-based Guardrails AI Hub.*

---

## 1. Input Guardrail: Context Clamping
**Where it happens:** `workers/processMeeting.ts`

LLMs suffer from "lost in the middle" degradation and hard context-window limits. If a 4-hour meeting transcript is passed directly to the model, it may crash or truncate the response.
- **Mechanism:** Before sending the prompt, the backend clamps the transcript to a maximum of `120,000` characters. 
- **Benefit:** Protects the OpenRouter API request from throwing `400 Token Limit Exceeded` errors and ensures the model remains focused on high-quality extraction.

---

## 2. Behavioral Guardrail: Prompt Engineering
**Where it happens:** `services/openai.service.ts`

LLMs are naturally chatty. We use explicit, constraint-driven system prompts to restrict their behavior.
- **Mechanism:** The system prompt includes strict directives: `You must respond with ONLY raw JSON. No markdown formatting, no backticks, no conversational filler.`
- **Benefit:** Prevents the LLM from wrapping the JSON in ````json ... ```` blocks, which would normally break standard `JSON.parse()` methods.

---

## 3. API Guardrail: Native Structured Outputs
**Where it happens:** `services/openai.service.ts` (API Payload)

We leverage the latest capabilities of the OpenAI API standard to force deterministic outputs.
- **Mechanism:** Every request to the LLM includes the `response_format` configuration with `strict: true`. We pass a highly defined JSON Schema directly to the LLM.
- **Benefit:** The LLM's token generation is mathematically constrained to only output tokens that adhere to the provided schema. The model literally cannot output an invalid JSON key.

```typescript
response_format: {
  type: "json_schema",
  json_schema: {
    name: "action_item_schema",
    strict: true,
    schema: {
      type: "object",
      properties: { ... }
    }
  }
}
```

---

## 4. Execution Guardrail: Zod Runtime Validation
**Where it happens:** `services/openai.service.ts` (Post-Processing)

Even with API-level schemas, we must never trust external LLM data implicitly before saving it to our SQLite database. 
- **Mechanism:** We use **Zod** (`z.object({...})`) to parse and validate the incoming JSON string.
- **Benefit:** If the LLM somehow bypasses the structural schema (or if the API fails and returns an unexpected response), Zod will throw a strongly-typed error. This acts as a final firewall, ensuring that malformed data never corrupts the Prisma database or crashes the React frontend.

```typescript
// Zod catches any data anomalies before they hit the database
const parsedData = SummarySchema.parse(JSON.parse(content));
```

---

### Summary
By stacking **Input Limits → Behavioral Prompts → API Constraints → Runtime Validation**, BriefVoice achieves production-grade LLM reliability without needing external Python validation frameworks.
