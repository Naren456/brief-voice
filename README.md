# BriefVoice - AI Meeting Intelligence Platform

BriefVoice is an end-to-end meeting intelligence tool built for Assignment 3: Voice + RAG. It turns a meeting recording into a speaker-labelled transcript, structured summary, action item checklist, searchable archive, and analytics dashboard so meeting decisions and follow-ups are easier to trace.

**Live Demo:** https://brief-voice-g8nx.vercel.app/

The project focuses on the full assignment flow: upload audio, process it with transcription and diarisation, extract useful meeting intelligence with an LLM, index the result for semantic search, and present everything in a clean React dashboard.

## Key Features

- Audio transcription with AssemblyAI for uploaded meeting recordings.
- Speaker diarisation with transcript segments grouped by speaker labels.
- Speaker renaming so system labels can be mapped to real participant names after processing.
- Structured meeting summaries with attendees, key decisions, discussion points, open questions, and next steps.
- Action item extraction with task, owner, deadline, and completion status.
- Searchable archive powered by embeddings and Qdrant for natural language queries across past meetings.
- Meeting analytics for speaking time, meeting activity, action item completion, and recurring topics.
- PDF report export for sharing processed meeting intelligence.
- Swagger API documentation for backend testing and review.

## Tech Stack

**Frontend:** React, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand, Recharts, Radix UI, Lucide icons.

**Backend:** Fastify, TypeScript, Prisma, PostgreSQL, Zod, PDFKit.

**AI and Search:** AssemblyAI for transcription and diarisation, OpenRouter/OpenAI-compatible API for summaries and action items, Qdrant for vector search, Xenova Transformers for embeddings.

## Project Structure

```text
brief-voice/
  Backend/
    api/                 Serverless entrypoint
    prisma/              Prisma schema and migrations
    src/
      db/                Prisma and Qdrant clients
      routes/            Meetings, search, and analytics APIs
      schemas/           Zod validation schemas
      services/          AI, search, analytics, and PDF services
      workers/           Meeting processing pipeline
      app.ts             Fastify app setup
      server.ts          Local server entrypoint
  Frontend/
    public/              Static assets
    src/
      app/               App shell and routing
      components/        UI, upload, meeting, vault, analytics, settings
      hooks/             Query and workflow hooks
      pages/             Main application pages
      services/          API clients
      store/             Zustand stores
      styles/            Global styles
      types/             Shared frontend types
  README.md
```

## Main Workflow

1. A user uploads a meeting audio file from the frontend.
2. The backend stores the upload and creates a meeting record.
3. The processing worker sends audio to AssemblyAI for transcription and speaker diarisation.
4. Transcript text is passed to the LLM service for summary and action item extraction.
5. Transcript and summary content are embedded and indexed in Qdrant.
6. The frontend displays the processed meeting, speaker-labelled transcript, action items, analytics, and search results.

## Getting Started

### Prerequisites

- Node.js 18 or newer
- npm
- PostgreSQL database
- Qdrant instance, local or hosted
- AssemblyAI API key
- OpenRouter API key

### Backend Setup

```bash
cd Backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

Backend runs on `http://localhost:8000` by default. Swagger docs are available at `http://localhost:8000/docs`.

Update `Backend/.env` with:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
ASSEMBLYAI_API_KEY=your_assemblyai_key
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_SITE_URL=http://localhost:8000
OPENROUTER_APP_NAME=BriefVoice Platform
PORT=8000
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=briefvoice_meetings
```

### Frontend Setup

```bash
cd Frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on the Vite URL shown in the terminal, usually `http://localhost:5173`.

Update `Frontend/.env` if needed:

```env
VITE_API_URL=http://localhost:8000
VITE_USE_MOCK_API=false
```

## Important API Routes

- `POST /meetings/upload` - upload and start processing an audio file.
- `GET /meetings` - list all meetings.
- `GET /meetings/:id` - get transcript, summary, action items, and meeting details.
- `PUT /meetings/:id/speakers` - rename diarised speaker labels.
- `PUT /meetings/:id/action-items/:itemId` - update action item completion.
- `GET /meetings/:id/report` - download a PDF meeting report.
- `GET /search?q=...&limit=5` - semantic search across the archive.
- `POST /meetings/:id/index` - re-index a meeting for search.
- `GET /analytics` and `GET /analytics/overview` - dashboard analytics.
- `GET /analytics/meeting/:id` - speaking-time analytics for one meeting.

## Assignment Coverage

- **Transcription:** AssemblyAI converts uploaded audio into text.
- **Diarisation:** transcript segments keep speaker labels and timings.
- **Action items:** LLM output is stored with owner, deadline, and completion status.
- **Structured summary:** summaries follow the required assignment sections.
- **Searchable archive:** Qdrant enables natural language retrieval over transcripts and summaries.
- **Analytics:** backend routes and frontend charts show speaking time, meeting frequency, completion rate, and repeated discussion patterns.

## Team Contributions

- **Narendra / Naren456:** Set up the initial backend with Fastify, Prisma, SQLite/PostgreSQL support, upload APIs, meeting routes, AssemblyAI transcription, OpenAI/OpenRouter processing, Docker, Vercel/serverless setup, Qdrant configuration, and deployment fixes.
- **Ritesh Prajapati:** Added semantic search with embeddings and cosine ranking, analytics routes and service logic, speaker-labelled transcript input for the LLM, transcript clamping, meeting detail APIs, speaker rename, action item toggle, and delete endpoints.
- **Harshita:** Verified the real audio processing pipeline, improved backend meeting APIs, added upload validation, analytics APIs, PDF report download, PDF guardrails, repository hygiene updates, and completion documentation.
- **Yatharth:** Built the initial frontend application structure with pages, components, hooks, services, stores, settings UI, analytics UI, upload UI, meeting detail UI, mock data, and styling/configuration.
- **Mohit:** Worked on frontend search and vault-related UI, search service integration, meeting archive browsing, filtering support, and connecting search results with meeting data.

## Evaluation Notes

For a strong demo, use a clear recording with at least three speakers and several explicit follow-ups. After upload, verify the transcript, rename speakers, check extracted action items, run at least five archive searches, and show the analytics dashboard plus PDF report export. This directly maps to the assignment success metrics for transcription quality, diarisation, action item extraction, semantic search, structured summaries, and analytics.

## Repository Hygiene

Only the root `README.md` is kept as project documentation. Local secrets, dependencies, build output, logs, uploads, generated reports, local databases, and vector-store data are ignored through `.gitignore`. Keep `.env.example` files committed so reviewers can configure the project without exposing private keys.
