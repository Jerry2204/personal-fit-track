"use client"

import { useQuery } from "@tanstack/react-query"
import {
  Dumbbell,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Zap,
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts"
import { api } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { cn } from "@/lib/utils"

interface BestSet {
  weightKg: number
  reps: number
  estimatedOneRm: number
  date: string
}

interface ExerciseProgression {
  exerciseId: string
  exerciseName: string
  muscleGroup: string
  bestSet: BestSet | null
  lastUsed: { weightKg: number | null; reps: number | null; date: string } | null
  previousBestSet: BestSet | null
  volumeProgression: { date: string; volume: number }[]
  monthlyStrength: { month: string; bestWeight: number; bestReps: number; estimatedOneRm: number }[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function formatMonth(month: string) {
  const d = new Date(month + "-01T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" })
}

function ExerciseCard({ exercise }: { exercise: ExerciseProgression }) {
  const hasBest = exercise.bestSet
  const hasPrevious = exercise.previousBestSet
  const delta = hasBest && hasPrevious
    ? exercise.bestSet!.estimatedOneRm - exercise.previousBestSet!.estimatedOneRm
    : null
  const hasVolumeData = exercise.volumeProgression.length > 0
  const hasMonthlyData = exercise.monthlyStrength.length > 0

  const volumeData = exercise.volumeProgression.slice(-12)
  const monthlyData = exercise.monthlyStrength.slice(-6)

  return (
    <div className="group rounded-2xl border border-border/40 bg-card shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
      <div className="p-5">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">{exercise.exerciseName}</h3>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 mt-0.5">
                {exercise.muscleGroup}
              </Badge>
            </div>
          </div>
        </div>

        {/* Best Set + 1RM */}
        {hasBest ? (
          <div className="mb-4 space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tracking-tight text-card-foreground">
                {exercise.bestSet!.weightKg}kg × {exercise.bestSet!.reps}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(exercise.bestSet!.date)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-lg bg-primary/5 px-2.5 py-1">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">
                  e1RM {exercise.bestSet!.estimatedOneRm} kg
                </span>
              </div>
              {delta !== null && (
                <span className={cn(
                  "text-xs font-medium",
                  delta > 0 ? "text-emerald-500" : delta < 0 ? "text-red-500" : "text-muted-foreground",
                )}>
                  {delta > 0 ? "+" : ""}{delta.toFixed(1)} kg vs previous best
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="mb-4 text-sm text-muted-foreground">No data yet</div>
        )}

        {/* Previous Best Comparison */}
        {hasPrevious && (
          <div className="mb-4 rounded-xl border border-border/20 bg-muted/30 px-3 py-2">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Previous Best</p>
            <p className="text-sm text-card-foreground">
              {exercise.previousBestSet!.weightKg}kg × {exercise.previousBestSet!.reps}
              <span className="text-xs text-muted-foreground ml-2">
                (e1RM {exercise.previousBestSet!.estimatedOneRm} kg · {formatDate(exercise.previousBestSet!.date)})
              </span>
            </p>
          </div>
        )}

        {/* Last Used */}
        {exercise.lastUsed && (
          <div className="mb-4 text-xs text-muted-foreground">
            Last used: {exercise.lastUsed.weightKg ? `${exercise.lastUsed.weightKg}kg × ${exercise.lastUsed.reps ?? "—"} reps` : "no weight data"} · {formatDate(exercise.lastUsed.date)}
          </div>
        )}

        {/* Volume Progression Mini Chart */}
        {hasVolumeData && (
          <div className="mb-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <BarChart3 className="h-3.5 w-3.5" />
              Volume Progression
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={volumeData} margin={{ top: 2, right: 2, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`${Number(value).toLocaleString()} kg`, "Volume"]}
                  labelFormatter={(label) => formatDate(String(label))}
                />
                <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Monthly Strength Trend */}
        {hasMonthlyData && (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              Monthly Strength (e1RM)
            </div>
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={monthlyData} margin={{ top: 2, right: 2, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--border) / 0.3)" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={false} axisLine={false} tickLine={false} />
                <YAxis hide domain={["dataMin - 5", "dataMax + 5"]} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [`${Number(value)} kg`, "e1RM"]}
                  labelFormatter={(label) => formatMonth(String(label))}
                />
                <Line type="monotone" dataKey="estimatedOneRm" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3, fill: "hsl(var(--primary))" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}

function ProgressiveOverloadSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/40 bg-card p-5 shadow-lg">
          <div className="mb-4 flex items-start gap-3">
            <Skeleton className="size-10 rounded-xl" />
            <div>
              <Skeleton className="mb-1 h-4 w-28" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          </div>
          <Skeleton className="mb-2 h-7 w-32" />
          <Skeleton className="mb-2 h-4 w-40" />
          <Skeleton className="mb-4 h-4 w-36" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      ))}
    </div>
  )
}

export default function ProgressiveOverloadPage() {
  const { data, isLoading, isError, error } = useQuery<ExerciseProgression[]>({
    queryKey: ["progressive-overload"],
    queryFn: () => api.get("/progressive-overload"),
  })

  const exercises = data ?? []

  let content: React.ReactNode

  if (isLoading) {
    content = <ProgressiveOverloadSkeleton />
  } else if (isError) {
    content = (
      <EmptyState
        icon={AlertTriangle}
        title="Failed to load progressive overload data"
        description={error instanceof Error ? error.message : "An error occurred"}
      />
    )
  } else if (exercises.length === 0) {
    content = (
      <EmptyState
        icon={Dumbbell}
        title="No exercise data yet"
        description="Complete workouts to see your strength progression over time"
      />
    )
  } else {
    content = (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {exercises.map((ex) => (
          <ExerciseCard key={ex.exerciseId} exercise={ex} />
        ))}
      </div>
    )
  }

  return (
    <div className="animate-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Progressive Overload</h2>
        <p className="text-sm text-muted-foreground">
          Track strength progression per exercise — best sets, estimated 1RM, volume trends
        </p>
      </div>

      {/* Summary Stats */}
      {!isLoading && !isError && exercises.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg text-card-foreground">
            <p className="text-2xl font-bold">{exercises.length}</p>
            <p className="text-xs text-muted-foreground">Exercises tracked</p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg text-card-foreground">
            <p className="text-2xl font-bold">
              {exercises.filter((e) => e.bestSet).length}
            </p>
            <p className="text-xs text-muted-foreground">With PR data</p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg text-card-foreground">
            <p className="text-2xl font-bold">
              {exercises.filter((e) => e.previousBestSet).length}
            </p>
            <p className="text-xs text-muted-foreground">With improvement</p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg text-card-foreground">
            <p className="text-2xl font-bold">
              {exercises.reduce((sum, e) => sum + e.volumeProgression.length, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total logged sessions</p>
          </div>
        </div>
      )}

      {content}
    </div>
  )
}
