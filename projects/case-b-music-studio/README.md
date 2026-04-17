# Case B: Music Studio Infrastructure

## Client
Mr. O'Neal (Music Teacher)

## Problem
Lesson materials are scattered. Scheduling requires manual back-and-forth. No centralized system to track individual student progress.

## Goal
Build a centralized "Resource Hub" for reusable lesson materials and a "Music Student Profile" database tracking instruments, genres, song lists, and theory levels.

## Planned Features
- Centralized resource hub with searchable lesson materials
- Music Student Profile database (instruments, genres, current songs, theory level)
- Automated scheduling reminders/bookings
- AI auto-tagging for sheet music and materials (e.g., "Intermediate / Jazz / Saxophone")
- AI voice transcription for post-lesson summaries that auto-update student profiles

## Team
| Role | Name |
|------|------|
| Developer | Serena Zhang |
| Developer | JT Gannon |

## Setup

From this folder (`projects/case-b-music-studio/`):

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). To build a production bundle:

```bash
npm run build
npm run preview   # optional local preview of the build
```

**Data:** The app uses **mock students and mock teaching resources** only. Google Forms / Sheets (and other APIs) will replace the sample data later.

## App structure (prototype)

- **Dashboard** — roster count, student name search (links to Students with profile open), placeholders for recent updates and upcoming lessons.
- **Students** — directory with filters; clicking a student opens an **inline profile panel** (no separate profile URL).
- **Resource Hub** — categorized mock materials (sheet music, exercises, warmups, etc.) with search and category filter.

## Status
🟢 Frontend MVP — dashboard, inline student profiles, resource hub (prototype UI)
