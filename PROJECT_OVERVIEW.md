# BriefVoice — Project Overview

> A single reference that explains **what the project is, what every piece does, why it exists, and how data flows through it.** If you read this top to bottom, you can answer almost any question about BriefVoice.

---

## 1. What is BriefVoice?

BriefVoice is an **AI meeting-intelligence platform**. You upload a meeting audio recording, and it turns that raw audio into structured, searchable, actionable knowledge:

- a **speaker-labelled transcript** (who said what, when),
- a **structured summary** (attendees, key decisions, discussion points, open questions, next steps),
- an **action-item checklist** (task + owner + deadline, checkable),
- a **semantic search** index so you can ask natural-language questions across all past meetings,
- **analytics** (speaking time, completion rates),
- and a **downloadable PDF report**.

**The problem it solves:** meetings lose information. Follow-ups slip, decisions can't be traced, and onboarding means replaying hours of calls. BriefVoice captures all of that automatically so a meeting becomes a permanent, queryable asset.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                            BriefVoice                                 │
│                                                                       │
│   ┌────────────────────┐         HTTP/JSON        ┌────────────────┐  │
│   │   Frontend (React) │ ───────────────────────▶ │  Backend API   │  │
│   │   Vite + TS        │ ◀─────────────────────── │  (Fastify/TS)  │  │
│   │   localhost:5173   │                           │ localhost:8000 │  │
│   └────────────────────┘                           └───────┬────────┘  │
│                                                             │            │
│                          ┌──────────────────────┬──────────┼──────────┐ │
│                          ▼                       ▼          ▼          ▼ │
│                   ┌────────────┐         ┌────────────┐ ┌────────┐ ┌────────┐
│                   │ AssemblyAI │         │ OpenRouter │ │ local  │ │ SQLite │
│                   │ transcribe │         │ gpt-4o-mini│ │ embeds │ │ Prisma │
│                   │ + diarize  │         │ summary +  │ │(xenova)│ │  DB    │
│                   └────────────┘         │ actions    │ └────────┘ └────────┘
│                                          └────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
```

**Two runnable apps:**
- **Backend** (`/Backend`) — a Fastify HTTP API in TypeScript. Owns all data, talks to the AI services, runs the async processing pipeline.
- **Frontend** (`/Frontend`) — a React + Vite single-page app. Pure UI; it only calls the backend's REST API.

**External/embedded services the backend uses:**
- **AssemblyAI** (external API) — speech-to-text + speaker diarization.
- **OpenRouter** (external API, model `openai/gpt-4o-mini`) — generates the summary and extracts action items.
- **@xenova/transformers** (runs *locally*, in-process) — generates text embeddings for semantic search. No external server, no extra API key.
- **SQLite via Prisma** — the single source of truth for all data (meetings, transcripts, summaries, action items, embeddings).

**Why these choices:**
- *Fastify* — fast, first-class TypeScript + schema validation, built-in Swagger.
- *SQLite* — zero-setup local DB, perfect for an MVP; Prisma makes it type-safe.
- *AssemblyAI* — diarization (“who spoke”) out of the box, which raw Whisper doesn’t give you cleanly.
- *OpenRouter* — one gateway, model-agnostic; we can swap `gpt-4o-mini` for any model without code changes.
- *Local embeddings* — keeps semantic search self-contained (no ChromaDB server or embedding API key to manage during a demo).

---

## 3. Tech Stack

| Layer | Tech | Why |
|---|---|---|
| Backend framework | Fastify 5 + TypeScript | Fast, typed, Swagger built in |
| DB | SQLite + Prisma ORM | Zero-setup, type-safe queries |
| Validation | Zod (`fastify-type-provider-zod`) | Runtime validation + auto Swagger schemas |
| File upload | `@fastify/multipart` | Streams large audio to disk |
| Transcription | AssemblyAI SDK | STT + diarization |
| Audio preprocessing | `ffmpeg` (system binary) | Normalizes any format → 16kHz mono WAV |
| LLM | OpenRouter (`openai/gpt-4o-mini`) via `openai` SDK | Summary + action items, structured JSON |
| Embeddings | `@xenova/transformers` (`all-MiniLM-L6-v2`) | Local 384-dim vectors |
| PDF | `pdfkit` | Report generation |
| Frontend | React 18 + Vite + TypeScript | SPA |
| Routing | `react-router-dom` | Page navigation |
| HTTP | `axios` | API client |
| Charts | `recharts` | Analytics donut chart |
| Icons | `lucide-react` | UI icons |

---

## 4. Repository Structure (what & why, file by file)

```
brief-voice/
├── Backend/                       # The API server
│   ├── prisma/
│   │   └── schema.prisma          # DB schema (the data model — see §5)
│   ├── src/
│   │   ├── app.ts                 # Server entry: registers plugins + routes, boots Fastify
│   │   ├── db/
│   │   │   └── prisma.ts          # Single shared PrismaClient instance
│   │   ├── routes/
│   │   │   ├── meetings.ts        # All /meetings endpoints (upload, list, detail, edit, delete, report)
│   │   │   ├── search.ts          # /search + /meetings/:id/index
│   │   │   └── analytics.ts       # /analytics/overview + /analytics/meeting/:id
│   │   ├── services/              # Business logic — no HTTP, pure functions
│   │   │   ├── assemblyai.service.ts  # transcribeAudio(): ffmpeg → upload → diarize
│   │   │   ├── openai.service.ts      # generateSummary(), extractActionItems() via OpenRouter
│   │   │   ├── search.service.ts      # embeddings, indexMeeting(), searchMeetings(), delete
│   │   │   ├── analytics.service.ts   # getSpeakingTime(), getOverviewStats()
│   │   │   └── pdf.service.ts         # generatePDFReport()
│   │   ├── workers/
│   │   │   └── processMeeting.ts  # The async pipeline that orchestrates the services
│   │   ├── schemas/
│   │   │   ├── meeting.ts          # Zod schemas for meeting routes
│   │   │   └── search.ts           # Zod schema for search query
│   │   └── utils/
│   │       └── file.ts             # Upload-dir helpers
│   ├── uploads/                    # Saved audio files (gitignored)
│   ├── reports/                    # (reserved for generated reports)
│   └── .env                        # API keys + config (gitignored)
│
├── Frontend/                       # The React SPA
│   ├── index.html                  # HTML shell, loads Inter font + main.tsx
│   ├── vite.config.ts              # Vite config (port 5173)
│   └── src/
│       ├── main.tsx                # React entry, wraps App in BrowserRouter
│       ├── App.tsx                 # Route table (which URL → which page)
│       ├── index.css               # Global dark theme + all component styles
│       ├── api/client.ts           # axios instance + typed API functions
│       ├── types/index.ts          # TS interfaces mirroring backend responses
│       ├── components/
│       │   ├── Sidebar.tsx         # Left nav (Upload / Meetings / Search / Analytics)
│       │   └── StatusBadge.tsx     # Status pill + formatMs() time helper
│       └── pages/
│           ├── UploadPage.tsx      # Drag-and-drop upload
│           ├── MeetingsPage.tsx    # Archive list of all meetings
│           ├── MeetingDetailPage.tsx # Tabs: summary / transcript / action items
│           ├── SearchPage.tsx      # Semantic search box + results
│           └── AnalyticsPage.tsx   # Stats cards + completion donut
│
├── setup.sh                        # One-shot install + DB sync for both apps
├── README.md                       # Project landing doc
├── PROJECT_OVERVIEW.md             # ← this file
├── TASK_*.md                       # Per-teammate task assignments (planning docs)
└── AI/
    ├── project.md                  # Original problem statement
    ├── phases.md                   # Original phased MVP plan
    └── implementation-plan.md      # Checkpoint plan used to build the remaining features
