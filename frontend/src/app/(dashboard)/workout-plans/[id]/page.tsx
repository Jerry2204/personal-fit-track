"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Check, X, CalendarArrowUp, Dumbbell, Footprints } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  Pending: { label: "Pending", variant: "secondary" },
  Completed: { label: "Completed", variant: "default" },
  Skipped: { label: "Skipped", variant: "destructive" },
  Rescheduled: { label: "Rescheduled", variant: "outline" },
}

const typeLabels: Record<string, string> = {
  Push: "Push",
  Pull: "Pull",
  Leg: "Legs",
  FullBody: "Full Body",
  UpperBody: "Upper Body",
  LowerBody: "Lower Body",
  Custom: "Custom",
  EasyRun: "Easy Run",
  RecoveryRun: "Recovery Run",
  TempoRun: "Tempo Run",
  IntervalRun: "Interval Run",
  LongRun: "Long Run",
  Race: "Race",
}

interface WorkoutInfo {
  id: string
  date: string
  type: string
  durationMinutes: number | null
}

interface RunInfo {
  id: string
  date: string
  type: string
  distanceKm: number
  durationMinutes: number
  averagePace: number | null
}

interface PlanActivity {
  id: string
  activityType: string
  name: string | null
  workoutType: string | null
  runType: string | null
  targetDistanceKm: number | null
  targetDurationMinutes: number | null
  targetPace: number | null
  status: string
  completedDate: string | null
  notes: string | null
  workout: WorkoutInfo | null
  run: RunInfo | null
}

interface PlanDay {
  id: string
  dayOfWeek: number
  name: string | null
  notes: string | null
  activities: PlanActivity[]
}

