"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
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

const muscleGroups = [
  "Chest", "Back", "Shoulders", "Biceps", "Triceps",
  "Legs", "Glutes", "Core", "FullBody",
] as const

const equipmentTypes = [
  "Barbell", "Dumbbell", "Machine", "Cable",
  "Bodyweight", "Kettlebell", "Band", "Other",
] as const

const difficultyLevels = [
  "Beginner", "Intermediate", "Advanced",
] as const

const exerciseSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  muscleGroup: z.string().min(1, "Muscle group is required"),
  equipmentType: z.string().optional(),
  difficultyLevel: z.string().optional(),
  instructions: z.string().max(1000).optional(),
})

type ExerciseFormValues = z.infer<typeof exerciseSchema>

interface Exercise {
  id: string
  name: string
  muscleGroup: string
  equipmentType: string
  difficultyLevel: string
  instructions: string | null
}

interface ExerciseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ExerciseFormValues) => Promise<void>
  exercise?: Exercise | null
}

export function ExerciseFormDialog({
  open,
  onOpenChange,
  onSubmit,
  exercise,
}: ExerciseFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: "",
      muscleGroup: "",
      equipmentType: "",
      difficultyLevel: "",
      instructions: "",
    },
  })

  useEffect(() => {
    if (exercise) {
      setValue("name", exercise.name)
      setValue("muscleGroup", exercise.muscleGroup)
      setValue("equipmentType", exercise.equipmentType)
      setValue("difficultyLevel", exercise.difficultyLevel)
      setValue("instructions", exercise.instructions ?? "")
    } else {
      reset()
    }
  }, [exercise, setValue, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{exercise ? "Edit Exercise" : "Add Exercise"}</DialogTitle>
          <DialogDescription>
            {exercise
              ? "Update the exercise details."
              : "Create a new exercise for your library."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              {...register("name")}
              placeholder="e.g. Bench Press"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Muscle Group</label>
            <Select
              onValueChange={(v) => setValue("muscleGroup", v)}
              defaultValue={exercise?.muscleGroup ?? ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select muscle group" />
              </SelectTrigger>
              <SelectContent>
                {muscleGroups.map((mg) => (
                  <SelectItem key={mg} value={mg}>
                    {mg === "FullBody" ? "Full Body" : mg}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.muscleGroup && (
              <p className="text-xs text-destructive">{errors.muscleGroup.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Equipment</label>
              <Select
                onValueChange={(v) => setValue("equipmentType", v)}
                defaultValue={exercise?.equipmentType ?? ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {equipmentTypes.map((eq) => (
                    <SelectItem key={eq} value={eq}>
                      {eq}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select
                onValueChange={(v) => setValue("difficultyLevel", v)}
                defaultValue={exercise?.difficultyLevel ?? ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {difficultyLevels.map((dl) => (
                    <SelectItem key={dl} value={dl}>
                      {dl}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Instructions (optional)</label>
            <Textarea
              {...register("instructions")}
              placeholder="How to perform this exercise..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : exercise ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
