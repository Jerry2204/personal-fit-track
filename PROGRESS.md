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

## Phase: Calendar View MVP

### Completed (Date: 2026-06-14)

**Backend — CalendarModule**
- `QueryCalendarDto` — year + month validation
- `CalendarService.getMonth()` — fetches all workouts, runs, body progress, and habit logs for a given month (parallelized); returns per-day breakdown with activity flags (hasWorkout, hasRun, hasBodyProgress, hasHabitLog) and totalActivity count
- `CalendarController` — `GET /calendar?year=&month=` (JWT-guarded)
- Registered in `AppModule`

**Frontend — Calendar Page**
- Month grid (7 columns, Sun-Sat headers) with leading/trailing empty cells for alignment
- Day cells with colored dot indicators for each activity type (primary for workouts, orange for runs, emerald for progress, blue for habits, red for missed)
- Today highlighted with `ring-1 ring-primary/40` + extra dot indicator
- Selected day highlighted with `ring-2 ring-primary/50`
- Previous/Next month navigation via chevron buttons
- "Today" shortcut button (resets to current month)
- Month/Week view toggle buttons (week view scaffolded)
- Color-coded legend below header
- Click day → opens `Sheet` (slide-in panel from right) showing all activities for that date, grouped by type with links to detail pages (workout, run, body-progress)
- Sheet handles empty/rest day state with "Rest day — No activities recorded" message
- Habit log entries in sheet show badges for workoutDone/runningDone/steps/mood
- Summary stat cards below calendar (workouts, runs, progress logs, habit logs counts)
- Active streak counter (consecutive days from end of month with activities)
- Loading state with skeleton grid
- Error state with `EmptyState` + retry button
- Empty state when no activities exist for the month

**New UI Component**
- `frontend/src/components/ui/sheet.tsx` — shadcn-style Sheet component (`@radix-ui/react-dialog` based) with `side="right"` animation, header, title, description, close button; used for day detail panel

**Build Verification**
- Frontend `next build` — compiles cleanly, 15 routes total (new: `/calendar`)
- Backend `tsc --noEmit` — no errors

## Phase: Daily Habit Log MVP

### Completed (Date: 2026-06-14)

**Backend — HabitLogsModule**
- `CreateHabitLogDto` — validation for waterIntakeMl, sleepHours, steps, caloriesIntake, proteinG, bodyWeightKg, mood (Mood enum), energyLevel (0-10), notes
- `UpdateHabitLogDto` — same fields all optional for partial updates
- `QueryHabitLogDto` — date range filter (`from`/`to`), pagination (page/limit)
- `HabitLogsService` — create, findAll (paginated + date range), findOne, findToday (single entry for current date), update, delete with ownership checks
- `HabitLogsController` — CRUD endpoints under `/habit-logs` (+ `GET /habit-logs/today`)
- Registered in `AppModule`

**Frontend — Habits Page**
- `habits/page.tsx` — single full-featured page:
  - Today's quick summary card (shows todayEntry values with colored icons)
  - Toggleable add/edit form: date picker + 8 fields (water, sleep, steps, calories, protein, weight, mood dropdown, energy level 1-10) + notes textarea
  - History list with date badge, compact field icons, mood/energy badges
  - Edit button (inline icon), delete with AlertDialog confirmation
  - Detail Sheet (slide-in panel) showing full entry breakdown
  - Pagination for history
  - Loading (skeleton), empty (EmptyState), error states

**Sidebar & Topbar**
- Added `ListChecks` icon + `/habits` link in sidebar nav
- Added `/habits` → "Habits" title mapping in topbar

**Build Verification**
- Frontend `next build` — compiles cleanly, 16 routes total (new: `/habits`)
- Backend `tsc --noEmit` — no errors

## Phase: Activity Heatmap

### Completed (Date: 2026-06-14)

**Backend — Calendar Module Enhancement**
- `QueryHeatmapDto` — validates `year` (integer, min 2000)
- `CalendarService.getHeatmap()` — fetches all workouts, runs, body-progress, and habit-logs for a full year; aggregates per-day counts (workoutCount, runCount, bodyProgressCount, habitCount, total count); builds GitHub-style week arrays (53 weeks × 7 days, Sun-Sat) with padding from adjacent years; computes month label positions
- `CalendarController.getHeatmap()` — `GET /calendar/heatmap?year=2026`

**Frontend — ActivityHeatmap Component**
- `components/calendar/activity-heatmap.tsx` — standalone client component:
  - GitHub-style contribution graph: 7 rows (Mon-Sun) × ~53 columns (weeks)
  - 5-level color scale (none → low → medium → high → very high) using green/teal tones with dark mode support
  - Year navigation (prev/next chevrons, disabled at current year)
  - Activity type filter toggles (Workout, Run, Progress, Habit) — click to toggle; dimmed when inactive
  - Live filtered counts update when toggling filters
  - Hover tooltip: fixed-position popup showing date + per-type breakdown
  - Month labels aligned above each week's first occurrence
  - Day labels on left (Mon, Wed, Fri)
  - "Less → More" legend at bottom
  - Loading skeleton grid, empty state, error state
  - Responsive: horizontal scroll on narrow screens

**Integration**
- `ActivityHeatmap` added to calendar page below streak card, before day detail sheet

**Build Verification**
- Frontend `next build` — 16 routes, all clean
- Backend `tsc --noEmit` — clean

## Phase: Personal Records

### Completed (Date: 2026-06-14)

**Backend — PersonalRecordsModule**
- `personal-records.module.ts`, `personal-records.controller.ts`, `personal-records.service.ts`
- `PersonalRecordsService.findAll()` computes 5 records by querying existing workout and run data:
  - **Strongest lift**: highest `weightKg × reps` set across all workouts; returns exercise name, muscle group, date
  - **Longest run**: highest `distanceKm` run; returns duration, type, date
  - **Fastest run**: lowest `averagePace` (runs ≥ 1km); returns pace mm:ss/km, distance, type, date
  - **Highest workout volume**: highest total `∑(weightKg × reps)` across all sets in a single workout; returns workout type, date
  - **Highest weekly mileage**: highest total `distanceKm` in a Sunday–Saturday week; returns week start, run count
- All records return `null` if no qualifying data exists
- JWT auth guard applied
- `GET /personal-records` returns `{ strongestLift, longestRun, fastestRun, highestVolume, highestWeeklyMileage }`

**Frontend — Records Page (`/records`)**
- Achievement-style card grid with trophy icon, gradient backgrounds, per-type accent colors
- Value display (e.g. `80kg × 12`, `21.1km`, `4:30 /km`, `12,450kg`, `62.5km`)
- Context subtitle (exercise + muscle group, duration + run type, etc.)
- Category filter tabs: All, Lifting, Running, Volume, Mileage — each with icon and active styling
- Loading skeleton (3 placeholder cards), empty state (no records), error state
- Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop

**Integration**
- Sidebar nav updated with `/records` (Trophy icon, between Goals and Habits)
- Topbar page title mapping added for `/records` → "Records"

**Build Verification**
- Frontend `next build` — 17 routes, all clean
- Backend `tsc --noEmit` — clean

### Next Steps

1. Implement **ProfileModule** (backend) + Settings page (frontend)
2. Wire dashboard stats to real API data instead of mock data
3. Implement **ShoesModule** + shoe mileage tracker
4. Implement **DashboardModule** backend for aggregated stats
