# FitTrack Pro — Agent Guide

## Agent Instructions

Read this entire file before starting any task.

You are helping build **FitTrack Pro**, a serious fullstack portfolio project for personal fitness tracking.

The single source of truth for product requirements is:

* `docs/PROJECT_BRIEF.md`

Do not invent random features outside the project brief unless explicitly requested.

---

## Current Project State

This is a greenfield project.

Current folders:

```txt
/
├── backend/        # NestJS API
├── frontend/       # Next.js app
├── docs/
│   └── PROJECT_BRIEF.md
└── AGENTS.md
```

If `backend/` or `frontend/` already exist and are empty, scaffold into them carefully.
If scaffolding tools fail because the folders already exist, explain the issue first and suggest the safest fix.

---

## Product Goal

Build **FitTrack Pro**, a practical fitness productivity application for:

* Gym workout tracking
* Running activity tracking
* Body progress tracking
* Daily habit tracking
* Goals
* Calendar view
* Dashboard analytics
* Monthly and yearly reports
* Personal records
* Shoe mileage tracking
* Simple nutrition tracking
* Gamification

This app is not AI-focused.
It should feel like a real product and be suitable as a software engineer portfolio project.

---

## Recommended Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Shadcn UI
* Recharts
* TanStack Query
* Zustand where client state is needed
* React Hook Form + Zod for forms and validation

### Backend

* NestJS
* TypeScript
* PostgreSQL
* Prisma ORM
* JWT authentication
* REST API
* Swagger/OpenAPI documentation

### Optional Later

* Redis for caching dashboard statistics
* Docker for local development
* Sentry for error monitoring
* PDF export
* CSV export
* Reminder system

---

## Version Strategy

- Use scaffolding tool defaults (`create-next-app`, `nest new`, etc.) for initial project setup.
- Do **not** force exact versions from `docs/PROJECT_BRIEF.md` during scaffolding — those are aspirational targets, not constraints.
- After the project builds successfully and core features work, important dependencies (Prisma, NestJS, Next.js, etc.) can be reviewed and pinned if necessary.

---

## Architecture Rules

Keep frontend and backend clearly separated.

Backend rules:

* Use modular NestJS structure.
* Use Controller, Service, DTO, Entity/Prisma model separation.
* Use DTO validation.
* Use guards for protected routes.
* Use pagination for list endpoints.
* Use proper error handling.
* Use database indexes for frequently queried fields.
* Keep business logic in services, not controllers.
* Do not expose password hashes.
* Use consistent API response shapes.

Frontend rules:

* Use App Router.
* Use reusable components.
* Use mobile-first layout.
* Use clean dashboard UI with cards, charts, tables, and progress indicators.
* Add loading states.
* Add empty states.
* Add error states.
* Keep forms simple and user-friendly.
* Use feature-based folders where possible.

---

## Development Workflow

Do not build the whole app at once.

For every task:

1. Read `docs/PROJECT_BRIEF.md`.
2. Understand the requested scope.
3. Create a short implementation plan.
4. Implement only the requested scope.
5. Avoid unrelated changes.
6. Run available checks if possible.
7. Explain changed files.
8. Explain how to test.
9. Suggest the next logical step.

---

## MVP Priority

Build the app in this order:

1. Project scaffolding
2. Docker PostgreSQL setup
3. Prisma schema
4. Backend authentication
5. Frontend authentication
6. Dashboard layout
7. Exercise library
8. Gym workout tracker
9. Running tracker
10. Body progress tracker
11. Goals
12. Habit log
13. Dashboard analytics
14. Charts
15. Monthly report
16. Yearly report
17. Personal records
18. Shoe mileage tracker
19. Export CSV/PDF
20. Reminders
21. Gamification
22. UI polish
23. Seed demo data
24. README and portfolio documentation
25. Deployment

---

## MVP Database Entities

Start with:

* User
* Profile
* Exercise
* Workout
* WorkoutExercise
* WorkoutSet
* RunActivity
* BodyProgress
* Goal
* HabitLog
* Shoe

Add later:

* Achievement
* WorkoutPlan
* RunningPlan
* MonthlyReport
* YearlyReport

Prefer computed reports for the first MVP instead of storing monthly and yearly reports too early.

---

## Backend Module Priority

Implement backend modules in this order:

1. AuthModule
2. UsersModule
3. ProfileModule
4. ExercisesModule
5. WorkoutsModule
6. RunsModule
7. BodyProgressModule
8. GoalsModule
9. HabitLogsModule
10. DashboardModule
11. ReportsModule
12. ShoesModule
13. AchievementsModule

---

## Frontend Page Priority

Implement frontend pages in this order:

1. Landing page
2. Login page
3. Register page
4. Dashboard page
5. Exercise library page
6. Gym workout list page
7. Add workout page
8. Workout detail page
9. Running tracker page
10. Add running activity page
11. Body progress page
12. Goals page
13. Calendar page
14. Monthly report page
15. Yearly report page
16. Personal records page
17. Settings page

---

## Features to Postpone

Do not implement these too early:

* PDF export
* Email reminders
* Push notifications
* Progress photo upload
* Advanced gamification
* Redis caching
* Sentry
* Complex report storage
* Complex calendar drag-and-drop
* Advanced analytics beyond dashboard summary

These can be added after the core app works.

---

## Code Quality Rules

Always prefer:

* Simple and readable code
* Clear naming
* Small functions
* Strong typing
* Reusable components
* Consistent folder structure
* Explicit validation
* Clean API contracts
* Realistic database relations

Avoid:

* Overengineering
* Random abstractions
* Unused packages
* Fake features
* Giant components
* Giant services
* Hardcoded user IDs
* Business logic inside UI components
* Business logic inside controllers

---

## Git / Safety Rules

Before major changes, explain the plan.

After implementation, summarize:

* Files created
* Files changed
* Commands to run
* How to test
* Known limitations

Do not delete existing user code unless explicitly asked.

---

## First Task Recommendation

The first implementation task should be:

1. Scaffold `backend/` with NestJS.
2. Scaffold `frontend/` with Next.js.
3. Add root-level documentation.
4. Add `.gitignore`.
5. Add basic Docker Compose for PostgreSQL.
6. Do not implement auth yet.
7. Do not implement UI features yet.

After scaffolding, the next task should be Prisma schema design.

## Progress Tracking Rules

Always update `PROGRESS.md` after completing a task.

After every implementation task, update:

1. Current project phase
2. Completed items
3. In-progress items
4. Next recommended steps
5. Technical decisions made
6. Known issues or limitations
7. Files changed summary
8. Testing status

Rules:

- Do not remove previous important progress notes.
- Keep the progress file concise but useful.
- Use checklists where possible.
- Add the date of the update.
- If a task fails or is incomplete, document it honestly.
- If no code was changed, still update the progress file with the planning result.