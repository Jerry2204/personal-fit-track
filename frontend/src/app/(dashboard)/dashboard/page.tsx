"use client"

import { useQuery } from "@tanstack/react-query"
import {
  Dumbbell,
  Footprints,
  TrendingUp,
  Target,
  BarChart3,
  Timer,
  Gauge,
  Weight,
  CheckCircle2,
  CalendarDays,
  AlertTriangle,
} from "lucide-react"

import { api } from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"
import { WelcomeSection } from "@/components/dashboard/welcome-section"
import { WeeklyOverview } from "@/components/dashboard/weekly-overview"
import { ActivityList } from "@/components/dashboard/activity-list"
import { GoalCard } from "@/components/dashboard/goal-card"
import { BodyProgressSummary } from "@/components/dashboard/body-progress-summary"
import { PersonalRecordsSummary } from "@/components/dashboard/personal-records-summary"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { WorkoutVolumeChart } from "@/components/dashboard/charts/workout-volume-chart"
import { RunningDistanceChart } from "@/components/dashboard/charts/running-distance-chart"
import { RunningPaceChart } from "@/components/dashboard/charts/running-pace-chart"
import { WeightTrendChart } from "@/components/dashboard/charts/weight-trend-chart"
import { GoalCompletionChart } from "@/components/dashboard/charts/goal-completion-chart"
import { HabitConsistencyChart } from "@/components/dashboard/charts/habit-consistency-chart"
import type { DashboardAnalytics } from "@/components/dashboard/dashboard-types"

const chartMeta = [
  { key: "workoutVolume", title: "Workout Volume Trend", icon: Dumbbell, desc: "Weekly total volume (kg)" },
  { key: "runningDistance", title: "Running Distance Trend", icon: Footprints, desc: "Weekly total distance (km)" },
  { key: "runningPace", title: "Running Pace Trend", icon: Gauge, desc: "Weekly average pace (/km)" },
  { key: "weightTrend", title: "Weight Trend", icon: Weight, desc: "Body weight over time" },
  { key: "goalCompletion", title: "Goal Completion Trend", icon: CheckCircle2, desc: "Monthly goal completion" },
  { key: "habitConsistency", title: "Habit Consistency", icon: CalendarDays, desc: "Weekly habit completion rate" },
] as const

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data, isLoading, isError, error } = useQuery<DashboardAnalytics>({
    queryKey: ["dashboard-analytics"],
    queryFn: () => api.get("/dashboard/analytics"),
  })

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (isError) {
    return (
      <div className="animate-in space-y-6">
        <EmptyState
          icon={AlertTriangle}
          title="Failed to load dashboard"
          description={error instanceof Error ? error.message : "An error occurred"}
        />
      </div>
    )
  }

  if (!data) return null

  const { charts } = data

  return (
    <div className="animate-in space-y-6">
      <WelcomeSection
        todaySummary={data.todaySummary}
        overallStats={data.overallStats}
        profileName={data.profileName}
        userEmail={user?.email || ""}
        avatarUrl={user?.avatarUrl}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <WeeklyOverview
            weeklyProgress={data.weeklyProgress}
            weeklyTargets={data.weeklyTargets}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <ActivityList
              title="Recent Workouts"
              icon={<Dumbbell className="h-4 w-4" />}
              items={data.recentWorkouts}
              type="workout"
            />
            <ActivityList
              title="Recent Runs"
              icon={<Footprints className="h-4 w-4" />}
              items={data.recentRuns}
              type="run"
            />
          </div>
        </div>

        <div className="space-y-4">
          <GoalCard goals={data.goals} />
          <BodyProgressSummary bodyProgress={data.bodyProgress} />
          <PersonalRecordsSummary personalRecords={data.personalRecords} />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {chartMeta.map((meta) => {
          const chartData = charts[meta.key as keyof typeof charts]
          const Icon = meta.icon
          return (
            <div
              key={meta.key}
              className="rounded-2xl border border-border/40 bg-card shadow-lg"
            >
              <div className="flex items-center gap-2 border-b border-border/40 px-5 py-3">
                <Icon className="h-4 w-4 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold text-card-foreground">{meta.title}</h3>
                  <p className="text-[11px] text-muted-foreground">{meta.desc}</p>
                </div>
              </div>
              <div className="p-4">
                {meta.key === "workoutVolume" && <WorkoutVolumeChart data={chartData as { week: string; volume: number }[]} />}
                {meta.key === "runningDistance" && <RunningDistanceChart data={chartData as { week: string; distance: number }[]} />}
                {meta.key === "runningPace" && <RunningPaceChart data={chartData as { week: string; pace: number }[]} />}
                {meta.key === "weightTrend" && <WeightTrendChart data={chartData as { date: string; weight: number | null }[]} />}
                {meta.key === "goalCompletion" && <GoalCompletionChart data={chartData as { month: string; completed: number; total: number }[]} />}
                {meta.key === "habitConsistency" && <HabitConsistencyChart data={chartData as { week: string; rate: number }[]} />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