interface WorkoutPlan {
  id: string
  name: string
  startDate: string
  totalActivities: number
  completedActivities: number
  skippedActivities: number
  progress: number
  days: PlanDay[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatPace(pace: number | null) {
  if (!pace) return ""
  const min = Math.floor(pace)
  const sec = Math.round((pace - min) * 60)
  return `${min}:${sec.toString().padStart(2, "0")} /km`
}

export default function WorkoutPlanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const id = params.id as string

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [updatingActivityId, setUpdatingActivityId] = useState<string | null>(null)

  const { data: plan, isLoading, isError, error } = useQuery<WorkoutPlan>({
    queryKey: ["workout-plan", id],
    queryFn: () => api.get(`/workout-plans/${id}`),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ activityId, status }: { activityId: string; status: string }) =>
      api.patch(`/workout-plans/${id}/activities/${activityId}`, {
        status,
        completedDate: status === "Completed" ? new Date().toISOString() : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-plan", id] })
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] })
      setUpdatingActivityId(null)
      toast.success("Activity status updated")
    },
    onError: () => {
      toast.error("Failed to update activity status")
      setUpdatingActivityId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/workout-plans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] })
      setDeleteOpen(false)
      toast.success("Workout plan deleted")
      router.push("/workout-plans")
    },
    onError: () => {
      toast.error("Failed to delete workout plan")
    },
  })

  const handleStatusChange = (activityId: string, status: string) => {
    setUpdatingActivityId(activityId)
    updateStatusMutation.mutate({ activityId, status })
  }

  if (isLoading) {
    return (
      <div className="animate-in space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="size-9 rounded-lg" />
          <div>
            <Skeleton className="h-7 w-48" />
            <Skeleton className="mt-1 h-4 w-32" />
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        icon={CalendarArrowUp}
        title="Failed to load plan"
        description={error instanceof Error ? error.message : "Could not connect to the server."}
      />
    )
  }

  if (!plan) return null

  return (
    <div className="animate-in space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/workout-plans")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{plan.name}</h2>
            <p className="text-sm text-muted-foreground">
              Week of {formatDate(plan.startDate)}
            </p>
          </div>
        </div>
        <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
          Delete Plan
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border/40 bg-card p-4 text-card-foreground shadow-lg">
          <p className="text-xs text-muted-foreground">Progress</p>
          <p className="mt-1 text-2xl font-bold">{plan.progress}%</p>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card p-4 text-card-foreground shadow-lg">
          <p className="text-xs text-muted-foreground">Completed</p>
          <p className="mt-1 text-2xl font-bold text-emerald-500">{plan.completedActivities}</p>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card p-4 text-card-foreground shadow-lg">
          <p className="text-xs text-muted-foreground">Skipped</p>
          <p className="mt-1 text-2xl font-bold text-destructive">{plan.skippedActivities}</p>
        </div>
      </div>

      <div className="space-y-3">
        {plan.days.map((day) => {
          const dayCompleted = day.activities.length > 0 && day.activities.every((a) => a.status === "Completed")
          const daySkipped = day.activities.length > 0 && day.activities.every((a) => a.status === "Skipped")

          return (
            <div
              key={day.id}
              className={`rounded-2xl border p-5 shadow-lg transition-all ${
                dayCompleted
                  ? "border-emerald-500/30 bg-card text-card-foreground"
                  : daySkipped
                    ? "border-destructive/30 bg-card text-card-foreground"
                    : "border-border/40 bg-card text-card-foreground"
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase text-muted-foreground">
                    {dayNames[day.dayOfWeek]}
                  </span>
                  {day.name && (
                    <span className="text-sm text-muted-foreground">· {day.name}</span>
                  )}
                  {day.activities.length === 0 && (
                    <Badge variant="outline" className="text-[10px]">Rest</Badge>
                  )}
                </div>
              </div>

              {day.activities.length > 0 ? (
                <div className="space-y-2">
                  {day.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`rounded-xl border p-4 transition-all ${
                        activity.status === "Completed"
                          ? "border-emerald-500/20 bg-emerald-500/5"
                          : activity.status === "Skipped"
                            ? "border-destructive/20 bg-destructive/5"
                            : "border-border/30 bg-muted/20"
                      }`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ${
                              activity.status === "Completed"
                                ? "bg-emerald-500/20 text-emerald-500"
                                : activity.status === "Skipped"
                                  ? "bg-destructive/20 text-destructive"
                                  : activity.activityType === "Workout"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-orange-500/10 text-orange-500"
                            }`}
                          >
                            {activity.activityType === "Workout" ? (
                              <Dumbbell className="h-4 w-4" />
                            ) : (
                              <Footprints className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">
                                {activity.name || typeLabels[activity.workoutType || activity.runType || ""] || "Activity"}
                              </span>
                              <Badge variant={statusConfig[activity.status]?.variant || "secondary"} className="text-[10px]">
                                {statusConfig[activity.status]?.label || activity.status}
                              </Badge>
                            </div>
                            <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                              <span>{activity.activityType === "Workout" ? "Workout" : "Run"}</span>
                              <span>·</span>
                              <span>
                                {activity.activityType === "Workout"
                                  ? typeLabels[activity.workoutType || ""] || "Custom"
                                  : typeLabels[activity.runType || ""] || "Easy Run"}
                              </span>
                              {activity.activityType === "Run" && (
                                <>
                                  {activity.targetDistanceKm && (
                                    <><span>·</span><span>Target: {activity.targetDistanceKm} km</span></>
                                  )}
                                  {activity.targetDurationMinutes && (
                                    <><span>·</span><span>Target: {activity.targetDurationMinutes} min</span></>
                                  )}
                                </>
                              )}
                            </div>
                            {activity.notes && (
                              <p className="mt-1 text-xs text-muted-foreground italic">
                                {activity.notes}
                              </p>
                            )}
                            {activity.workout && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Logged: {typeLabels[activity.workout.type] || activity.workout.type}
                                {activity.workout.durationMinutes && ` · ${activity.workout.durationMinutes} min`}
                              </p>
                            )}
                            {activity.run && (
                              <p className="mt-1 text-xs text-muted-foreground">
                                Logged: {activity.run.distanceKm}km · {activity.run.durationMinutes}min
                                {activity.run.averagePace && ` · ${formatPace(activity.run.averagePace)}`}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          {activity.status !== "Completed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-emerald-500/50 text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                              onClick={() => handleStatusChange(activity.id, "Completed")}
                              disabled={updatingActivityId === activity.id}
                            >
                              <Check className="mr-1 h-3.5 w-3.5" />
                              Complete
                            </Button>
                          )}
                          {activity.status !== "Skipped" && activity.status !== "Completed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-destructive/50 text-destructive hover:bg-destructive/10"
                              onClick={() => handleStatusChange(activity.id, "Skipped")}
                              disabled={updatingActivityId === activity.id}
                            >
                              <X className="mr-1 h-3.5 w-3.5" />
                              Skip
                            </Button>
                          )}
                          {activity.status !== "Pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(activity.id, "Pending")}
                              disabled={updatingActivityId === activity.id}
                            >
                              Reset
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-2 text-center text-xs text-muted-foreground">
                  No activities planned for this day
                </p>
              )}
            </div>
          )
        })}
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete workout plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{plan.name}&rdquo;? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
