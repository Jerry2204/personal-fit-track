"use client"

import { useState, useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Dumbbell,
  Footprints,
  Weight,
  CheckCircle2,
  Moon,
  AlertTriangle,
  Flame,
  List,
  Grid3X3,
} from "lucide-react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet"
import { ActivityHeatmap } from "@/components/calendar/activity-heatmap"

interface WorkoutSummary {
  id: string
  date: string
  type: string
  durationMinutes: number | null
}

interface RunSummary {
  id: string
  date: string
  distanceKm: number
  durationMinutes: number | null
  type: string
}

interface BodyProgressSummary {
  id: string
  date: string
  weightKg: number | null
  bodyFatPercent: number | null
}

interface HabitLogSummary {
  id: string
  date: string
  workoutDone: boolean | null
  runningDone: boolean | null
  steps: number | null
  mood: string | null
}

interface DayData {
  date: string
  dayOfWeek: number
  workouts: WorkoutSummary[]
  runs: RunSummary[]
  bodyProgress: BodyProgressSummary[]
  habitLogs: HabitLogSummary[]
  hasWorkout: boolean
  hasRun: boolean
  hasBodyProgress: boolean
  hasHabitLog: boolean
  totalActivities: number
}

interface CalendarResponse {
  year: number
  month: number
  daysInMonth: number
  firstDayOfWeek: number
  days: DayData[]
}

const TYPE_LABELS: Record<string, string> = {
  UpperBody: "Upper",
  LowerBody: "Lower",
  FullBody: "Full Body",
  Push: "Push",
  Pull: "Pull",
  Cardio: "Cardio",
  Other: "Other",
}

