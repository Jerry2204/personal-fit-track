# FitTrack Pro — Progress Tracker

> **Last updated:** 2026-06-14 (Dashboard layout: Topbar + EmptyState)

---

## Project Status

- **Phase:** 3 — Dashboard UI/UX
- **Status:** Dashboard redesign completed with "Plus Jakarta Sans" typography, deeper structural shadows, unified consistent cards, and a dynamic glassmorphic sidebar. Lifted sidebar layout state to automatically adapt main content width when collapsed.

---

## Tech Stack

| Layer | Technology | Status |
|-------|-----------|--------|
| Frontend | Next.js 16.2.9, React 19.2.4, TypeScript 5.9.3, Tailwind CSS 4.3.0 | Scaffolded ✅ |
| Backend | NestJS 11.x, TypeScript 5.x, Prisma ORM | Scaffolded ✅ |
| Database | PostgreSQL 16 via Docker (docker-compose) | Configured ✅ |
| Charts | Recharts 3.8.1 | Installed ✅ |
| Data Fetching | TanStack Query 5.101.0 | Installed ✅ |
| Client State | Zustand 5.0.14 | Installed ✅ |
| Forms | React Hook Form 7.78 + Zod 4.4 | Installed ✅ |

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
- [x] `docker-compose.yml` with PostgreSQL 18 Alpine
- [x] `.env.example` with database, JWT, and API URL vars
- [x] Docker PostgreSQL configured and ready to start
- [x] Shadcn UI components (Button, Input, Label, Card)
- [x] Landing page
- [x] Auth pages (Login, Register)
- [x] Dashboard layout with auth guard
- [x] Dashboard placeholder page
- [x] Zustand auth store with JWT persistence
- [x] API client with auth header injection
- [x] Dashboard premium redesign (sidebar nav, stat cards, weekly overview, activity lists, goals, body progress, personal records)
- [x] Shadcn UI components (Avatar, Badge, Progress, Separator, Skeleton)
- [x] Loading skeletons for dashboard
- [x] Micro-interactions and animations
- [x] Realistic mock fitness data (3 months of activity)
- [x] Theme system with dark/light toggle (localStorage persistence)
- [x] Flash-prevention script for SSR theme hydration
- [x] Improved color contrast (WCAG AA compliance)
- [x] Cards visually distinct from background in dark mode

---

## Feature Checklist

### Core Infrastructure
- [x] Docker Compose for PostgreSQL
- [x] Root `.gitignore`
- [x] Root `package.json` (pnpm workspaces)
- [x] `pnpm-workspace.yaml`
- [ ] TypeScript configs (root, backend, frontend)

### Backend (NestJS)
- [x] Scaffold NestJS in `backend/`
- [x] Prisma installed and configured in `backend/`
- [x] PrismaService + PrismaModule (NestJS integration)
- [x] Prisma schema — MVP entities
- [ ] Database migrations (run `npx prisma migrate dev`)
- [ ] Seed data
- [x] AuthModule (register, login, JWT)
- [x] UsersModule
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
- [x] Shadcn UI setup (Button, Input, Label, Card, Avatar, Badge, Progress, Separator, Skeleton)
- [x] Auth pages (Login, Register)
- [ ] Forgot password page
- [x] Landing page
- [x] Dashboard layout with sidebar navigation
- [x] Topbar with page title, theme toggle, and user avatar
- [x] EmptyState component
- [x] Dashboard analytics with mock data
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
- [x] Dark/light mode toggle

### Database Entities (MVP)
- [x] User
- [x] Profile
- [x] Exercise
- [x] Workout
- [x] WorkoutExercise
- [x] WorkoutSet
- [x] RunActivity
- [x] BodyProgress
- [x] Goal
- [x] HabitLog
- [x] Shoe

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
| ORM | Prisma 7 (prisma-client-js) | Type-safe, auto-generated client, migrations (<code>prisma-client-js</code> generator used for NestJS CommonJS compatibility) |
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
- Docker PostgreSQL configured but not running by default — run `docker compose up -d` before starting backend.
- `.env` must be created from `.env.example` before backend can connect.
- Prisma v7 uses `prisma-client-js` generator (traditional). Generated client is bundled into `@prisma/client` via pnpm store.
- `prisma.config.ts` was auto-generated by Prisma v7 `init`; it loads dotenv for Prisma CLI commands.
- `backend/.env` contains the `DATABASE_URL` for Docker PostgreSQL; must be kept in sync with `.env.example`.
- Prisma schema has 11 models, 12 enums. Schema uses `prisma-client-js` generator.
- `Workout` → `WorkoutExercise` → `WorkoutSet` 3-level hierarchy represents the workout structure.
- `Shoe` is optional on `RunActivity` (`shoeId` nullable).
- `Exercise.isCustom` + `createdByUserId` allows user-defined exercises alongside the library.
- Prisma v7 requires a driver adapter for PostgreSQL (`@prisma/adapter-pg` + `pg`) passed to `PrismaClient` constructor.
- `prisma-client-js` generator in Prisma v7 internally uses the new "client" engine type; adapter is mandatory.
- `dotenv/config` imported in `main.ts` to load `.env` before NestJS bootstraps.
- JWT secret is hardcoded in `.env`; change in production.
- Frontend uses client-side auth guard in layout — no Next.js proxy/middleware for route protection yet.
- Auth token stored in localStorage via Zustand persist — vulnerable to XSS; adequate for MVP.
- Zod v4 is used — verify `@hookform/resolvers` compatibility if issues arise.
- Dark mode `--card` is `240 6% 7%` vs `--background` `240 10% 3.9%` — subtle but visible surface separation.

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

1. Implement remaining pages (Workouts, Running, etc.) linking from sidebar
2. Implement ProfileModule (backend) + Settings page (frontend)
3. Implement ExercisesModule + Exercise library page
4. Continue per MVP priority list in `AGENTS.md`

---

## Build & Run Commands

```bash
pnpm install
docker compose up -d
pnpm dev:backend   # starts NestJS at http://localhost:3000
pnpm dev:frontend  # starts Next.js at http://localhost:3001
```
