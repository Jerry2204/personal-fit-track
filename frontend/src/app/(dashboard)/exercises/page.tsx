"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Pencil, Trash2, Dumbbell } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { ExerciseFormDialog } from "@/components/exercises/exercise-form-dialog"
import { ExerciseSkeleton } from "@/components/exercises/exercise-skeleton"

const muscleGroups = [
  "All",
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Legs",
  "Glutes",
  "Core",
  "FullBody",
] as const

interface Exercise {
  id: string
  name: string
  muscleGroup: string
  equipmentType: string
  difficultyLevel: string
  instructions: string | null
  isCustom: boolean
  createdByUserId: string | null
}

interface ExerciseFormValues {
  name: string
  muscleGroup: string
  equipmentType?: string
  difficultyLevel?: string
  instructions?: string
}

interface ExercisesResponse {
  data: Exercise[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function ExercisesPage() {
  const queryClient = useQueryClient()
  const [muscleGroup, setMuscleGroup] = useState("All")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const { data, isLoading, isError, error } = useQuery<ExercisesResponse>({
    queryKey: ["exercises", muscleGroup],
    queryFn: () => {
      const params = new URLSearchParams()
      if (muscleGroup !== "All") {
        params.set("muscleGroup", muscleGroup)
      }
      params.set("limit", "100")
      return api.get(`/exercises?${params.toString()}`)
    },
  })

  const createMutation = useMutation({
    mutationFn: (formData: ExerciseFormValues) =>
      api.post("/exercises", formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] })
      setDialogOpen(false)
      toast.success("Exercise created")
    },
    onError: () => {
      toast.error("Failed to create exercise")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data: formData }: { id: string; data: ExerciseFormValues }) =>
      api.patch(`/exercises/${id}`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] })
      setDialogOpen(false)
      setEditingExercise(null)
      toast.success("Exercise updated")
    },
    onError: () => {
      toast.error("Failed to update exercise")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/exercises/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exercises"] })
      setDeleteTarget(null)
      toast.success("Exercise deleted")
    },
    onError: () => {
      toast.error("Failed to delete exercise")
    },
  })

  const handleSubmit = async (formData: ExerciseFormValues) => {
    const data = {
      ...formData,
      equipmentType: formData.equipmentType || undefined,
      difficultyLevel: formData.difficultyLevel || undefined,
      instructions: formData.instructions || undefined,
    }

    if (editingExercise) {
      await updateMutation.mutateAsync({ id: editingExercise.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise)
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditingExercise(null)
    setDialogOpen(true)
  }

  const handleDelete = async (id: string, name: string) => {
    setDeleteTarget({ id, name })
  }

  const loading = isLoading || createMutation.isPending || updateMutation.isPending

  return (
    <div className="animate-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Exercise Library</h2>
          <p className="text-sm text-muted-foreground">
            Browse and manage your exercise catalog
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Exercise
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Select value={muscleGroup} onValueChange={setMuscleGroup}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by muscle" />
          </SelectTrigger>
          <SelectContent>
            {muscleGroups.map((mg) => (
              <SelectItem key={mg} value={mg}>
                {mg === "All" ? "All Muscle Groups" : mg === "FullBody" ? "Full Body" : mg}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {data && (
          <p className="text-sm text-muted-foreground">
            {data.total} exercise{data.total !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {isLoading && <ExerciseSkeleton />}

      {isError && (
        <EmptyState
          icon={Dumbbell}
          title="Failed to load exercises"
          description={error instanceof Error ? error.message : "Could not connect to the server. Make sure the backend is running."}
        />
      )}

      {!isLoading && !isError && data && data.data.length === 0 && (
        <EmptyState
          icon={Dumbbell}
          title="No exercises found"
          description={
            muscleGroup !== "All"
              ? `No exercises in the "${muscleGroup}" group. Try a different filter.`
              : "Get started by adding your first exercise."
          }
          action={muscleGroup === "All" ? { label: "Add Exercise", onClick: handleAdd } : undefined}
        />
      )}

      {!isLoading && !isError && data && data.data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((exercise) => (
            <div
              key={exercise.id}
              className="group relative rounded-2xl border border-border/40 bg-card p-5 shadow-lg text-card-foreground transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="mb-3 flex items-start justify-between">
                <h3 className="text-base font-semibold text-foreground">
                  {exercise.name}
                </h3>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => handleEdit(exercise)}
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                    title="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(exercise.id, exercise.name)}
                    className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="text-[10px]">
                    {exercise.muscleGroup === "FullBody" ? "Full Body" : exercise.muscleGroup}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {exercise.equipmentType}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {exercise.difficultyLevel}
                  </Badge>
                </div>

                {exercise.instructions && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {exercise.instructions}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ExerciseFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingExercise(null)
        }}
        onSubmit={handleSubmit}
        exercise={editingExercise}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete exercise?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
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
