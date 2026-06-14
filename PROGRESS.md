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

## Phase: Shoe Mileage Tracker

### Completed (Date: 2026-06-14)

**Backend — ShoesModule**
- `shoes.module.ts`, `shoes.controller.ts`, `shoes.service.ts`
- `dto/create-shoe.dto.ts`, `dto/update-shoe.dto.ts`
- CRUD operations: `GET /shoes`, `GET /shoes/:id`, `POST /shoes`, `PATCH /shoes/:id`, `DELETE /shoes/:id`
- `PATCH /shoes/:id/retire` — sets `isActive = false`
- Mileage computed live from `RunActivity` aggregation (sum of `distanceKm` per shoe) — not reliant on cached `currentMileageKm` field
- `findOne()` returns enriched detail: `currentMileageKm`, `totalRuns`, `mileageHistory[]` (monthly distance grouped by year-month)
- JWT auth guard applied

**Frontend — Shoes List (`/shoes`)**
- Card grid showing brand + model, purchase date, mileage progress bar, total km, max km
- Warning indicators: amber "WARNING" badge at ≥80%, red "MAXED" badge at ≥100%, "RETIRED" badge for inactive shoes
- Active/All toggle filter
- Add Shoe dialog (brand, model, purchase date, max mileage)
- Delete with AlertDialog confirmation
- Loading skeleton (3 placeholder cards), empty state (no shoes), error state
- Responsive grid: 1 col mobile, 2 col tablet, 3 col desktop

**Frontend — Shoe Detail (`/shoes/[id]`)**
- Header with brand/model, warning/retired badges, Retire + Delete buttons
- Large mileage progress card: current/max km display, color-coded progress bar (green → amber → red), warning message
- Mileage history section: horizontal bar chart per month, labels (month + distance), empty state when no data
- Back button, error state

**Integration**
- Sidebar nav updated with `/shoes` (SportShoe icon, between Running and Exercises)
- Topbar page title mapping added for `/shoes` → "Shoes"

**Build Verification**
- Frontend `next build` — 18 routes, all clean
- Backend `tsc --noEmit` — clean

## Phase: Analytics Dashboard

### Completed (Date: 2026-06-14)

**Backend — DashboardModule**
- `dashboard.module.ts`, `dashboard.controller.ts`, `dashboard.service.ts`
- `GET /dashboard/analytics` (JWT guarded) — single endpoint returning all dashboard data:
  - **todaySummary**: today's workout/run status, calories burned, streak days
  - **overallStats**: total workouts, total distance, total duration, current streak
  - **weeklyProgress**: 7-day breakdown with sessions + km per day
  - **weeklyTargets**: sessions/km completed vs profile targets (defaults: 4 sessions, 20 km)
  - **recentWorkouts** (4): date label, type, duration, exercise count, volume
  - **recentRuns** (3): date label, distance, duration, formatted pace, type
  - **goals** (3 active): with deadline formatting, type label mapping
  - **bodyProgress**: current/start/target weight, weight change, last measurement
  - **bodyProgressTrend**: last 30 weight entries for chart
  - **personalRecords**: strongest lift + longest run with dates
  - **profileName**: user's name from profile for greeting
  - **charts**:
    - workoutVolume: weekly total volume (∑ weight×reps) for 12 weeks
    - runningDistance: weekly total distance for 12 weeks
    - runningPace: weekly average pace for 12 weeks (minutes/km)
    - weightTrend: all body weight entries with dates
    - goalCompletion: monthly goals created vs completed for 6 months
    - habitConsistency: weekly habit completion rate for 12 weeks

**Frontend — Recharts Chart Components**
- `components/dashboard/charts/workout-volume-chart.tsx` — bar chart
- `components/dashboard/charts/running-distance-chart.tsx` — bar chart
- `components/dashboard/charts/running-pace-chart.tsx` — line chart, reversed Y axis, formatted pace
- `components/dashboard/charts/weight-trend-chart.tsx` — line chart, domain padding, formatted dates
- `components/dashboard/charts/goal-completion-chart.tsx` — grouped bar chart (completed + total), legend
- `components/dashboard/charts/habit-consistency-chart.tsx` — bar chart with % axis

All charts: responsive (ResponsiveContainer), styled tooltips, empty states, theme-aware hsl colors.

**Frontend — Dashboard Page Rewrite**
- `app/(dashboard)/dashboard/page.tsx` — fetches real data from API, no more mock data
- Charts grid: 3 cols desktop, 2 tablet, 1 mobile
- Loading skeleton, error state handling via TanStack Query

**Frontend — Component Prop Refactoring**
- `welcome-section.tsx` — accepts props (todaySummary, overallStats, profileName, userEmail)
- `weekly-overview.tsx` — accepts props (weeklyProgress, weeklyTargets)
- `goal-card.tsx` — accepts goals prop, dynamic type labels
- `body-progress-summary.tsx` — accepts bodyProgress prop, handles gain/loss
- `personal-records-summary.tsx` — accepts personalRecords prop
- `dashboard-types.ts` — shared TypeScript interfaces

