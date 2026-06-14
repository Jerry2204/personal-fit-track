"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2, Droplets, Moon, Footprints, Zap, Drumstick, Brain, Heart, Apple } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

interface HabitLogEntry {
  id: string
  date: string
  waterIntakeMl: number | null
  sleepHours: number | null
  steps: number | null
  bodyWeightKg: number | null
  caloriesIntake: number | null
  proteinG: number | null
  mood: string | null
  energyLevel: number | null
  workoutDone: boolean | null
  runningDone: boolean | null
  notes: string | null
}

interface PaginatedResponse {
  data: HabitLogEntry[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const MOOD_OPTIONS = [
  { value: "Great", label: "Great", color: "bg-emerald-500" },
  { value: "Good", label: "Good", color: "bg-green-400" },
  { value: "Neutral", label: "Neutral", color: "bg-gray-400" },
  { value: "Bad", label: "Bad", color: "bg-orange-400" },
  { value: "Terrible", label: "Terrible", color: "bg-red-500" },
]

const defaultForm = {
  date: new Date().toISOString().split("T")[0],
  waterIntakeMl: "",
  sleepHours: "",
  steps: "",
  caloriesIntake: "",
  proteinG: "",
  bodyWeightKg: "",
  mood: "",
  energyLevel: "",
  notes: "",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

function DetailSheet({
  entry,
  open,
  onOpenChange,
}: {
  entry: HabitLogEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!entry) return null

  const moodInfo = MOOD_OPTIONS.find((m) => m.value === entry.mood)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{formatDate(entry.date)}</SheetTitle>
          <SheetDescription>Daily habit log details</SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          {entry.waterIntakeMl != null && (
            <div className="flex items-center justify-between rounded-lg border bg-card p-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Droplets className="h-4 w-4 text-blue-500" />
                </div>
                <span className="text-sm text-card-foreground">Water</span>
              </div>
              <span className="font-medium text-card-foreground">
                {(entry.waterIntakeMl / 1000).toFixed(1)}L
              </span>
            </div>
          )}

          {entry.sleepHours != null && (
            <div className="flex items-center justify-between rounded-lg border bg-card p-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <Moon className="h-4 w-4 text-indigo-500" />
                </div>
                <span className="text-sm text-card-foreground">Sleep</span>
              </div>
              <span className="font-medium text-card-foreground">
                {entry.sleepHours}h
              </span>
            </div>
          )}

          {entry.steps != null && (
            <div className="flex items-center justify-between rounded-lg border bg-card p-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Footprints className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm text-card-foreground">Steps</span>
              </div>
              <span className="font-medium text-card-foreground">
                {entry.steps.toLocaleString()}
              </span>
            </div>
          )}

          {entry.caloriesIntake != null && (
            <div className="flex items-center justify-between rounded-lg border bg-card p-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-orange-500" />
                </div>
                <span className="text-sm text-card-foreground">Calories</span>
              </div>
              <span className="font-medium text-card-foreground">
                {entry.caloriesIntake} kcal
              </span>
            </div>
          )}

          {entry.proteinG != null && (
            <div className="flex items-center justify-between rounded-lg border bg-card p-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                  <Drumstick className="h-4 w-4 text-rose-500" />
                </div>
                <span className="text-sm text-card-foreground">Protein</span>
              </div>
              <span className="font-medium text-card-foreground">
                {entry.proteinG}g
              </span>
            </div>
          )}

          {entry.bodyWeightKg != null && (
            <div className="flex items-center justify-between rounded-lg border bg-card p-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Apple className="h-4 w-4 text-emerald-500" />
                </div>
                <span className="text-sm text-card-foreground">Weight</span>
              </div>
              <span className="font-medium text-card-foreground">
                {entry.bodyWeightKg.toFixed(1)} kg
              </span>
            </div>
          )}

          {entry.mood && (
            <div className="flex items-center justify-between rounded-lg border bg-card p-3">
              <div className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-lg ${moodInfo?.color || "bg-gray-400"}/20 flex items-center justify-center`}>
                  <Brain className={`h-4 w-4 ${moodInfo?.color ? `text-${moodInfo.color.replace("bg-", "")}` : "text-gray-400"}`} />
                </div>
                <span className="text-sm text-card-foreground">Mood</span>
              </div>
              <Badge variant="outline" className="capitalize">
                {entry.mood}
              </Badge>
            </div>
          )}

          {entry.energyLevel != null && (
            <div className="flex items-center justify-between rounded-lg border bg-card p-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Heart className="h-4 w-4 text-amber-500" />
                </div>
                <span className="text-sm text-card-foreground">Energy</span>
              </div>
              <span className="font-medium text-card-foreground">
                {entry.energyLevel}/10
              </span>
            </div>
          )}

          {entry.notes && (
            <div className="rounded-lg border bg-card p-3">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</span>
              <p className="mt-1 text-sm text-card-foreground">{entry.notes}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function HabitsPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [detailEntry, setDetailEntry] = useState<HabitLogEntry | null>(null)
  const [editEntry, setEditEntry] = useState<HabitLogEntry | null>(null)
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, error } = useQuery<PaginatedResponse>({
    queryKey: ["habit-logs", page],
    queryFn: () => api.get(`/habit-logs?page=${page}&limit=20`),
  })

  const { data: todayEntry } = useQuery<HabitLogEntry | null>({
    queryKey: ["habit-logs", "today"],
    queryFn: () => api.get("/habit-logs/today"),
  })

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post("/habit-logs", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit-logs"] })
      setForm(defaultForm)
      setShowForm(false)
      toast.success("Habit log saved")
    },
    onError: () => {
      toast.error("Failed to save habit log")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.patch(`/habit-logs/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit-logs"] })
      setEditEntry(null)
      setForm(defaultForm)
      toast.success("Habit log updated")
    },
    onError: () => {
      toast.error("Failed to update habit log")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/habit-logs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habit-logs"] })
      setDeleteId(null)
      toast.success("Entry deleted")
    },
    onError: () => {
      toast.error("Failed to delete entry")
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body: Record<string, unknown> = { date: form.date }
    if (form.waterIntakeMl) body.waterIntakeMl = Number(form.waterIntakeMl)
    if (form.sleepHours) body.sleepHours = Number(form.sleepHours)
    if (form.steps) body.steps = Number(form.steps)
    if (form.caloriesIntake) body.caloriesIntake = Number(form.caloriesIntake)
    if (form.proteinG) body.proteinG = Number(form.proteinG)
    if (form.bodyWeightKg) body.bodyWeightKg = Number(form.bodyWeightKg)
    if (form.mood) body.mood = form.mood
    if (form.energyLevel) body.energyLevel = Number(form.energyLevel)
    if (form.notes) body.notes = form.notes

    if (editEntry) {
      updateMutation.mutate({ id: editEntry.id, body })
    } else {
      createMutation.mutate(body)
    }
  }

  function handleEdit(entry: HabitLogEntry) {
    setEditEntry(entry)
    setForm({
      date: entry.date.split("T")[0],
      waterIntakeMl: entry.waterIntakeMl?.toString() || "",
      sleepHours: entry.sleepHours?.toString() || "",
      steps: entry.steps?.toString() || "",
      caloriesIntake: entry.caloriesIntake?.toString() || "",
      proteinG: entry.proteinG?.toString() || "",
      bodyWeightKg: entry.bodyWeightKg?.toString() || "",
      mood: entry.mood || "",
      energyLevel: entry.energyLevel?.toString() || "",
      notes: entry.notes || "",
    })
    setShowForm(true)
  }

  if (isError) {
    return (
      <div className="animate-in space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground">Daily Habits</h1>
          <p className="text-muted-foreground">Track your daily wellness routines</p>
        </div>
        <EmptyState
          icon={Footprints}
          title="Failed to load habits"
          description={(error as Error)?.message || "An error occurred"}
          action={{ label: "Try Again", onClick: () => window.location.reload() }}
        />
      </div>
    )
  }

  return (
    <div className="animate-in space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-card-foreground tracking-tight">Daily Habits</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Track your daily wellness routines</p>
        </div>
        <Button onClick={() => { setEditEntry(null); setForm(defaultForm); setShowForm(!showForm) }}>
          <Plus className="h-4 w-4 mr-1.5" />
          {showForm ? "Cancel" : "New Entry"}
        </Button>
      </div>

      {/* Today Quick Summary */}
      {todayEntry && !isLoading && (
        <div className="rounded-xl border bg-card p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Today&apos;s Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {todayEntry.waterIntakeMl != null && (
              <div className="flex items-center gap-2 text-sm">
                <Droplets className="h-4 w-4 text-blue-500 shrink-0" />
                <span className="text-card-foreground">{(todayEntry.waterIntakeMl / 1000).toFixed(1)}L</span>
              </div>
            )}
            {todayEntry.sleepHours != null && (
              <div className="flex items-center gap-2 text-sm">
                <Moon className="h-4 w-4 text-indigo-500 shrink-0" />
                <span className="text-card-foreground">{todayEntry.sleepHours}h</span>
              </div>
            )}
            {todayEntry.steps != null && (
              <div className="flex items-center gap-2 text-sm">
                <Footprints className="h-4 w-4 text-primary shrink-0" />
                <span className="text-card-foreground">{todayEntry.steps.toLocaleString()}</span>
              </div>
            )}
            {todayEntry.caloriesIntake != null && (
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-orange-500 shrink-0" />
                <span className="text-card-foreground">{todayEntry.caloriesIntake}</span>
              </div>
            )}
            {todayEntry.proteinG != null && (
              <div className="flex items-center gap-2 text-sm">
                <Drumstick className="h-4 w-4 text-rose-500 shrink-0" />
                <span className="text-card-foreground">{todayEntry.proteinG}g</span>
              </div>
            )}
            {todayEntry.mood && (
              <div className="flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4 text-purple-500 shrink-0" />
                <span className="text-card-foreground capitalize">{todayEntry.mood}</span>
              </div>
            )}
            {todayEntry.energyLevel != null && (
              <div className="flex items-center gap-2 text-sm">
                <Heart className="h-4 w-4 text-amber-500 shrink-0" />
                <span className="text-card-foreground">{todayEntry.energyLevel}/10</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-card-foreground">
              {editEntry ? "Edit Entry" : "New Habit Log"}
            </h3>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-40 h-8 text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Droplets className="h-3 w-3 text-blue-500" /> Water (ml)
              </label>
              <Input
                type="number"
                placeholder="e.g. 2000"
                value={form.waterIntakeMl}
                onChange={(e) => setForm({ ...form, waterIntakeMl: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Moon className="h-3 w-3 text-indigo-500" /> Sleep (hours)
              </label>
              <Input
                type="number"
                step="0.5"
                placeholder="e.g. 7.5"
                value={form.sleepHours}
                onChange={(e) => setForm({ ...form, sleepHours: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Footprints className="h-3 w-3 text-primary" /> Steps
              </label>
              <Input
                type="number"
                placeholder="e.g. 10000"
                value={form.steps}
                onChange={(e) => setForm({ ...form, steps: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3 text-orange-500" /> Calories
              </label>
              <Input
                type="number"
                placeholder="e.g. 2200"
                value={form.caloriesIntake}
                onChange={(e) => setForm({ ...form, caloriesIntake: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Drumstick className="h-3 w-3 text-rose-500" /> Protein (g)
              </label>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g. 120"
                value={form.proteinG}
                onChange={(e) => setForm({ ...form, proteinG: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Apple className="h-3 w-3 text-emerald-500" /> Weight (kg)
              </label>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g. 75"
                value={form.bodyWeightKg}
                onChange={(e) => setForm({ ...form, bodyWeightKg: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Brain className="h-3 w-3 text-purple-500" /> Mood
              </label>
              <Select
                value={form.mood}
                onValueChange={(v) => setForm({ ...form, mood: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  {MOOD_OPTIONS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${m.color}`} />
                        {m.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground flex items-center gap-1">
                <Heart className="h-3 w-3 text-amber-500" /> Energy (1-10)
              </label>
              <Input
                type="number"
                min={1}
                max={10}
                placeholder="e.g. 7"
                value={form.energyLevel}
                onChange={(e) => setForm({ ...form, energyLevel: e.target.value })}
              />
            </div>
          </div>

          <Textarea
            placeholder="Notes (optional)"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="min-h-[60px]"
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="destructive" onClick={() => { setShowForm(false); setEditEntry(null); setForm(defaultForm) }}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editEntry ? "Update" : "Save"}
            </Button>
          </div>
        </form>
      )}

      {/* History */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : data && data.data.length === 0 ? (
        <EmptyState
          icon={Footprints}
          title="No habit logs yet"
          description="Start tracking your daily habits to see them here."
        />
      ) : (
        <div className="space-y-2">
          {data?.data.map((entry) => (
            <div
              key={entry.id}
              className="rounded-xl border bg-card p-3 flex items-center justify-between hover:bg-accent/5 transition-colors cursor-pointer"
              onClick={() => setDetailEntry(entry)}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="hidden sm:flex flex-col items-center justify-center h-10 w-10 rounded-lg bg-primary/10 shrink-0">
                  <span className="text-xs font-bold text-primary leading-none">
                    {new Date(entry.date).getDate()}
                  </span>
                  <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
                    {new Date(entry.date).toLocaleDateString("en-US", { month: "short" })}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  {entry.waterIntakeMl != null && (
                    <span className="text-xs flex items-center gap-1 text-card-foreground">
                      <Droplets className="h-3 w-3 text-blue-500" />
                      {(entry.waterIntakeMl / 1000).toFixed(1)}L
                    </span>
                  )}
                  {entry.sleepHours != null && (
                    <span className="text-xs flex items-center gap-1 text-card-foreground">
                      <Moon className="h-3 w-3 text-indigo-500" />
                      {entry.sleepHours}h
                    </span>
                  )}
                  {entry.steps != null && (
                    <span className="text-xs flex items-center gap-1 text-card-foreground">
                      <Footprints className="h-3 w-3 text-primary" />
                      {entry.steps.toLocaleString()}
                    </span>
                  )}
                  {entry.caloriesIntake != null && (
                    <span className="text-xs flex items-center gap-1 text-card-foreground">
                      <Zap className="h-3 w-3 text-orange-500" />
                      {entry.caloriesIntake}
                    </span>
                  )}
                  {entry.proteinG != null && (
                    <span className="text-xs flex items-center gap-1 text-card-foreground">
                      <Drumstick className="h-3 w-3 text-rose-500" />
                      {entry.proteinG}g
                    </span>
                  )}
                  {entry.mood && (
                    <Badge variant="outline" className="text-[10px] h-5 capitalize">
                      {entry.mood}
                    </Badge>
                  )}
                  {entry.energyLevel != null && (
                    <Badge variant="outline" className="text-[10px] h-5">
                      Energy: {entry.energyLevel}/10
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => { e.stopPropagation(); handleEdit(entry) }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => { e.stopPropagation(); setDeleteId(entry.id) }}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Habit Log</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detail Sheet */}
      <DetailSheet
        entry={detailEntry}
        open={!!detailEntry}
        onOpenChange={(open) => { if (!open) setDetailEntry(null) }}
      />
    </div>
  )
}
