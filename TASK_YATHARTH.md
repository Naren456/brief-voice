# 📊 Task Assignment — Yatharth Khattri

**Role:** Analytics & DevOps  
**Email:** yatharth.24bcs10165@sst.scaler.com  
**Project:** BriefVoice — AI Meeting Intelligence Platform  

---

## 🎯 Your Ownership

You are responsible for **meeting analytics** and ensuring the project **runs reliably** for the demo. For the MVP, focus on getting basic analytics working and making sure the app is easy to run locally for everyone on the team.

---

## ✅ Task Checklist

### Phase 1 — MVP Analytics (Core Priority)

- [x] **Speaking Time per Participant**
  - [x] Use the `TranscriptSegment` data (from Ritesh) which has `startMs` and `endMs`
  - [x] Calculate total speaking duration per speaker label
  - [x] Create: `GET /analytics/meeting/:id` — Per-meeting breakdown

- [x] **Meeting Overview Stats**
  - [x] Total meetings count
  - [x] Total action items and how many are completed
  - [x] Create: `GET /analytics/overview` — Dashboard summary numbers

- [x] **Action Item Completion Rate**
  - [x] Use action items from Narendra's Prisma table
  - [x] Compute: `completedCount / totalCount * 100`
  - [x] Include in `GET /analytics/overview`

---

### Phase 2 — Dev Setup & Environment (Very Important for Team)

- [x] **Write a proper local setup script** — So every team member can run the project in one shot
  - [x] Create `setup.sh` in the root
    ```bash
    #!/bin/bash
    cd Backend
    npm install
    cp .env.example .env
    npx prisma generate
    npx prisma migrate dev --name init
    echo "✅ Setup complete. Run: npm run dev"
    ```
  - [x] Test it on a fresh clone

- [x] **Docker Compose** *(do this only if time allows after MVP is working)*
  - [x] `Dockerfile` for the backend
  - [x] `docker-compose.yml` with backend + ChromaDB services

---

### Phase 3 — Stretch Goals *(Only after MVP features work)*

- [x] Recurring topics detection (use Narendra's topic extraction output)
- [x] Meeting frequency tracking over time
- [x] Simple bar chart data endpoint for the frontend

---

## 📁 Your Primary Files

```
Backend/
├── src/
│   ├── routes/
│   │   └── analytics.ts          ← Main ownership
│   └── services/
│       └── analytics.service.ts  ← Create this (new file)
│
BriefVoice/
└── setup.sh                      ← Create this for team setup
```

---

## 🛠️ Implementation Guide

### Analytics Service (MVP)

```typescript
// src/services/analytics.service.ts
import { prisma } from '../db/prisma';

// Speaking time per speaker for a single meeting
export async function getSpeakingTime(meetingId: string) {
  const segments = await prisma.transcriptSegment.findMany({
    where: { transcript: { meetingId } },
  });

  const speakerTime: Record<string, number> = {};
  for (const seg of segments) {
    const name = seg.speakerName || seg.speaker;
    speakerTime[name] = (speakerTime[name] || 0) + (seg.endMs - seg.startMs);
  }
  return speakerTime; // e.g. { "Ritesh": 45200, "Narendra": 31000 } (ms)
}

// Global overview stats
export async function getOverviewStats() {
  const [totalMeetings, totalActionItems, completedItems] = await Promise.all([
    prisma.meeting.count(),
    prisma.actionItem.count(),
    prisma.actionItem.count({ where: { completed: true } }),
  ]);

  return {
    totalMeetings,
    totalActionItems,
    completedItems,
    completionRate: totalActionItems > 0
      ? Math.round((completedItems / totalActionItems) * 100)
      : 0,
  };
}
```

### Analytics Routes

```typescript
// src/routes/analytics.ts
import { FastifyInstance } from 'fastify';
import { getSpeakingTime, getOverviewStats } from '../services/analytics.service';

export default async function analyticsRoutes(app: FastifyInstance) {
  // Dashboard overview
  app.get('/analytics/overview', async () => {
    return getOverviewStats();
  });

  // Per-meeting speaking time breakdown
  app.get('/analytics/meeting/:id', async (req) => {
    const { id } = req.params as { id: string };
    return getSpeakingTime(id);
  });
}
```

---

## 🔗 APIs You Own

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/analytics/overview` | Total meetings, action items, completion rate |
| `GET` | `/analytics/meeting/:id` | Speaking time per speaker for one meeting |

> **MVP scope** — just these two endpoints are enough for the demo.

---

## 🤝 Dependencies

- **Depends on:** Ritesh's `TranscriptSegment` table (needs `startMs`, `endMs`, `speaker`)
- **Depends on:** Narendra's `ActionItem` table
- **Feeds into:** Harshita's Analytics page (she'll display your numbers as charts)

---

## 📦 Resources

- [Prisma Aggregations](https://www.prisma.io/docs/orm/prisma-client/queries/aggregations-groupby-summarizing)
- [Fastify Route Params](https://fastify.dev/docs/latest/Reference/Routes/)

---

*Team BriefVoice — Scaler School of Technology, 2026*
