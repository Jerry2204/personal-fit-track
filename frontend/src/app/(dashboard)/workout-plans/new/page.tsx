"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { format } from "date-fns"

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const workoutTypes = [
  { value: "Push", label: "Push" },
  { value: "Pull", label: "Pull" },
  { value: "Leg", label: "Legs" },
  { value: "FullBody", label: "Full Body" },
  { value: "UpperBody", label: "Upper Body" },
  { value: "LowerBody", label: "Lower Body" },
  { value: "Custom", label: "Custom" },
]

const runTypes = [
  { value: "EasyRun", label: "Easy Run" },
  { value: "RecoveryRun", label: "Recovery Run" },
  { value: "TempoRun", label: "Tempo Run" },
  { value: "IntervalRun", label: "Interval Run" },
  { value: "LongRun", label: "Long Run" },
  { value: "Race", label: "Race" },
]

interface ActivityEntry {
  id: string
  activityType: "Workout" | "Run"
  name: string
  workoutType: string
  runType: string
  targetDistanceKm: string
  targetDurationMinutes: string
  notes: string
}

interface DayEntry {
  dayOfWeek: number
  name: string
  activities: ActivityEntry[]
}

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

function createDefaultActivity(dayOfWeek: number, type: "Workout" | "Run"): ActivityEntry {
  const dayName = dayNames[dayOfWeek]
  return {
    id: generateId(),
    activityType: type,
    name: type === "Workout" ? `${dayName} Workout` : `${dayName} Run`,
    workoutType: "Push",
    runType: "EasyRun",
    targetDistanceKm: "",
    targetDurationMinutes: "",
    notes: "",
  }
}

function createDefaultDay(index: number): DayEntry {
  return {
    dayOfWeek: index,
    name: dayNames[index],
    activities: [],
  }
}