**Build Verification**
- Frontend `next build` — 18 routes, all clean
- Backend `tsc --noEmit` — clean

## Phase: Yearly Report

### Completed (Date: 2026-06-14)

**Backend — ReportsModule Enhancement**
- `getYearly(userId, year?)` added to `ReportsService`
- `dto/query-yearly.dto.ts` — optional year param (defaults to current)
- `GET /reports/yearly?year=` (JWT guarded) — dynamically generates yearly report:
  - **summary**: totalWorkouts, totalVolume, totalRunningDistance, totalRunningDuration, averagePace, goalCompletionRate, goalsCompleted, totalGoals, yearlyConsistency (% of tracked days with activity), weightChange, startWeight, currentWeight, trackedDays, completedDays
  - **mostConsistentMonth**: month name + consistency rate
  - **monthlyBreakdown[12]**: per-month workout count, volume, running distance, running duration
  - **monthlyConsistency[12]**: per-month consistency rate
  - **achievements**: strongest lift, longest run, fastest run *within the year* (with dates)
  - **personalRecords**: all-time strongest lift, longest run, fastest run

**Frontend — Reports Page Refactor**
- `/reports` page now has Monthly / Yearly tab navigation (pill-style toggle)
- **Yearly view**: 8 summary cards (workouts, volume, running distance, run duration, avg pace, goal completion, consistency, weight change)
  - 4 Recharts in 2×2 grid: monthly workout volume (bar), monthly running distance (bar), monthly consistency (line), best achievements list (with trophy icons)
  - All-time personal records section
  - Most consistent month highlight card with medal icon
  - Year-only selector dropdown, print support
- **Monthly view** unchanged but extracted into `MonthlyView` component
- Both views share `SummaryCard`, `ReportSkeleton`, tooltip style, `formatPace`

**Build Verification**
- Frontend `next build` — 19 routes, all clean
- Backend `tsc --noEmit` — clean

## Phase: Profile & Settings

### Completed (Date: 2026-06-14)

**Backend — ProfileModule**
- `profile.module.ts`, `profile.controller.ts`, `profile.service.ts`
- `dto/update-profile.dto.ts` — all fields optional: name, age, gender, heightCm, currentWeightKg, fitnessGoal, activityLevel, targetWeightKg, weeklyWorkoutTarget, weeklyRunningTargetKm — with class-validator decorators, enum validation from Prisma client
- `GET /profile` (JWT guarded) — returns `{ id, email, profile }` (profile is null if not set)
- `PUT /profile` (JWT guarded) — upserts profile (creates if not exists, updates if exists)
- Registered in `AppModule`

**Frontend — Settings Page (`/settings`)**
- Card-based form layout with 4 sections:
  - **Account**: email (read-only)
  - **Personal Information**: name, age, gender (Select), heightCm
  - **Fitness Details**: current weight, target weight, fitness goal (Select), activity level (Select)
  - **Weekly Targets**: workouts per week, weekly running target
- Fetches profile on mount via `useQuery(["profile"])`, pre-fills form
- Submits via `useMutation` → `PUT /profile` → toast.success / toast.error
- Loading skeleton, error state
- Nav link already existed in sidebar + topbar (`/settings` → "Settings")
- `api.put()` added to frontend `api.ts` (was missing)

**Build Verification**
- Frontend `next build` — 20 routes (`/settings` added), all clean
- Backend `tsc --noEmit` — clean

## Phase: Achievements & Gamification

### Completed (Date: 2026-06-14)

**Backend — AchievementsModule**
- `achievements.module.ts`, `achievements.controller.ts`, `achievements.service.ts`
- `GET /achievements` (JWT guarded) — computes 21 achievements on-the-fly from existing data (no DB storage):
  - **Streak badges** (4): First Step (1 day), On a Roll (7), Unstoppable (14), Consistency King (30) — current streak from consecutive habit log days
  - **Workout milestones** (5): First Session (1), Getting Started (10), Dedicated (25), Iron Warrior (50), Gym Legend (100) — total workout count
  - **Running milestones** (5): First Run (1 run), 5K Runner (5 km total), 10K Runner (10 km), Half Marathoner (21.1 km), Century Runner (100 km) — total run distance
  - **Consistency achievements** (3): Week Warrior (7 habit days total), Monthly Master (max days in a single month), Year Warrior (200 habit days total)
  - **Goal achievements** (4): First Goal (1), Goal Getter (5), Achiever (10), Overachiever (20) — completed goal count
- Returns `{ achievements: Achievement[], summary: { total, unlocked, rank, streak } }`
  - Rank auto-calculated: Beginner (0-1), Rookie (2-24%), Intermediate (25-49%), Veteran (50-79%), Elite (80-100%)
  - Current streak computed from consecutive habit log days backward from today
- All types exported: `AchievementDef`, `AchievementResult`, `AchievementsResponse`

**Frontend — Achievements Page (`/achievements`)**
- Summary row (4 stat cards): Unlocked count, Rank badge, Current streak, Overall %
- Category filter tabs with icons and count badges: All, Streak, Workout, Running, Consistency, Goals
- Card grid (responsive: 1→2→3 cols), each card shows:
  - Category-colored icon, title, description
  - Progress bar with current/target values and percentage
  - Gold trophy icon for unlocked achievements
  - Subtle gradient background for unlocked cards, dimmed for locked
