# BriefVoice — Frontend

Premium AI meeting intelligence dashboard. Dark-mode-only, developer-centric minimalism.

## Stack

- React 19 + TypeScript + Vite
- TailwindCSS (BriefVoice design tokens) + shadcn-style primitives
- TanStack Query + Axios for data
- Zustand for client state (player, upload pipeline, UI)
- React Router for routing
- Framer Motion for subtle motion
- Recharts for analytics
- Lucide React for icons

## Run

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_URL` to point at the Fastify backend (`http://localhost:3000`) and
set `VITE_USE_MOCK_API=false` to switch off the local mock adapter.

## Layout

- `src/app/` — bootstrap, providers, router
- `src/components/layout/` — Sidebar, Topbar, AudioDock, AppShell
- `src/components/ui/` — Button, Card, Badge, Input, Skeleton, EmptyState, Kbd
- `src/components/meetings|analytics|vault/` — feature primitives
- `src/features/` — feature-level orchestration (upload, vault, meeting, analytics)
- `src/services/` — Axios client + mock adapter + per-domain services
- `src/store/` — Zustand stores
- `src/hooks/` — TanStack Query hooks
- `src/pages/` — top-level routes
- `src/types/` — shared TypeScript contracts

## Routes

- `/` Ingestion Gateway
- `/vault` Vault Archive (semantic search)
- `/meeting/:id` Meeting Workspace
- `/analytics` Global Intelligence Dashboard
