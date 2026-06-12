# FitTrack Pro — Progress Tracker

> **Last updated:** 2026-06-12

---

## Project Status

- **Phase:** 0 — Project Scaffolding (not started)
- **Status:** Greenfield — no business features implemented

---

## Tech Stack

| Layer | Technology | Status |
|-------|-----------|--------|
| Frontend | Next.js 18+, React 18+, TypeScript, Tailwind CSS, Shadcn UI | Not scaffolded |
| Backend | NestJS 11+, TypeScript, Prisma ORM, JWT Auth | Not scaffolded |
| Database | PostgreSQL 18 via Docker | Not configured |
| Charts | Recharts | Not installed |
| Data Fetching | TanStack Query | Not installed |
| Client State | Zustand | Not installed |
| Forms | React Hook Form + Zod | Not installed |

---

## Completed Items

- [x] Project brief defined (`docs/PROJECT_BRIEF.md`)
- [x] Agent guide with conventions (`AGENTS.md`)
- [x] `backend/` directory created (empty)
- [x] `frontend/` directory created (empty)
- [x] Root monorepo structure initialized
- [x] Progress tracker created (`PROGRESS.md`)

---

## Feature Checklist

### Core Infrastructure
- [ ] Docker Compose for PostgreSQL
- [ ] Root `.gitignore`
- [ ] Root `package.json` (pnpm workspaces)
- [ ] TypeScript configs (root, backend, frontend)

### Backend (NestJS)
- [ ] Scaffold NestJS in `backend/`
- [ ] Prisma schema — MVP entities
- [ ] Database migrations
- [ ] Seed data
- [ ] AuthModule (register, login, JWT)
- [ ] UsersModule
- [ ] ProfileModule
- [ ] ExercisesModule
- [ ] WorkoutsModule (with WorkoutExercise, WorkoutSet)
- [ ] RunsModule
- [ ] BodyProgressModule
- [ ] GoalsModule
- [ ] HabitLogsModule
- [ ] DashboardModule
- [ ] ReportsModule
- [ ] ShoesModule
- [ ] AchievementsModule (post-MVP)
- [ ] Swagger/OpenAPI docs

### Frontend (Next.js)
- [ ] Scaffold Next.js in `frontend/`
- [ ] Shadcn UI setup
- [ ] Auth pages (Login, Register, Forgot Password)
- [ ] Landing page
- [ ] Dashboard layout & analytics
- [ ] Exercise library page
- [ ] Gym workout list / add / detail pages
- [ ] Running tracker / add activity pages
- [ ] Body progress page
- [ ] Goals page
- [ ] Calendar view
- [ ] Monthly report page
- [ ] Yearly report page
- [ ] Personal records page
- [ ] Settings page
- [ ] Dark/light mode toggle

### Database Entities (MVP)
- [ ] User
- [ ] Profile
- [ ] Exercise
- [ ] Workout
- [ ] WorkoutExercise
- [ ] WorkoutSet
- [ ] RunActivity
- [ ] BodyProgress
- [ ] Goal
- [ ] HabitLog
- [ ] Shoe

### Post-MVP Entities
- [ ] Achievement
- [ ] WorkoutPlan
- [ ] RunningPlan
- [ ] MonthlyReport (prefer computed)
- [ ] YearlyReport (prefer computed)

### Advanced Features
- [ ] Progressive overload tracking
- [ ] Shoe mileage tracking
- [ ] Simple nutrition tracking (calories, protein, water)
- [ ] Recovery tracking (sleep, soreness, fatigue)
- [ ] Search & filter
- [ ] CSV export
- [ ] PDF export
- [ ] Email reminders
- [ ] Gamification (streaks, badges, levels)
- [ ] Seed demo data

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monorepo | pnpm workspaces | Simple, native, no extra tooling |
| ORM | Prisma | Type-safe, auto-generated client, migrations |
| Auth | JWT via passport | Stateless, standard NestJS pattern |
| Database | PostgreSQL 18 | Robust, Prisma-native, JSON support |
| UI library | Shadcn UI | Unstyled, copy-paste, customizable |
| Charts | Recharts | React-native, declarative, popular |
| Forms | React Hook Form + Zod | Performant, type-safe validation |
| Server state | TanStack Query | Caching, refetch, pagination |
| Client state | Zustand | Minimal boilerplate, no providers |
| Version strategy | Scaffolding defaults | Use `create-next-app` / `nest new` defaults; pin later only if needed |

---

## Known Issues / Limitations

- None yet — no implementation has started.

---

## Testing Status

| Layer | Framework | Status |
|-------|-----------|--------|
| Backend unit | Jest (NestJS default) | Not configured |
| Backend e2e | Jest (supertest) | Not configured |
| Frontend unit | Vitest or Jest | Not configured |
| Frontend e2e | Playwright or Cypress | Not configured |

---

## Next Steps (Recommended Order)

1. Create `docker-compose.yml` for PostgreSQL
2. Add root `package.json` with pnpm workspaces
3. Add `.gitignore`
4. Scaffold NestJS backend
5. Scaffold Next.js frontend
6. Write Prisma schema → migrate
7. Implement backend auth module
8. Implement frontend auth pages
9. Continue per MVP priority list in `AGENTS.md`

---

## Build & Run Commands

Commands will be documented here once scaffolding is complete.

Estimated:
```bash
pnpm install
docker compose up -d
pnpm dev:api    # backend
pnpm dev:web    # frontend
```
