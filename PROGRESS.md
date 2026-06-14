# FitTrack Pro — Progress

## Phase: Core Backend + Frontend — Workout Tracker

### Completed (Date: 2026-06-14)

**Backend — WorkoutsModule**
- `CreateWorkoutDto` — validation for date, type, durationMinutes, notes, exercises array with nested sets
- `UpdateWorkoutDto` — same shape as create (replaces exercises/sets)
- `WorkoutFilterDto` — type, startDate, endDate, page, limit
- `WorkoutsService` — create with nested exercises+sets, list with pagination+volume, findById, update, delete
- `WorkoutsController` — CRUD endpoints under `/workouts`
- Registered in `AppModule`

**Frontend — Workout Pages**
- `workouts/page.tsx` — list page with stat row (total workouts, volume, sets), workout cards grouped by recency, volume badges, loading/empty/error states
- `workouts/new/page.tsx` — add workout page with date/type/duration/notes fields, inline exercise search+selector, set table per exercise (kg/reps/RPE), live volume calculation, add/remove sets and exercises, nested form submission
- `workouts/[id]/page.tsx` — detail page with workout metadata, exercise grouping, set tables per exercise, total volume display, delete action with confirmation

**UI Interaction Conventions**
- Added shadcn `AlertDialog` for all delete confirmations (replaced browser `confirm()`)
- Added Sonner `Toaster` globally in Providers
- `toast.success` / `toast.error` on all mutation success/error handlers
- Created `alert-dialog.tsx` and `sonner.tsx` shadcn components

**Build Verification**
- Frontend `next build` — compiles cleanly, all routes resolved
- Backend `tsc --noEmit` — no errors

## Phase: Running Tracker MVP

### Completed (Date: 2026-06-14)

**Backend — RunsModule**
- `CreateRunDto` — validation for date, distanceKm, durationMinutes, type, shoeId, notes
- `UpdateRunDto` — all fields optional
- `QueryRunDto` — type filter, date range filter, pagination
- `RunsService` — create with auto-calculated averagePace from distance/duration; list with pagination and shoe include; findById with shoe include; update with pace recalculation; delete with ownership check
- `RunsController` — CRUD endpoints under `/runs` (all JWT-guarded, scoped to user)
- Registered in `AppModule`

**Frontend — Running Pages**
- `running/page.tsx` — list page with stat row (total runs, distance, avg pace), run cards with type badge, distance, duration, pace; loading/empty/error states; delete with AlertDialog + toast
- `running/new/page.tsx` — add page with date/type/distance/duration fields, live pace preview, notes field; cancel with destructive button, save with primary button; toast on success/error
- `running/[id]/page.tsx` — detail page with stat cards (distance, duration, pace), notes display, shoe info; delete with AlertDialog + toast

**Build Verification**
- Frontend `next build` — compiles cleanly, all routes resolved
  - Routes: `/running`, `/running/new`, `/running/[id]`
- Backend `tsc --noEmit` — no errors

## Phase: Body Progress Tracker MVP

### Completed (Date: 2026-06-14)

**Backend — BodyProgressModule**
- `CreateBodyProgressDto` — validation for date, weightKg, bodyFatPercent, waistCm, chestCm, armCm, thighCm, notes (all optional except at least one field expected)
- `UpdateBodyProgressDto` — all fields optional for partial updates
- `QueryBodyProgressDto` — date range filter, pagination
- `BodyProgressService` — create, findAll with pagination, findOne, findLatest (ordered by date desc), update, delete with ownership check
- `BodyProgressController` — CRUD endpoints under `/body-progress` (+ `GET /body-progress/latest`)
- Registered in `AppModule`

**Frontend — Body Progress Page**
- `body-progress/page.tsx` — single page with toggleable add form (date, weight, body fat %, waist, chest, arm, thigh, notes), latest stats summary cards, history table with all columns, loading/empty/error states, delete with AlertDialog + toast

**Build Verification**
- Frontend `next build` — compiles cleanly, route `/body-progress` resolved
- Backend `tsc --noEmit` — no errors

## Phase: Goals MVP

### Completed (Date: 2026-06-14)

**Backend — GoalsModule**
- `CreateGoalDto` — validation for name, type, targetValue, currentValue, unit, deadline
- `UpdateGoalDto` — all fields optional, includes status override
- `QueryGoalDto` — type filter, status filter
- `GoalsService` — create; findAll with type/status filters and computed `progress` (%); findOne with progress; update; complete (sets status=Completed, currentValue=targetValue); delete with ownership check
- `GoalsController` — CRUD endpoints under `/goals` (+ `PATCH /goals/:id/complete`)
- Registered in `AppModule`

**Frontend — Goals Page**
- `goals/page.tsx` — full-featured single page: status filter (All/Active/Completed/Failed), goal cards with progress bar, type badge (color-coded), status badge, current/target values, action buttons (complete/edit/delete), create/edit dialog with name/type/target/current/unit/deadline fields, loading/empty/error states, AlertDialog + toast for delete

**Build Verification**
- Frontend `next build` — compiles cleanly, route `/goals` resolved
- Backend `tsc --noEmit` — no errors

### Next Steps

1. Implement **ProfileModule** (backend) + Settings page (frontend)
2. Wire dashboard stats to real API data instead of mock data
3. Implement **HabitLogsModule** + habit log page
4. Implement **ShoesModule** + shoe mileage tracker
5. Implement **DashboardModule** backend for aggregated stats
