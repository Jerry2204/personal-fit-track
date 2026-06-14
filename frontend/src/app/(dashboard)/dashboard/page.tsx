"use client"

import { useEffect, useState } from "react"
import { Dumbbell, Footprints, Target, TrendingUp } from "lucide-react"

import { WelcomeSection } from "@/components/dashboard/welcome-section"
import { StatCard } from "@/components/dashboard/stat-card"
import { WeeklyOverview } from "@/components/dashboard/weekly-overview"
import { ActivityList } from "@/components/dashboard/activity-list"
import { GoalCard } from "@/components/dashboard/goal-card"
import { BodyProgressSummary } from "@/components/dashboard/body-progress-summary"
import { PersonalRecordsSummary } from "@/components/dashboard/personal-records-summary"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { todaySummary, recentWorkouts, recentRuns } from "@/components/dashboard/mock-data"

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="animate-in space-y-6">
      <WelcomeSection />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Workout"
          value={todaySummary.hasWorkout ? todaySummary.workoutLabel : "Rest day"}
          description={
            todaySummary.hasWorkout ? "Completed" : "No workout scheduled"
          }
          icon={Dumbbell}
        />
        <StatCard
          title="Today's Run"
          value={
            todaySummary.hasRun
              ? `${todaySummary.runDistance} km`
              : "Rest day"
          }
          description={
            todaySummary.hasRun
              ? `${todaySummary.runDuration} min`
              : "No run logged"
          }
          icon={Footprints}
        />
        <StatCard
          title="Calories"
          value={`${todaySummary.caloriesBurned}`}
          description="Estimated today"
          icon={TrendingUp}
          trend={{ value: 8, positive: true }}
        />
        <StatCard
          title="Streak"
          value={`${todaySummary.streakDays} days`}
          description="Keep it going!"
          icon={Target}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <WeeklyOverview />

          <div className="grid gap-4 sm:grid-cols-2">
            <ActivityList
              title="Recent Workouts"
              icon={<Dumbbell className="h-4 w-4" />}
              items={recentWorkouts}
              type="workout"
            />
            <ActivityList
              title="Recent Runs"
              icon={<Footprints className="h-4 w-4" />}
              items={recentRuns}
              type="run"
            />
          </div>
        </div>

        <div className="space-y-4">
          <GoalCard />
          <BodyProgressSummary />
          <PersonalRecordsSummary />
        </div>
      </div>
    </div>
  )
}