```

**Why the layering (routes → services → db):** routes only handle HTTP (parse request, validate, shape response). All real work lives in `services/`, which are plain async functions. This keeps logic testable and lets the background worker call the same functions the routes do.

---

## 5. The Data Model (Prisma schema)

Six tables, all hanging off `Meeting`. Everything cascades on delete, so removing a meeting cleans up all its derived data.

```
Meeting (1) ──┬──(1) Transcript ──(many) TranscriptSegment
              ├──(1) MeetingSummary
              ├──(many) ActionItem
              └──(many) Embedding
```

| Model | Purpose | Key fields |
|---|---|---|
| **Meeting** | The root record + lifecycle state | `id`, `filename`, `audioPath`, `status`, `createdAt` |
| **Transcript** | The full text output (1 per meeting) | `fullText` |
| **TranscriptSegment** | One diarized utterance — powers transcript view, speaking-time analytics, and search chunking | `speaker` (raw label e.g. "Speaker A"), `speakerName` (user-assigned), `text`, `startMs`, `endMs` |
| **MeetingSummary** | The structured summary (1 per meeting) | `attendees`, `keyDecisions`, `discussionPoints`, `openQuestions`, `nextSteps` — **stored as JSON-stringified arrays** |
| **ActionItem** | One extracted task | `task`, `owner?`, `deadline?`, `completed` |
| **Embedding** | One vector chunk for search | `chunkType` ("transcript"/"summary"), `speaker?`, `startMs?`, `text`, `vector` (JSON float array) |

**Two things worth knowing:**
1. **Summary arrays are stored as JSON strings** because SQLite has no array type. The API parses them back into real arrays before returning them (see `parseJsonArray` in the meetings route).
2. **Embeddings store the vector as a JSON string**, and cosine similarity is computed in app code — SQLite has no native vector type, and at MVP scale a full scan is plenty fast.

---

## 6. The Core Flow — From Upload to Knowledge

This is the heart of the system. When a user uploads audio:

```
1. POST /meetings/upload
      │  (meetings.ts)
      ├─ validate extension (.mp3/.wav/.m4a)
      ├─ stream file to Backend/uploads/
      ├─ reject if truncated/empty
      ├─ create Meeting row (status: "uploaded")
      └─ FIRE-AND-FORGET → processMeetingPipeline()   ← does NOT block the response
      │
      └─▶ responds immediately: { meetingId, filename, status: "uploaded" }

