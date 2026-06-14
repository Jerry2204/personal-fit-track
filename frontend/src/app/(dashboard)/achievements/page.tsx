"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Flame,
  Dumbbell,
  Footprints,
  CalendarCheck,
  Target,
  Trophy,
  AlertTriangle,
  Medal,
} from "lucide-react"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"

type Category = "all" | "streak" | "workout" | "running" | "consistency" | "goals"

interface Achievement {
  id: string
  title: string
  description: string
  category: Category
  icon: string
  target: number
  unlocked: boolean
  progress: number
  current: number
}

interface Summary {
  total: number
  unlocked: number
  rank: string
  streak: number
}

interface AchievementsResponse {
  achievements: Achievement[]
  summary: Summary
}

const categoryIcons: Record<string, typeof Flame> = {
  streak: Flame,
  workout: Dumbbell,
  running: Footprints,
  consistency: CalendarCheck,
  goals: Target,
}

const categoryLabels: Record<string, string> = {
  all: "All",
  streak: "Streak",
  workout: "Workout",
  running: "Running",
  consistency: "Consistency",
  goals: "Goals",
}

const categoryColors: Record<string, string> = {
  streak: "from-orange-500/20 to-amber-500/10 border-orange-500/20 dark:border-orange-500/30",
  workout: "from-blue-500/20 to-indigo-500/10 border-blue-500/20 dark:border-blue-500/30",
  running: "from-emerald-500/20 to-green-500/10 border-emerald-500/20 dark:border-emerald-500/30",
  consistency: "from-purple-500/20 to-violet-500/10 border-purple-500/20 dark:border-purple-500/30",
  goals: "from-rose-500/20 to-pink-500/10 border-rose-500/20 dark:border-rose-500/30",
}

const categoryAccent: Record<string, string> = {
  streak: "text-orange-600 dark:text-orange-400",
  workout: "text-blue-600 dark:text-blue-400",
  running: "text-emerald-600 dark:text-emerald-400",
  consistency: "text-purple-600 dark:text-purple-400",
  goals: "text-rose-600 dark:text-rose-400",
}

const iconMap: Record<string, typeof Flame> = {
  Flame,
  Dumbbell,
  Footprints,
  CalendarCheck,
  Target,
}

const rankColors: Record<string, string> = {
  Beginner: "bg-muted text-muted-foreground",
  Rookie: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400 dark:border-blue-500/30",
  Intermediate: "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400 dark:border-purple-500/30",
  Veteran: "bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
  Elite: "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400 dark:border-rose-500/30",
}

const tabs = ["all", "streak", "workout", "running", "consistency", "goals"] as const

function AchievementSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/40 bg-card p-5 shadow-lg">
          <div className="mb-3 flex items-start gap-3">
            <Skeleton className="size-10 rounded-xl" />
            <div className="flex-1">
              <Skeleton className="mb-1 h-4 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="size-5 rounded" />
          </div>
          <Skeleton className="mb-1 h-2 w-full rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AchievementsPage() {
  const [activeTab, setActiveTab] = useState<Category>("all")

  const { data, isLoading, isError, error } = useQuery<AchievementsResponse>({
    queryKey: ["achievements"],
    queryFn: () => api.get("/achievements"),
  })

  const filtered =
    activeTab === "all"
      ? data?.achievements ?? []
      : data?.achievements.filter((a) => a.category === activeTab) ?? []

  const summary = data?.summary

  return (
    <div className="animate-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Achievements</h2>
        <p className="text-sm text-muted-foreground">Track your milestones and badges</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span>Unlocked</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-card-foreground">
              {summary.unlocked} <span className="text-sm font-normal text-muted-foreground">/ {summary.total}</span>
            </p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Medal className="h-4 w-4" />
              <span>Rank</span>
            </div>
            <div className="mt-1">
              <Badge variant="outline" className={`text-xs ${rankColors[summary.rank] || rankColors.Beginner}`}>
                {summary.rank}
              </Badge>
            </div>
          </div>
          <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>Current Streak</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-card-foreground">
              {summary.streak} <span className="text-sm font-normal text-muted-foreground">days</span>
            </p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>Progress</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-card-foreground">
              {summary.total > 0 ? Math.round((summary.unlocked / summary.total) * 100) : 0}%
            </p>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const Icon = categoryIcons[tab]
          const count =
            tab === "all"
              ? data?.achievements.length
              : data?.achievements.filter((a) => a.category === tab).length
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              }`}
            >
              {tab !== "all" && <Icon className="h-3.5 w-3.5" />}
              {categoryLabels[tab]}
              {count !== undefined && (
                <span className={`ml-0.5 text-xs ${activeTab === tab ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Loading */}
      {isLoading && <AchievementSkeleton />}

      {/* Error */}
      {isError && (
        <EmptyState
          icon={AlertTriangle}
          title="Failed to load achievements"
          description={error instanceof Error ? error.message : "An error occurred"}
        />
      )}

      {/* Empty */}
      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          icon={Trophy}
          title={activeTab === "all" ? "No achievements yet" : `No ${categoryLabels[activeTab]} achievements`}
          description="Start tracking your fitness to unlock achievements!"
        />
      )}

      {/* Achievements Grid */}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((achievement) => {
            const Icon = iconMap[achievement.icon] || Trophy
            const accent = categoryAccent[achievement.category]

            return (
              <div
                key={achievement.id}
                className={`rounded-2xl border bg-gradient-to-br bg-card p-5 shadow-lg transition-all hover:shadow-xl ${
                  achievement.unlocked
                    ? `border-border/40 ${categoryColors[achievement.category]}`
                    : "border-border/30 opacity-80"
                }`}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted ${
                      achievement.unlocked ? accent : "text-muted-foreground"
                    }`}>
                      <Icon className={`h-5 w-5 ${achievement.unlocked ? "" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <h3 className={`text-sm font-semibold ${achievement.unlocked ? "text-card-foreground" : "text-muted-foreground"}`}>
                        {achievement.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                  {achievement.unlocked && (
                    <Trophy className="h-5 w-5 shrink-0 text-amber-500" />
                  )}
                </div>

                <Progress
                  value={achievement.progress}
                  className={`h-2 ${achievement.unlocked ? "" : "opacity-50"}`}
                />

                <div className="mt-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-card-foreground">
                    {achievement.current} / {achievement.target}
                  </span>
                  <span className="text-muted-foreground">{achievement.progress}%</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
