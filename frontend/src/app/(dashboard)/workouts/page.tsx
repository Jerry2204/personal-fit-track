"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { Plus, Dumbbell, Trash2, Download } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { downloadCsv } from "@/lib/export-utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { WorkoutSkeleton } from "@/components/workouts/workout-skeleton"

interface WorkoutListItem {
  id: string
  date: string
  type: string
  durationMinutes: number | null
  notes: string | null
  exerciseCount: number
  setCount: number
  totalVolume: number
}

interface PaginatedResponse {
  data: WorkoutListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const typeLabels: Record<string, string> = {
  Push: "Push",
  Pull: "Pull",
  Leg: "Legs",
  FullBody: "Full Body",
  UpperBody: "Upper Body",
  LowerBody: "Lower Body",
  Custom: "Custom",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatVolume(volume: number) {
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}k`
  return volume.toString()
}

export default function WorkoutsPage() {
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, isError, error } = useQuery<PaginatedResponse>({
    queryKey: ["workouts"],
    queryFn: () => api.get("/workouts?limit=50"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/workouts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] })
      setDeleteId(null)
      toast.success("Workout deleted")
    },
    onError: () => {
      toast.error("Failed to delete workout")
    },
  })

  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  return (
    <div className="animate-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workouts</h2>
          <p className="text-sm text-muted-foreground">
            Track and review your gym sessions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => downloadCsv("/export/workouts/csv", "workouts.csv")} title="Export CSV">
            <Download className="h-4 w-4" />
          </Button>
          <Link href="/workouts/new">
            <Button>
              <Plus className="mr-1.5 h-4 w-4" />
              New Workout
            </Button>
          </Link>
        </div>
      </div>

      {isLoading && <WorkoutSkeleton />}

      {isError && (
        <EmptyState
          icon={Dumbbell}
          title="Failed to load workouts"
          description={error instanceof Error ? error.message : "Could not connect to the server."}
        />
      )}

      {!isLoading && !isError && data && data.data.length === 0 && (
        <EmptyState
          icon={Dumbbell}
          title="No workouts yet"
          description="Start tracking your gym sessions."
          action={{ label: "Log Your First Workout", onClick: () => window.location.href = "/workouts/new" }}
        />
      )}

      {!isLoading && !isError && data && data.data.length > 0 && (
        <div className="space-y-3">
          {data.data.map((workout) => (
            <Link
              key={workout.id}
              href={`/workouts/${workout.id}`}
              className="group block rounded-2xl border border-border/40 bg-card p-5 shadow-lg text-card-foreground transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">
                      {typeLabels[workout.type] || workout.type}
                    </h3>
                    <Badge variant="secondary" className="text-[10px]">
                      {formatDate(workout.date)}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {workout.exerciseCount} exercise{workout.exerciseCount !== 1 ? "s" : ""}
                    {" · "}
                    {workout.setCount} set{workout.setCount !== 1 ? "s" : ""}
                    {workout.durationMinutes && ` · ${workout.durationMinutes} min`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">
                      {formatVolume(workout.totalVolume)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">volume</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      handleDelete(workout.id)
                    }}
                    className="flex size-8 items-center justify-center rounded-lg text-destructive opacity-0 transition-opacity hover:bg-destructive/20 group-hover:opacity-100"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
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
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
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