2. processMeetingPipeline(meetingId, audioPath)   (workers/processMeeting.ts)
      │
      ├─ status → "processing"
      ├─ wipe any partial prior data (retry-safe)
      │
      ├─ STEP 1: transcribeAudio()                (assemblyai.service.ts)
      │     ├─ ffmpeg converts input → 16kHz mono WAV
      │     ├─ upload WAV to AssemblyAI
      │     ├─ transcribe with speaker_labels: true
      │     └─ return { fullText, segments[] }    (segments = diarized utterances)
      │
      ├─ save Transcript + TranscriptSegment rows
      ├─ status → "transcribed"
      │
      ├─ build a SPEAKER-LABELLED transcript string ("Speaker A: ...")
      │     and clamp to 120k chars (context-window guard)
      │
      ├─ STEP 3: generateSummary(labelled, speakers)   (openai.service.ts)
      │     └─ OpenRouter returns strict JSON → save MeetingSummary
      │
      ├─ STEP 4: extractActionItems(labelled)          (openai.service.ts)
      │     └─ OpenRouter returns task/owner/deadline list → save ActionItem rows
      │
      ├─ STEP 5: indexMeeting(meetingId)               (search.service.ts)
      │     ├─ chunk = each transcript segment + each summary section
      │     ├─ embed each chunk locally (all-MiniLM-L6-v2 → 384-dim vector)
      │     └─ save Embedding rows
      │
      └─ status → "processed"   ✅   (or "error" if anything throws)
```

**Why fire-and-forget?** Transcription + LLM calls take 30s–2min. We respond to the upload instantly and let the worker run in the background. The frontend **polls** `GET /meetings/:id` every 4 seconds and watches `status` climb through the lifecycle until `processed`.

**Status lifecycle:** `uploaded → processing → transcribed → processed`, or `error` if a step fails. The worker writes `error` in a catch block so a failure never leaves a meeting stuck silently.

**Why feed the LLM a labelled transcript instead of `fullText`?** So the model can attribute decisions and action-item owners to the actual speaker ("Speaker A said he'd do X") instead of a flat anonymous wall of text. Combined with the speaker-rename feature, owners resolve to real names.

---

## 7. API Reference (every endpoint, what it does)

### Meetings (`routes/meetings.ts`)
| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/meetings/upload` | Upload audio, create meeting, kick off the pipeline |
| `GET` | `/meetings` | List all meetings (newest first) |
| `GET` | `/meetings/:id` | Full detail: transcript + segments, parsed summary arrays, action items |
| `PUT` | `/meetings/:id/speakers` | Rename diarized labels → real names (`{ labels: { "Speaker A": "Ritesh" } }`) |
| `PUT` | `/meetings/:id/action-items/:itemId` | Toggle a task complete/incomplete |
| `DELETE` | `/meetings/:id` | Delete meeting (cascades DB rows, removes audio file + embeddings) |
| `GET` | `/meetings/:id/report` | Download a PDF report |

### Search (`routes/search.ts`)
| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/search?q=...&limit=5` | Semantic search across all indexed meetings |
| `POST` | `/meetings/:id/index` | Manually (re)index a meeting into the vector store |

### Analytics (`routes/analytics.ts`)
| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/analytics/overview` | Totals: meetings, processed, action items, completion rate |
| `GET` | `/analytics/meeting/:id` | Speaking time per speaker for one meeting |