const RUN_TYPE_LABELS: Record<string, string> = {
  Easy: "Easy Run",
  Recovery: "Recovery",
  Tempo: "Tempo",
  Interval: "Interval",
  LongRun: "Long Run",
  Race: "Race",
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const DAY_NAMES_SHORT = ["S", "M", "T", "W", "T", "F", "S"]
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function DayDetailSheet({
  date,
  dayData,
  open,
  onOpenChange,
}: {
  date: Date
  dayData: DayData | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const dateKey = formatDate(date)
  const today = new Date()
  const isToday = isSameDay(date, today)

  if (!dayData) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>
              {isToday ? "Today" : MONTH_NAMES[date.getMonth()]}{" "}
              {date.getDate()}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              {date.toLocaleDateString("en-US", { weekday: "long" })}
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center flex-1 pt-12">
            <Moon className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground text-sm">Rest day</p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              No activities recorded
            </p>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  const hasAny =
    dayData.workouts.length > 0 ||
    dayData.runs.length > 0 ||
    dayData.bodyProgress.length > 0 ||
    dayData.habitLogs.length > 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl">
            {isToday ? "Today" : MONTH_NAMES[date.getMonth()]}{" "}
            {date.getDate()}
          </SheetTitle>
          <SheetDescription>
            {date.toLocaleDateString("en-US", { weekday: "long" })} &middot;{" "}
            {dayData.totalActivities} activity
            {dayData.totalActivities !== 1 ? "ies" : "y"}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          {dayData.workouts.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Dumbbell className="h-3.5 w-3.5" /> Gym Sessions
              </h4>
              <div className="space-y-2">
                {dayData.workouts.map((w) => (
                  <Link
                    key={w.id}
                    href={`/workouts/${w.id}`}
                    className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm transition-colors hover:bg-accent/5"
                  >
                    <div>
                      <span className="font-medium text-card-foreground">
                        {TYPE_LABELS[w.type] || w.type}
                      </span>
                      {w.durationMinutes && (
                        <span className="text-muted-foreground ml-2">
                          {w.durationMinutes}m
                        </span>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs bg-primary/5 text-primary border-primary/20"
                    >
                      Workout
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {dayData.runs.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Footprints className="h-3.5 w-3.5" /> Running Sessions
              </h4>
              <div className="space-y-2">
                {dayData.runs.map((r) => (
                  <Link
                    key={r.id}
                    href={`/running/${r.id}`}
                    className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm transition-colors hover:bg-accent/5"
                  >
                    <div>
                      <span className="font-medium text-card-foreground">
                        {RUN_TYPE_LABELS[r.type] || r.type}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        {r.distanceKm.toFixed(1)}km
                        {r.durationMinutes && ` · ${r.durationMinutes}m`}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs bg-orange-500/10 text-orange-600 border-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30"
                    >
                      Run
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {dayData.bodyProgress.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Weight className="h-3.5 w-3.5" /> Body Progress
              </h4>
              <div className="space-y-2">
                {dayData.bodyProgress.map((bp) => (
                  <Link
                    key={bp.id}
                    href="/body-progress"
                    className="flex items-center justify-between rounded-lg border bg-card p-3 text-sm transition-colors hover:bg-accent/5"
                  >
                    <div>
                      {bp.weightKg && (
                        <span className="font-medium text-card-foreground">
                          {bp.weightKg.toFixed(1)} kg
                        </span>
                      )}
                      {bp.bodyFatPercent && (
                        <span className="text-muted-foreground ml-2">
                          {bp.bodyFatPercent.toFixed(1)}% body fat
                        </span>
                      )}
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30"
                    >
                      Progress
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {dayData.habitLogs.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Habit Logs
              </h4>
              <div className="space-y-2">
                {dayData.habitLogs.map((h) => (
                  <div
                    key={h.id}
                    className="rounded-lg border bg-card p-3 text-sm"
                  >
                    <div className="flex flex-wrap gap-2">
                      {h.workoutDone === true && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-primary/5 text-primary border-primary/20"
                        >
                          Gym ✓
                        </Badge>
                      )}
                      {h.workoutDone === false && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-red-500/10 text-red-600 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30"
                        >
                          Gym ✗
                        </Badge>
                      )}
                      {h.runningDone === true && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-orange-500/10 text-orange-600 border-orange-200 dark:bg-orange-500/15 dark:text-orange-400 dark:border-orange-500/30"
                        >
                          Run ✓
                        </Badge>
                      )}
                      {h.runningDone === false && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-red-500/10 text-red-600 border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-500/30"
                        >
                          Run ✗
                        </Badge>
                      )}
                      {h.steps != null && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-blue-500/10 text-blue-600 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30"
                        >
                          {h.steps.toLocaleString()} steps
                        </Badge>
                      )}
                      {h.mood && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-purple-500/10 text-purple-600 border-purple-200 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/30"
                        >
                          Mood: {h.mood}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasAny && (
            <div className="pt-2">
              <p className="text-xs text-muted-foreground">
                {dayData.totalActivities} activit
                {dayData.totalActivities !== 1 ? "ies" : "y"} logged
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-1">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState<Date>(today)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<"month" | "week">("month")

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth() + 1

  const { data, isLoading, isError, error } = useQuery<CalendarResponse>({
    queryKey: ["calendar", year, month],
    queryFn: () => api.get(`/calendar?year=${year}&month=${month}`),
  })

  const goToPrev = useCallback(() => {
    setCurrentDate((d) => {
      const next = new Date(d)
      if (viewMode === "week") {
        next.setDate(next.getDate() - 7)
      } else {
        next.setMonth(next.getMonth() - 1)
      }
      return next
    })
  }, [viewMode])

  const goToNext = useCallback(() => {
    setCurrentDate((d) => {
      const next = new Date(d)
      if (viewMode === "week") {
        next.setDate(next.getDate() + 7)
      } else {
        next.setMonth(next.getMonth() + 1)
      }
      return next
    })
  }, [viewMode])

  const goToToday = useCallback(() => {
    setCurrentDate(new Date())
  }, [])

  const daysMap = useMemo(() => {
    if (!data) return new Map<string, DayData>()
    const map = new Map<string, DayData>()
    for (const day of data.days) {
      map.set(day.date, day)
    }
    return map
  }, [data])

  const calendarGrid = useMemo(() => {
    if (!data) return []

    if (viewMode === "week") {
      const dayOfWeek = currentDate.getDay()
      const sunday = new Date(currentDate)
      sunday.setDate(currentDate.getDate() - dayOfWeek)
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(sunday)
        d.setDate(sunday.getDate() + i)
        return { date: d, isCurrentMonth: d.getMonth() === currentDate.getMonth() }
      })
    }

    const firstDay = data.firstDayOfWeek
    const daysInMonth = data.daysInMonth
    const cells: Array<{ date: Date | null; isCurrentMonth: boolean }> = []

    for (let i = 0; i < firstDay; i++) {
      cells.push({ date: null, isCurrentMonth: false })
    }

    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        date: new Date(year, month - 1, d),
        isCurrentMonth: true,
      })
    }

    const remaining = (7 - (cells.length % 7)) % 7
    for (let i = 0; i < remaining; i++) {
      cells.push({ date: null, isCurrentMonth: false })
    }

    return cells
  }, [data, year, month, viewMode, currentDate])

  const handleDayClick = useCallback((date: Date) => {
    setSelectedDate(date)
  }, [])

  const selectedDayData = selectedDate
    ? daysMap.get(formatDate(selectedDate))
    : undefined

  if (isError) {
    return (
      <div className="animate-in space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Calendar</h1>
          <p className="text-muted-foreground">Track your fitness journey</p>
        </div>
        <EmptyState
          icon={AlertTriangle}
          title="Failed to load calendar"
          description={(error as Error)?.message || "An error occurred"}
          action={{
            label: "Try Again",
            onClick: () => window.location.reload(),
          }}
        />
      </div>
    )
  }

  return (
    <div className="animate-in space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground tracking-tight">
            Calendar
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Track your fitness journey
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("month")}
            className="h-8"
          >
            <Grid3X3 className="h-3.5 w-3.5 mr-1" />
            Month
          </Button>
          <Button
            variant={viewMode === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("week")}
            className="h-8"
          >
            <List className="h-3.5 w-3.5 mr-1" />
            Week
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={goToPrev} className="h-9 w-9">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          {viewMode === "week" ? (
            <h2 className="text-lg font-semibold text-card-foreground text-center">
              {(() => {
                const dayOfWeek = currentDate.getDay()
                const sunday = new Date(currentDate)
                sunday.setDate(currentDate.getDate() - dayOfWeek)
                const saturday = new Date(sunday)
                saturday.setDate(sunday.getDate() + 6)
                const fmt = (d: Date) =>
                  `${MONTH_NAMES[d.getMonth()].slice(0, 3)} ${d.getDate()}`
                return `${fmt(sunday)} – ${fmt(saturday)}, ${saturday.getFullYear()}`
              })()}
            </h2>
          ) : (
            <h2 className="text-lg font-semibold text-card-foreground">
              {MONTH_NAMES[month - 1]} {year}
            </h2>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="h-7 text-xs px-2.5"
          >
            <CalendarIcon className="h-3 w-3 mr-1" />
            Today
          </Button>
        </div>
        <Button variant="ghost" size="icon" onClick={goToNext} className="h-9 w-9">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Workout
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-orange-500" />
          Run
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Progress
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          Habit
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Missed
        </span>
      </div>

      {/* Calendar Grid */}
      {isLoading ? (
        <CalendarSkeleton />
      ) : data && data.days.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No data this month"
          description="Start logging workouts, runs, or body measurements to see them here."
        />
      ) : (
        <div className="rounded-xl border bg-card p-3 sm:p-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAY_NAMES_SHORT.map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="text-center text-xs font-medium text-muted-foreground py-1"
              >
                <span className="hidden sm:inline">{name}</span>
                <span className="sm:hidden">{name}</span>
              </div>
            ))}
          </div>

          {/* Day Cells */}
          <div className={`grid grid-cols-7 ${viewMode === "week" ? "gap-1" : "gap-px bg-border/40"}`}>
            {calendarGrid.map((cell, idx) => {
              if (!cell.date) {
                return <div key={`empty-${idx}`} className={`aspect-square ${viewMode === "month" ? "bg-card" : ""}`} />
              }

              const date = cell.date
              const dateKey = formatDate(date)
              const day = daysMap.get(dateKey)
              const isToday = isSameDay(date, today)
              const isSelected =
                selectedDate && isSameDay(date, selectedDate)
              const hasWorkout = day?.hasWorkout ?? false
              const hasRun = day?.hasRun ?? false
              const hasBodyProgress = day?.hasBodyProgress ?? false
              const hasHabitLog = day?.hasHabitLog ?? false
              const isMissed =
                day?.habitLogs.some(
                  (h) => h.workoutDone === false || h.runningDone === false,
                ) ?? false

              return (
                <button
                  key={dateKey}
                  onClick={() => handleDayClick(date)}
                  className={`relative flex flex-col items-center justify-center text-sm transition-all duration-150
                    ${
                      viewMode === "week"
                        ? "rounded-lg aspect-square border border-border/40"
                        : "aspect-square border border-border/40"
                    }
                    ${
                      isSelected
                        ? "bg-primary/15 ring-2 ring-primary/50 z-10"
                        : isToday
                          ? "bg-primary/10 ring-1 ring-primary/40 z-10"
                          : "hover:bg-accent/10"
                    }
                    ${
                      isToday && isSelected
                        ? "ring-2 ring-primary"
                        : ""
                    }
                    ${!cell.isCurrentMonth ? "opacity-40" : ""}
                  `}
                >
                  <span
                    className={`font-medium leading-none ${
                      isToday
                        ? "text-primary"
                        : "text-card-foreground"
                    }`}
                  >
                    {date.getDate()}
                  </span>

                  {/* Activity indicators */}
                  {(hasWorkout || hasRun || hasBodyProgress || hasHabitLog || isMissed) && (
                    <div className="flex items-center gap-0.5 mt-1.5">
                      {hasWorkout && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                      {hasRun && (
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                      )}
                      {hasBodyProgress && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      )}
                      {hasHabitLog && !hasWorkout && !hasRun && (
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                      )}
                      {isMissed && (
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      )}
                    </div>
                  )}

                  {/* Today badge on mobile compact */}
                  {isToday && (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {/* Summary cards below calendar */}
      {!isLoading && data && data.days.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground leading-none">
                {data.days.reduce((s, d) => s + d.workouts.length, 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Workouts</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center shrink-0">
              <Footprints className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground leading-none">
                {data.days.reduce((s, d) => s + d.runs.length, 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Runs</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Weight className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground leading-none">
                {data.days.reduce((s, d) => s + d.bodyProgress.length, 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Progress Logs</p>
            </div>
          </div>
          <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground leading-none">
                {data.days.reduce((s, d) => s + d.habitLogs.length, 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Habit Logs</p>
            </div>
          </div>
        </div>
      )}

      {/* Streak info */}
      {!isLoading && data && data.days.length > 0 && (
        <div className="rounded-xl border bg-card p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
            <Flame className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-card-foreground">
              {(() => {
                let streak = 0
                const sorted = [...data.days].reverse()
                for (const day of sorted) {
                  if (day.totalActivities > 0) streak++
                  else break
                }
                return streak
              })()}{" "}
              day active streak
            </p>
            <p className="text-xs text-muted-foreground">
              {(() => {
                const total = data.days.reduce((s, d) => s + d.totalActivities, 0)
                return `${total} total activities this month`
              })()}
            </p>
          </div>
        </div>
      )}

      {/* Activity Heatmap */}
      <ActivityHeatmap />

      {/* Day Detail Sheet */}
      {selectedDate && (
        <DayDetailSheet
          date={selectedDate}
          dayData={selectedDayData}
          open={!!selectedDate}
          onOpenChange={(open) => {
            if (!open) setSelectedDate(null)
          }}
        />
      )}
    </div>
  )
}