export default function NewWorkoutPlanPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [days, setDays] = useState<DayEntry[]>(
    Array.from({ length: 7 }, (_, i) => createDefaultDay(i)),
  )

  const createMutation = useMutation({
    mutationFn: (data: { name: string; startDate: string; days: unknown[] }) =>
      api.post("/workout-plans", data),
    onSuccess: () => {
      toast.success("Workout plan created")
      router.push("/workout-plans")
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to create workout plan")
    },
  })

  const addActivity = (dayIndex: number, type: "Workout" | "Run") => {
    setDays((prev) => {
      const next = [...prev]
      next[dayIndex] = {
        ...next[dayIndex],
        activities: [...next[dayIndex].activities, createDefaultActivity(dayIndex, type)],
      }
      return next
    })
  }

  const removeActivity = (dayIndex: number, activityId: string) => {
    setDays((prev) => {
      const next = [...prev]
      next[dayIndex] = {
        ...next[dayIndex],
        activities: next[dayIndex].activities.filter((a) => a.id !== activityId),
      }
      return next
    })
  }

  const updateActivity = (dayIndex: number, activityId: string, updates: Partial<ActivityEntry>) => {
    setDays((prev) => {
      const next = [...prev]
      next[dayIndex] = {
        ...next[dayIndex],
        activities: next[dayIndex].activities.map((a) =>
          a.id === activityId ? { ...a, ...updates } : a,
        ),
      }
      return next
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Please enter a plan name")
      return
    }

    const hasAnyActivity = days.some((d) => d.activities.length > 0)
    if (!hasAnyActivity) {
      toast.error("Add at least one activity to the plan")
      return
    }

    const monday = new Date(startDate + "T00:00:00")
    const day = monday.getDay()
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1)
    monday.setDate(diff)

    const payloadDays = days
      .filter((d) => d.activities.length > 0)
      .map((d) => ({
        dayOfWeek: d.dayOfWeek,
        name: d.name || undefined,
        sortOrder: d.dayOfWeek,
        activities: d.activities.map((a) => ({
          activityType: a.activityType,
          name: a.name || undefined,
          workoutType: a.activityType === "Workout" ? (a.workoutType || undefined) : undefined,
          runType: a.activityType === "Run" ? (a.runType || undefined) : undefined,
          targetDistanceKm: a.targetDistanceKm ? parseFloat(a.targetDistanceKm) : undefined,
          targetDurationMinutes: a.targetDurationMinutes ? parseInt(a.targetDurationMinutes, 10) : undefined,
          sortOrder: 0,
        })),
      }))

    createMutation.mutate({
      name: name.trim(),
      startDate: format(monday, "yyyy-MM-dd"),
      days: payloadDays,
    })
  }

  return (
    <div className="animate-in space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/workout-plans")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">New Workout Plan</h2>
          <p className="text-sm text-muted-foreground">
            Create a weekly training schedule
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-lg text-card-foreground">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                placeholder="e.g. Push Pull Legs Week"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Week Starting</Label>
              <DatePicker value={startDate} onChange={setStartDate} />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Weekly Schedule</h3>
          {days.map((day, dayIndex) => (
            <div
              key={day.dayOfWeek}
              className="rounded-2xl border border-border/40 bg-card p-5 shadow-lg text-card-foreground"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {["S", "M", "T", "W", "T", "F", "S"][dayIndex]}
                  </div>
                  <span className="text-sm font-semibold">{dayNames[dayIndex]}</span>
                  {day.activities.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">Rest day</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addActivity(dayIndex, "Workout")}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Workout
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => addActivity(dayIndex, "Run")}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Run
                  </Button>
                </div>
              </div>

              {day.activities.length > 0 && (
                <div className="space-y-3">
                  {day.activities.map((activity, actIndex) => (
                    <div
                      key={activity.id}
                      className="rounded-xl border border-border/30 bg-muted/30 p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">
                          {activity.activityType === "Workout" ? "🏋️ Workout" : "🏃 Run"} #{actIndex + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeActivity(dayIndex, activity.id)}
                          className="flex size-7 items-center justify-center rounded-lg text-destructive hover:bg-destructive/20"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-1">
                          <Label className="text-xs">Name</Label>
                          <Input
                            placeholder="e.g. Morning Push"
                            value={activity.name}
                            onChange={(e) => updateActivity(dayIndex, activity.id, { name: e.target.value })}
                          />
                        </div>

                        {activity.activityType === "Workout" ? (
                          <div className="space-y-1">
                            <Label className="text-xs">Type</Label>
                            <Select
                              value={activity.workoutType}
                              onValueChange={(v) => updateActivity(dayIndex, activity.id, { workoutType: v })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {workoutTypes.map((wt) => (
                                  <SelectItem key={wt.value} value={wt.value}>
                                    {wt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <Label className="text-xs">Type</Label>
                            <Select
                              value={activity.runType}
                              onValueChange={(v) => updateActivity(dayIndex, activity.id, { runType: v })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {runTypes.map((rt) => (
                                  <SelectItem key={rt.value} value={rt.value}>
                                    {rt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {activity.activityType === "Run" && (
                          <>
                            <div className="space-y-1">
                              <Label className="text-xs">Target Distance (km)</Label>
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                placeholder="e.g. 5"
                                value={activity.targetDistanceKm}
                                onChange={(e) => updateActivity(dayIndex, activity.id, { targetDistanceKm: e.target.value })}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Target Duration (min)</Label>
                              <Input
                                type="number"
                                min="0"
                                placeholder="e.g. 30"
                                value={activity.targetDurationMinutes}
                                onChange={(e) => updateActivity(dayIndex, activity.id, { targetDurationMinutes: e.target.value })}
                              />
                            </div>
                          </>
                        )}

                        {activity.activityType === "Workout" && (
                          <div className="space-y-1 sm:col-span-1 lg:col-span-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="destructive" onClick={() => router.push("/workout-plans")}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create Plan"}
          </Button>
        </div>
      </form>
    </div>
  )
}
