# FitTrack Pro — Progress Tracker

> **Last updated:** 2026-06-12 (scaffolding completed)

---

## Project Status

- **Phase:** 0 — Project Scaffolding (completed)
- **Status:** Greenfield — no business features implemented

---

## Tech Stack

| Layer | Technology | Status |
|-------|-----------|--------|
| Frontend | Next.js 16.2.9, React 19.2.4, TypeScript 5.9.3, Tailwind CSS 4.3.0 | Scaffolded ✅ |
| Backend | NestJS 11.x, TypeScript 5.x, Prisma ORM | Scaffolded ✅ |
| Database | PostgreSQL via Docker | Not configured |
| Charts | Recharts | Not installed |
| Data Fetching | TanStack Query | Not installed |
| Client State | Zustand | Not installed |
| Forms | React Hook Form + Zod | Not installed |

---

## Completed Items

- [x] Project brief defined (`docs/PROJECT_BRIEF.md`)
- [x] Agent guide with conventions (`AGENTS.md`)
- [x] Progress tracker created (`PROGRESS.md`)
- [x] NestJS backend scaffolded in `backend/`
- [x] Next.js frontend scaffolded in `frontend/`
- [x] Root `.gitignore` created
- [x] Root `package.json` with pnpm workspaces created
- [x] `pnpm-workspace.yaml` created
- [x] Root `README.md` with setup instructions created
- [x] Both projects compile successfully

---

## Feature Checklist

### Core Infrastructure
- [ ] Docker Compose for PostgreSQL
- [x] Root `.gitignore`
- [x] Root `package.json` (pnpm workspaces)
- [x] `pnpm-workspace.yaml`
- [ ] TypeScript configs (root, backend, frontend)

### Backend (NestJS)
- [x] Scaffold NestJS in `backend/`
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
- [x] Scaffold Next.js in `frontend/`
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

- Next.js warns about duplicate lockfiles at root and in `frontend/` — minor, can be resolved by removing the nested `pnpm-lock.yaml`.
- `sharp` and `unrs-resolver` build scripts are blocked by pnpm — approve them with `pnpm approve-builds` if image optimization is needed.
- NestJS scaffolded without dependencies installed initially (used `--skip-install`); installed via pnpm workspaces.
- No Docker Compose for PostgreSQL yet — cannot run the app end-to-end without a database.

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
2. Write Prisma schema → migrate
3. Implement backend auth module
4. Implement frontend auth pages
5. Continue per MVP priority list in `AGENTS.md`

---

## Build & Run Commands

```bash
pnpm install
docker compose up -d
pnpm dev:backend   # starts NestJS at http://localhost:3000
pnpm dev:frontend  # starts Next.js at http://localhost:3001
```
