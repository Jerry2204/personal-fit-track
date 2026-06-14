"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Trash2, Dumbbell } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
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

const typeLabels: Record<string, string> = {
  Push: "Push",
  Pull: "Pull",
  Leg: "Legs",
  FullBody: "Full Body",
  UpperBody: "Upper Body",
  LowerBody: "Lower Body",
  Custom: "Custom",
}

interface SetData {
  id: string
  setNumber: number
  reps: number | null
  weightKg: number | null
  rpe: number | null
}

interface WorkoutExerciseData {
  id: string
  sortOrder: number
  notes: string | null
  exercise: {
    id: string
    name: string
    muscleGroup: string
  }
  sets: SetData[]
}

interface WorkoutDetail {
  id: string
  date: string
  type: string
  durationMinutes: number | null
  notes: string | null
  totalVolume: number
  workoutExercises: WorkoutExerciseData[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatVolume(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`
  return v.toString()
}

export default function WorkoutDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const id = params.id as string
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: workout, isLoading, isError, error } = useQuery<WorkoutDetail>({
    queryKey: ["workout", id],
    queryFn: () => api.get(`/workouts/${id}`),
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/workouts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] })
      toast.success("Workout deleted")
      router.push("/workouts")
    },
    onError: () => {
      toast.error("Failed to delete workout")
    },
  })

  const handleDelete = async () => {
    setShowDeleteDialog(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        icon={Dumbbell}
        title="Failed to load workout"
        description={error instanceof Error ? error.message : "Workout not found."}
      />
    )
  }

  if (!workout) return null

  const totalSets = workout.workoutExercises.reduce((s, we) => s + we.sets.length, 0)

  return (
    <div className="animate-in space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/workouts")} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight">
              {typeLabels[workout.type] || workout.type}
            </h2>
            <Badge variant="secondary" className="text-[10px]">
              {formatDate(workout.date)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatTime(workout.date)}
            {workout.durationMinutes && ` · ${workout.durationMinutes} min`}
            {` · ${workout.workoutExercises.length} exercises · ${totalSets} sets`}
          </p>
        </div>
        <Button
          variant="destructive"
          size="icon"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {workout.notes && (
        <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg text-card-foreground">
          <p className="text-sm text-muted-foreground">{workout.notes}</p>
        </div>
      )}

      <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-lg text-card-foreground">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Exercises</h3>
          <div className="text-right">
            <p className="text-lg font-bold text-foreground">
              {formatVolume(workout.totalVolume)}
            </p>
            <p className="text-[10px] text-muted-foreground">total volume (kg)</p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {workout.workoutExercises.map((we, i) => {
            const exVolume = we.sets.reduce((s, set) => s + (set.reps ?? 0) * (set.weightKg ?? 0), 0)
            return (
              <div key={we.id} className="rounded-xl border border-border/40 bg-muted/30 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-sm font-semibold text-card-foreground">{we.exercise.name}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {we.exercise.muscleGroup}
                    </Badge>
                  </div>
                  {exVolume > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {formatVolume(exVolume)} kg volume
                    </span>
                  )}
                </div>

                {we.notes && (
                  <p className="mb-2 text-xs text-muted-foreground">{we.notes}</p>
                )}

                {we.sets.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-muted-foreground">
                          <th className="w-12 pb-1 font-medium">Set</th>
                          <th className="pb-1 font-medium">kg</th>
                          <th className="pb-1 font-medium">Reps</th>
                          <th className="pb-1 font-medium">RPE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {we.sets.map((set) => (
                          <tr key={set.id} className="border-t border-border/20">
                            <td className="py-1.5 text-muted-foreground">{set.setNumber}</td>
                            <td className="py-1.5 font-medium text-card-foreground">{set.weightKg ?? "-"}</td>
                            <td className="py-1.5 text-card-foreground">{set.reps ?? "-"}</td>
                            <td className="py-1.5 text-muted-foreground">{set.rpe ?? "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {we.sets.length === 0 && (
                  <p className="text-xs text-muted-foreground">No sets recorded</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete workout?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workout? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
