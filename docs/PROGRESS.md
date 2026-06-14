# FitTrack Pro — Progress

## Current Phase
**Phase:** UI Polish & Help System

## Completed

### Project Foundation
- [x] Backend scaffolded with NestJS
- [x] Frontend scaffolded with Next.js
- [x] Docker Compose for PostgreSQL
- [x] Root `.gitignore` with environment/IDE rules
- [x] `AGENTS.md` for development guidance
- [x] `docs/PROJECT_BRIEF.md` — single source of truth

### Database
- [x] Prisma schema with all MVP entities
- [x] Database migrations applied
- [x] Seed script for demo data

### Backend Authentication
- [x] JWT auth (login, register, protected routes)
- [x] `JwtAuthGuard` and `CurrentUser` decorator
- [x] User profile management (CRUD)

### Backend Modules
- [x] AuthModule
- [x] UsersModule
- [x] ProfileModule
- [x] ExercisesModule
- [x] WorkoutsModule (with WorkoutExercise, WorkoutSet)
- [x] RunsModule
- [x] BodyProgressModule
- [x] GoalsModule
- [x] HabitLogsModule
- [x] DashboardModule (aggregated analytics)
- [x] ReportsModule (monthly, yearly summaries)
- [x] ShoesModule
- [x] AchievementsModule
- [x] CalendarModule
- [x] PersonalRecordsModule
- [x] ProgressiveOverloadModule
- [x] ExportModule (CSV generation)
- [x] NotificationsModule
- [x] WorkoutPlansModule

### Frontend Pages
- [x] Landing page
- [x] Login page
- [x] Register page
- [x] Dashboard with charts, stats, activity list
- [x] Exercise library (with filtering, search, custom exercises)
- [x] Workout list, create, and detail pages
- [x] Running list, create, and detail pages
- [x] Body progress with charts
- [x] Goals (CRUD with progress tracking)
- [x] Habit log (daily tracking)
- [x] Calendar view
- [x] Monthly and yearly reports
- [x] Personal records
- [x] Shoe mileage tracker
- [x] Settings (profile + avatar upload)
- [x] Workout plans
- [x] Progressive overload
- [x] Achievements
- [x] Notifications

### Help & User Guide System
- [x] Help Center page with search functionality
- [x] Getting Started page with onboarding checklist
- [x] Feature-specific help pages (dynamic route for all 12 features)
- [x] Help content for Dashboard, Exercise Library, Workouts, Running, Body Progress, Goals, Habits, Calendar, Reports, Records, Shoes, Settings
- [x] Reusable help layout components (HelpLayout, HelpSection, HelpSteps, HelpTips)
- [x] Onboarding checklist with progress tracking
- [x] FAQ section on Help Center
- [x] Help Center link added to sidebar navigation

### UI/UX
- [x] Mobile-first responsive layout
- [x] Collapsible sidebar with navigation
- [x] Topbar with page title, notification bell, theme toggle, avatar
- [x] Dark mode and light mode support
- [x] Loading skeletons for all list/detail pages
- [x] Empty states with action buttons for all list pages
- [x] Error states with retry options
- [x] Delete confirmation dialogs (AlertDialog pattern)
- [x] Toast notifications for all mutations (Sonner)
- [x] Animated page transitions (`animate-in`)
- [x] Avatar upload with preview
- [x] Consistent card styling (bg-card with text-card-foreground)
- [x] Shadcn UI components throughout

### Feature Polish
- [x] Profile avatar upload (with sharp processing, fixed path resolution)
- [x] Next.js rewrite for `/uploads/*` proxy to backend

## In Progress
*Nothing currently in progress.*

## Technical Decisions
- Dynamic route `help/[slug]` for feature help pages with content registry pattern — single `page.tsx` renders all 12 feature guides from structured data in `help-content.ts`
- Onboarding checklist uses local `useState` with `Set<number>` for tracking (no server persistence needed — user preference)
- Help search implemented client-side over in-memory data (fast, no extra API calls)
- Help content separated from components — easy to edit copy without touching UI code

## Known Issues
- Old avatar uploads stored in `dist/uploads/avatars/` before path fix — those URLs will 404. Users need to re-upload.

## Next Steps
1. PDF export implementation
2. Email reminder system
3. Progress photo upload
4. Advanced gamification (levels, streaks visible in UI)
