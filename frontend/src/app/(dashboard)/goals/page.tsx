"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Target, Trash2, CheckCircle2, Pencil } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
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

interface Goal {
  id: string
  name: string
  type: string
  targetValue: number
  currentValue: number
  unit: string | null
  deadline: string | null
  status: string
  progress: number
}

const goalTypes = [
  "RunDistance",
  "WorkoutSessions",
  "BodyWeight",
  "Strength",
  "RunningPace",
  "Nutrition",
  "Other",
] as const

const typeLabels: Record<string, string> = {
  RunDistance: "Run Distance",
  WorkoutSessions: "Workout Sessions",
  BodyWeight: "Body Weight",
  Strength: "Strength",
  RunningPace: "Running Pace",
  Nutrition: "Nutrition",
  Other: "Other",
}

const statusOptions = ["All", "Active", "Completed", "Failed"] as const

const statusColors: Record<string, string> = {
  Active: "bg-primary/10 text-primary border-primary/20",
  Completed: "bg-green-500/10 text-green-600 border-green-500/20",
  Failed: "bg-destructive/10 text-destructive border-destructive/20",
}

const typeColors: Record<string, string> = {
  RunDistance: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  WorkoutSessions: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  BodyWeight: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Strength: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  RunningPace: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  Nutrition: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  Other: "bg-muted text-muted-foreground border-border/50",
}

const defaultForm = {
  name: "",
  type: "",
  targetValue: "",
  currentValue: "0",
  unit: "",
  deadline: "",
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function GoalSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/40 bg-card p-5 shadow-lg">
          <Skeleton className="mb-2 h-5 w-40" />
          <Skeleton className="mb-3 h-3 w-24" />
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="mt-2 flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function GoalsPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState("Active")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [detailGoal, setDetailGoal] = useState<Goal | null>(null)

  const filterParam = statusFilter === "All" ? "" : statusFilter
  const queryKey = ["goals", filterParam]

  const { data: goals, isLoading, isError, error } = useQuery<Goal[]>({
    queryKey,
    queryFn: () => {
      const params = filterParam ? `?status=${filterParam}` : ""
      return api.get(`/goals${params}`)
    },
  })

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post("/goals", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] })
      setDialogOpen(false)
      setForm(defaultForm)
      toast.success("Goal created")
    },
    onError: () => {
      toast.error("Failed to create goal")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) =>
      api.patch(`/goals/${id}`, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] })
      setDialogOpen(false)
      setEditingGoal(null)
      setForm(defaultForm)
      toast.success("Goal updated")
    },
    onError: () => {
      toast.error("Failed to update goal")
    },
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/goals/${id}/complete`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] })
      toast.success("Goal completed!")
    },
    onError: () => {
      toast.error("Failed to complete goal")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/goals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] })
      setDeleteId(null)
      toast.success("Goal deleted")
    },
    onError: () => {
      toast.error("Failed to delete goal")
    },
  })

  const openCreate = () => {
    setEditingGoal(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  const openEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setForm({
      name: goal.name,
      type: goal.type,
      targetValue: String(goal.targetValue),
      currentValue: String(goal.currentValue),
      unit: goal.unit ?? "",
      deadline: goal.deadline ? goal.deadline.split("T")[0] : "",
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.type || !form.targetValue) return

    const body: Record<string, unknown> = {
      name: form.name,
      type: form.type,
      targetValue: Number(form.targetValue),
      currentValue: form.currentValue ? Number(form.currentValue) : 0,
      unit: form.unit || undefined,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
    }

    if (editingGoal) {
      await updateMutation.mutateAsync({ id: editingGoal.id, body })
    } else {
      await createMutation.mutateAsync(body)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <div className="animate-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Goals</h2>
          <p className="text-sm text-muted-foreground">Set and track your fitness goals</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" />
          New Goal
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "All" ? "All Statuses" : s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {goals && (
          <p className="text-sm text-muted-foreground">
            {goals.length} goal{goals.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {isLoading && <GoalSkeleton />}

      {isError && (
        <EmptyState
          icon={Target}
          title="Failed to load goals"
          description={error instanceof Error ? error.message : "Could not connect to the server."}
        />
      )}

      {!isLoading && !isError && goals && goals.length === 0 && (
        <EmptyState
          icon={Target}
          title={
            statusFilter === "All"
              ? "No goals yet"
              : `No ${statusFilter.toLowerCase()} goals`
          }
          description="Create your first goal to start tracking progress."
          action={statusFilter === "All" ? { label: "Create Goal", onClick: openCreate } : undefined}
        />
      )}

      {!isLoading && !isError && goals && goals.length > 0 && (
        <div className="space-y-4">
          {goals.map((goal) => {
            const isActive = goal.status === "Active"
            return (
              <div
                key={goal.id}
                className="rounded-2xl border border-border/40 bg-card p-5 shadow-lg text-card-foreground transition-all hover:shadow-xl"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => setDetailGoal(detailGoal?.id === goal.id ? null : goal)}
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-card-foreground">{goal.name}</h3>
                      <Badge variant="outline" className={`text-[10px] ${typeColors[goal.type] || typeColors.Other}`}>
                        {typeLabels[goal.type] || goal.type}
                      </Badge>
                      <Badge variant="outline" className={`text-[10px] ${statusColors[goal.status]}`}>
                        {goal.status}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {goal.progress}% complete
                      {goal.deadline && ` · Due ${formatDate(goal.deadline)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-3">
                    {isActive && (
                      <>
                        <button
                          onClick={() => completeMutation.mutate(goal.id)}
                          className="flex size-8 items-center justify-center rounded-lg text-green-600 hover:bg-green-500/10"
                          title="Mark complete"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEdit(goal)}
                          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setDeleteId(goal.id)}
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <Progress value={goal.progress} className="h-2" />

                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-card-foreground font-medium">
                    {goal.currentValue} {goal.unit ?? ""}
                  </span>
                  <span className="text-muted-foreground">
                    target: {goal.targetValue} {goal.unit ?? ""}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditingGoal(null) } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingGoal ? "Edit Goal" : "New Goal"}</DialogTitle>
            <DialogDescription>
              {editingGoal ? "Update your goal details." : "Define a new fitness goal to track."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Goal Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Run 100 km this month" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {goalTypes.map((t) => (
                      <SelectItem key={t} value={t}>{typeLabels[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Unit</label>
                <Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="e.g. km, kg, sessions" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Value</label>
                <Input type="number" min="0" step="0.1" value={form.targetValue} onChange={(e) => setForm({ ...form, targetValue: e.target.value })} placeholder="e.g. 100" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Value</label>
                <Input type="number" min="0" step="0.1" value={form.currentValue} onChange={(e) => setForm({ ...form, currentValue: e.target.value })} placeholder="Start from 0" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Deadline (optional)</label>
              <DatePicker value={form.deadline} onChange={(v) => setForm({ ...form, deadline: v })} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="destructive" onClick={() => { setDialogOpen(false); setEditingGoal(null) }}>
                Cancel
              </Button>
              <Button type="submit" disabled={!form.name || !form.type || !form.targetValue || isPending}>
                {isPending ? "Saving..." : editingGoal ? "Update Goal" : "Create Goal"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete goal?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this goal? This cannot be undone.
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