- Loading skeleton grid, empty state, error state

**Nav Updates**
- Sidebar: added `/achievements` (Medal icon) between Habits and Calendar
- Topbar: added `/achievements` → "Achievements" title mapping

**Build Verification**
- Frontend `next build` — 21 routes (`/achievements` added), all clean
- Backend `tsc --noEmit` — clean

## Phase: Export CSV/PDF

### Completed (Date: 2026-06-14)

**Backend — ExportModule**
- `export.module.ts`, `export.controller.ts`, `export.service.ts`
- 5 authenticated CSV endpoints returning proper `Content-Type: text/csv` + `Content-Disposition: attachment` headers:
  - `GET /export/workouts/csv` — all workouts with exercises/sets flattened (columns: Date, Type, Duration, Exercise, Muscle Group, Set#, Weight, Reps, RPE, Notes)
  - `GET /export/runs/csv` — all run activities (columns: Date, Type, Distance, Duration, Avg Pace, Avg HR, Calories, Shoe, Notes)
  - `GET /export/body-progress/csv` — all body progress entries (columns: Date, Weight, Body Fat %, Waist, Chest, Arm, Thigh, Notes)
  - `GET /export/reports/monthly/csv?year=&month=` — per-day activity breakdown for a month
  - `GET /export/reports/yearly/csv?year=` — per-month summary (workouts, volume, running distance, running duration, run days)
- CSV generation handles proper escaping (commas, quotes, newlines) via RFC 4180
- All data scoped to authenticated user

**Frontend — Export Integration**
- `lib/export-utils.ts` — `downloadCsv(path, filename)` helper: fetches with JWT, creates blob, triggers download via hidden anchor
- **Workouts page** — Download button (outline icon) added next to "New Workout"
- **Running page** — Download button (outline icon) added next to "New Run"
- **Body Progress page** — Download button (outline icon) added next to "Add Measurement"
- **Reports page** — CSV Download button + Print button (Printer icon) side by side in header. CSV uses current tab/year/month for filename (`monthly-report-2026-06.csv`). Print already supported via `window.print()` with `print:hidden`/`print:block` CSS.

**Build Verification**
- Frontend `next build` — 21 routes, all clean
- Backend `tsc --noEmit` — clean

### Next Steps

1. Implement **Workout Plan Feature** (backend + frontend)
## Phase: Notification Center

### Completed (Date: 2026-06-14)

**Prisma Schema**
- Added `Notification` model: id, userId, type, title, message, severity, link, read, createdAt
- Added `notifications` relation on User
- Migration `20260614142758_add_notifications` applied

**Backend — NotificationsModule**
- `notifications.module.ts`, `notifications.controller.ts`, `notifications.service.ts`
- `GET /notifications` — paginated list, newest first
- `GET /notifications/unread-count` — count of unread
- `PATCH /notifications/:id/read` — mark single as read
- `PATCH /notifications/read-all` — mark all as read
- `POST /notifications/check` — auto-generate notifications via state checks:
  - Goal reminders: overdue goals, deadlines within 7/2 days
  - Workout reminder: no workout in 3+ days (or no workouts ever)
  - Habit reminder: no habit log for today
  - Achievement: first run, 5K/10K/21.1K/100K milestones, 1/10/25/50/100 workouts, 1/5/10 goals completed, 1/7/30 habit days
- Deduplication: checks existing notifications with same title within last 24h before creating
- Registered in `AppModule` (now 20 modules)

**Frontend — NotificationBell**
- `components/notification-bell.tsx` — bell icon in topbar with unread badge count
- Opens right Sheet panel with notification list
- Calls `POST /notifications/check` on panel open (generates new notifications on-the-fly)
- Each notification shows severity-colored icon (Target, Dumbbell, ClipboardList, Trophy), title, message, relative timestamp
- Unread notifications have highlighted background + mark-read button
- "Mark all read" button in header
- Empty state when no notifications
- Loading spinner while fetching
- `components/ui/scroll-area.tsx` — simple scroll wrapper

**Build Verification**
- Frontend `next build` — 22 routes, all clean
- Backend `tsc --noEmit` — clean

## Phase: Date Picker Polish

### Completed (Date: 2026-06-14)

- Installed `react-day-picker` v10 and `date-fns` v4
- Installed `@radix-ui/react-popover` — created shadcn-style `Popover` component (`popover.tsx`)
- Created `DatePicker` component (`date-picker.tsx`) — calendar popover with DayPicker, formatting via `date-fns`
- Replaced all 6 `<Input type="date">` across the app:
  - `body-progress/page.tsx` — measurement date
  - `habits/page.tsx` — habit log date
  - `workouts/new/page.tsx` — workout date
  - `goals/page.tsx` — goal deadline
  - `shoes/page.tsx` — purchase date
  - `running/new/page.tsx` — run date

**Build Verification**
- Frontend `next build` — 22 routes, all clean

### Next Steps
