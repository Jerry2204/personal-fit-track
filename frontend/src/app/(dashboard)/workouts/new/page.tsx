"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Plus, Trash2, ChevronDown, ChevronUp, Dumbbell } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmptyState } from "@/components/ui/empty-state"

const workoutTypes = [
  "Push", "Pull", "Leg", "FullBody", "UpperBody", "LowerBody", "Custom",
] as const

const typeLabels: Record<string, string> = {
  Push: "Push",
  Pull: "Pull",
  Leg: "Legs",
  FullBody: "Full Body",
  UpperBody: "Upper Body",
  LowerBody: "Lower Body",
  Custom: "Custom",
}

interface Exercise {
  id: string
  name: string
  muscleGroup: string
  equipmentType: string
}

interface SetRow {
  id: string
  setNumber: number
  reps: string
  weightKg: string
  rpe: string
}

interface ExerciseEntry {
  exerciseId: string
  exerciseName: string
  sets: SetRow[]
}

function calcVolume(sets: SetRow[]): number {
  return sets.reduce((sum, s) => sum + (Number(s.reps) || 0) * (Number(s.weightKg) || 0), 0)
}

function formatVolume(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`
  return v.toString()
}

export default function NewWorkoutPage() {
  const router = useRouter()
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [type, setType] = useState("")
  const [duration, setDuration] = useState("")
  const [notes, setNotes] = useState("")
  const [exercises, setExercises] = useState<ExerciseEntry[]>([])
  const [search, setSearch] = useState("")

  const { data: exerciseData } = useQuery<{ data: Exercise[] }>({
    queryKey: ["exercises", "all"],
    queryFn: () => api.get("/exercises?limit=200"),
  })

  const createMutation = useMutation({
    mutationFn: (body: unknown) => api.post("/workouts", body),
    onSuccess: () => {
      toast.success("Workout saved")
      router.push("/workouts")
    },
    onError: () => {
      toast.error("Failed to save workout")
    },
  })

  const availableExercises = exerciseData?.data ?? []

  const filteredExercises = availableExercises.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase()),
  )

  const addExercise = (exercise: Exercise) => {
    if (exercises.some((e) => e.exerciseId === exercise.id)) return
    setExercises([
      ...exercises,
      {
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        sets: [],
      },
    ])
    setSearch("")
  }

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter((e) => e.exerciseId !== exerciseId))
  }

  const addSet = (exerciseId: string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.exerciseId !== exerciseId) return ex
        return {
          ...ex,
          sets: [
            ...ex.sets,
            { id: crypto.randomUUID(), setNumber: ex.sets.length + 1, reps: "", weightKg: "", rpe: "" },
          ],
        }
      }),
    )
  }

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.exerciseId !== exerciseId) return ex
        const newSets = ex.sets
          .filter((s) => s.id !== setId)
          .map((s, i) => ({ ...s, setNumber: i + 1 }))
        return { ...ex, sets: newSets }
      }),
    )
  }

  const updateSet = (exerciseId: string, setId: string, field: keyof SetRow, value: string) => {
    setExercises(
      exercises.map((ex) => {
        if (ex.exerciseId !== exerciseId) return ex
        return {
          ...ex,
          sets: ex.sets.map((s) => (s.id === setId ? { ...s, [field]: value } : s)),
        }
      }),
    )
  }

  const totalVolume = exercises.reduce((sum, ex) => sum + calcVolume(ex.sets), 0)
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!type) return

    await createMutation.mutateAsync({
      date: new Date(date).toISOString(),
      type,
      durationMinutes: duration ? Number(duration) : undefined,
      notes: notes || undefined,
      exercises: exercises.map((ex, i) => ({
        exerciseId: ex.exerciseId,
        sortOrder: i,
        sets: ex.sets.map((s) => ({
          setNumber: s.setNumber,
          reps: s.reps ? Number(s.reps) : undefined,
          weightKg: s.weightKg ? Number(s.weightKg) : undefined,
          rpe: s.rpe ? Number(s.rpe) : undefined,
        })),
      })),
    })
  }

  return (
    <div className="animate-in space-y-6">
      <div>
        <h2 className="text-lg font-bold tracking-tight">New Workout</h2>
        <p className="text-sm text-muted-foreground">Log today&apos;s gym session</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-lg">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {workoutTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {typeLabels[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration (min)</label>
              <Input type="number" min="0" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="e.g. 60" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">Notes (optional)</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How did it feel?" rows={2} />
          </div>
        </div>

        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-lg">
          <h3 className="mb-4 text-sm font-semibold">Exercises</h3>

          <div className="relative mb-4">
            <Input
              placeholder="Search exercises..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && filteredExercises.length > 0 && (
              <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border bg-card shadow-lg">
                {filteredExercises.slice(0, 10).map((ex) => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => addExercise(ex)}
                    className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted"
                  >
                    <span className="font-medium">{ex.name}</span>
                    <span className="text-xs text-muted-foreground">{ex.muscleGroup}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {exercises.length === 0 ? (
            <EmptyState
              icon={Dumbbell}
              title="No exercises added"
              description="Search and add exercises from your library."
            />
          ) : (
            <div className="space-y-4">
              {exercises.map((ex, i) => (
                <div key={ex.exerciseId} className="rounded-xl border border-border/40 bg-muted/30 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="text-sm font-semibold">{ex.exerciseName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {ex.sets.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {calcVolume(ex.sets)} kg volume
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExercise(ex.exerciseId)}
                        className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {ex.sets.length > 0 && (
                    <div className="mb-3 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs text-muted-foreground">
                            <th className="w-12 pb-1 font-medium">Set</th>
                            <th className="pb-1 font-medium">kg</th>
                            <th className="pb-1 font-medium">Reps</th>
                            <th className="pb-1 font-medium">RPE</th>
                            <th className="w-8 pb-1" />
                          </tr>
                        </thead>
                        <tbody>
                          {ex.sets.map((s) => (
                            <tr key={s.id}>
                              <td className="py-1 text-muted-foreground">{s.setNumber}</td>
                              <td className="py-1 pr-2">
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={s.weightKg}
                                  onChange={(e) => updateSet(ex.exerciseId, s.id, "weightKg", e.target.value)}
                                  className="h-8 w-20"
                                  placeholder="0"
                                />
                              </td>
                              <td className="py-1 pr-2">
                                <Input
                                  type="number"
                                  min="0"
                                  value={s.reps}
                                  onChange={(e) => updateSet(ex.exerciseId, s.id, "reps", e.target.value)}
                                  className="h-8 w-16"
                                  placeholder="0"
                                />
                              </td>
                              <td className="py-1 pr-2">
                                <Input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.5"
                                  value={s.rpe}
                                  onChange={(e) => updateSet(ex.exerciseId, s.id, "rpe", e.target.value)}
                                  className="h-8 w-16"
                                  placeholder="-"
                                />
                              </td>
                              <td className="py-1">
                                <button
                                  type="button"
                                  onClick={() => removeSet(ex.exerciseId, s.id)}
                                  className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addSet(ex.exerciseId)}
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add Set
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {exercises.length} exercise{exercises.length !== 1 ? "s" : ""}
            {totalSets > 0 && ` · ${totalSets} set${totalSets !== 1 ? "s" : ""}`}
            {totalVolume > 0 && ` · ${formatVolume(totalVolume)} kg total volume`}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="destructive" onClick={() => router.push("/workouts")}>
              Cancel
            </Button>
            <Button type="submit" disabled={!type || createMutation.isPending}>
              {createMutation.isPending ? "Saving..." : "Save Workout"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