### Misc
| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/docs` | Swagger UI (auto-generated from Zod schemas) |

---

## 8. Semantic Search — How It Works (the RAG bit)

The "searchable archive" is a small retrieval-augmented setup, all local:

1. **Indexing** (`indexMeeting`, runs automatically after processing): each transcript segment and each summary section becomes a "chunk". Each chunk is embedded into a 384-dim normalized vector using the `all-MiniLM-L6-v2` model running locally via `@xenova/transformers`. Vectors are stored as JSON in the `Embedding` table with metadata (meetingId, speaker, startMs, chunkType).

2. **Searching** (`searchMeetings`): the query string is embedded the same way, then compared against every stored vector using **cosine similarity** (a simple dot product, since vectors are normalized). The top-N highest-scoring chunks are returned with their snippet, speaker, timestamp, and a relevance score.

**Why local instead of ChromaDB?** No separate server to run, no embedding API key, works offline. At MVP data sizes a linear scan over all embeddings is instant. (Trade-off: it wouldn't scale to millions of chunks — at that point you'd swap in a real vector DB, but the `search.service.ts` interface wouldn't change.)

**First-query note:** the embedding model (~90MB) downloads once on first use, then caches. The first search is slow; the rest are fast.

---

## 9. Analytics

Pure database aggregation, no AI:
- **Speaking time** — sums `endMs - startMs` per speaker across a meeting's segments (uses the assigned name if the speaker was renamed).
- **Overview** — counts meetings, processed meetings, total/completed action items, and computes a completion rate.

The frontend renders the overview as stat cards + a completion donut chart (`recharts`).

---

## 10. PDF Reports

`pdf.service.ts` uses `pdfkit` to render a report for a meeting: title, date, attendees, key decisions, discussion points, open questions, next steps, and the action-item checklist (with `[x]`/`[ ]` boxes). It's streamed back from `GET /meetings/:id/report` with a `Content-Disposition: attachment` header so the browser downloads it.

---

## 11. Frontend — Pages & User Flow

The SPA has four nav destinations (plus the detail page). The API client (`api/client.ts`) wraps every backend call in a typed function, and `types/index.ts` mirrors the backend's response shapes.

**Pages:**
- **Upload** (`/upload`) — drag-and-drop (or click) an audio file. Validates extension client-side, shows an upload progress bar, then redirects to the meeting detail page.
- **Meetings** (`/meetings`) — the archive. Lists every meeting as a card with filename, date, a colour-coded status badge, and a delete button.
- **Meeting Detail** (`/meetings/:id`) — three tabs:
  - *Summary* — the five structured sections.
  - *Transcript* — speaker-labelled segments with timestamps; click a speaker name to rename it (updates everywhere).
  - *Action Items* — checkable list; ticking a box persists via the toggle endpoint.
  - Plus a **Download PDF** button. While the meeting is still processing, the page **auto-polls** every 4s and updates the status live.
- **Search** (`/search`) — a debounced search box; results show the matching snippet, speaker, timestamp, and a relevance %. Clicking a result jumps to that meeting.
- **Analytics** (`/analytics`) — overview stat cards + the completion-rate donut.

**Typical user journey:**
```
Upload audio → (auto-redirect) → watch it process live →
read summary → rename speakers in transcript → check off action items →
download PDF → later: search across all meetings → glance at analytics
```

---

## 12. How to Run Locally

**Prereqs:** Node ≥ 18, `ffmpeg` installed, an AssemblyAI key, an OpenRouter key.

```bash
# one-shot setup (installs both apps, preps env + DB)
./setup.sh

# add keys to Backend/.env:
#   ASSEMBLYAI_API_KEY=...
#   OPENROUTER_API_KEY=...

# terminal 1
cd Backend && npm run dev      # http://localhost:8000  (+ /docs)

# terminal 2
cd Frontend && npm run dev     # http://localhost:5173
```

---

## 13. Key Design Decisions (the "why" cheat-sheet)

- **Fire-and-forget worker** — uploads return instantly; heavy AI work runs in the background, frontend polls for status. Keeps the UX snappy.
- **Services contain logic, routes are thin** — so the same functions are reusable by the worker and are easy to test.
- **Summary stored as JSON strings** — SQLite has no array column; parsed back at the API boundary.
- **Local embeddings + cosine in app code** — self-contained semantic search with no extra infra; fine at MVP scale.
- **Speaker-labelled transcript into the LLM** — better attribution of decisions and action-item owners.
- **Transcript length clamp (120k chars)** — protects the model's context window on very long meetings.
- **OpenRouter instead of a hardcoded provider** — model-agnostic; swap models without code changes.
- **Cascade deletes everywhere** — deleting a meeting reliably cleans transcript, summary, action items, and embeddings.
- **Status = `error` on failure** — failures are visible in the UI, never silent.

---

## 14. Known Gotchas / Things to Mention if Asked

- The docs originally said **Gemini + ChromaDB**; the actual implementation uses **OpenRouter + local embeddings**. Docs have been reconciled to match the code.
- The local dev SQLite DB may contain **leftover test meetings** from earlier development — the `/meetings` list shows everything in the DB, not just your session's uploads.
- **First semantic search is slow** (embedding model download), then cached.
- **`ffmpeg` is a hard dependency** for transcription — without it, the transcode step fails and the meeting goes to `error`.
- There are **no automated tests yet** — verification so far is manual / via the API.
- `uploads/`, `reports/`, and the `.db` file are **gitignored** (not committed).
