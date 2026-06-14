"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2, Weight, Activity, Download } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { downloadCsv } from "@/lib/export-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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

interface BodyProgressEntry {
  id: string
  date: string
  weightKg: number | null
  bodyFatPercent: number | null
  waistCm: number | null
  chestCm: number | null
  armCm: number | null
  thighCm: number | null
  notes: string | null
}

interface PaginatedResponse {
  data: BodyProgressEntry[]
  total: number
}

const defaultForm = {
  date: new Date().toISOString().split("T")[0],
  weightKg: "",
  bodyFatPercent: "",
  waistCm: "",
  chestCm: "",
  armCm: "",
  thighCm: "",
  notes: "",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function SummarySkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg">
          <Skeleton className="mb-1 h-6 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      ))}
    </div>
  )
}

export default function BodyProgressPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, isError, error } = useQuery<PaginatedResponse>({
    queryKey: ["body-progress"],
    queryFn: () => api.get("/body-progress?limit=100"),
  })

  const { data: latest } = useQuery<BodyProgressEntry | null>({
    queryKey: ["body-progress", "latest"],
    queryFn: () => api.get("/body-progress/latest"),
  })

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post("/body-progress", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["body-progress"] })
      setForm(defaultForm)
      setShowForm(false)
      toast.success("Measurement saved")
    },
    onError: () => {
      toast.error("Failed to save measurement")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/body-progress/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["body-progress"] })
      setDeleteId(null)
      toast.success("Measurement deleted")
    },
    onError: () => {
      toast.error("Failed to delete measurement")
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const body: Record<string, unknown> = {
      date: new Date(form.date).toISOString(),
    }
    if (form.weightKg) body.weightKg = Number(form.weightKg)
    if (form.bodyFatPercent) body.bodyFatPercent = Number(form.bodyFatPercent)
    if (form.waistCm) body.waistCm = Number(form.waistCm)
    if (form.chestCm) body.chestCm = Number(form.chestCm)
    if (form.armCm) body.armCm = Number(form.armCm)
    if (form.thighCm) body.thighCm = Number(form.thighCm)
    if (form.notes) body.notes = form.notes

    await createMutation.mutateAsync(body)
  }

  const entries = data?.data ?? []

  const hasLatest = latest && Object.values(latest).some((v) => typeof v === "number" && v > 0)

  return (
    <div className="animate-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Body Progress</h2>
          <p className="text-sm text-muted-foreground">Track your measurements over time</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => downloadCsv("/export/body-progress/csv", "body-progress.csv")} title="Export CSV">
            <Download className="h-4 w-4" />
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-1.5 h-4 w-4" />
            {showForm ? "Close Form" : "Add Measurement"}
          </Button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border/40 bg-card p-5 shadow-lg text-card-foreground">
          <h3 className="mb-4 text-sm font-semibold">New Measurement</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Weight (kg)</label>
              <Input type="number" min="0" step="0.1" value={form.weightKg} onChange={(e) => setForm({ ...form, weightKg: e.target.value })} placeholder="e.g. 75.5" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Body Fat (%)</label>
              <Input type="number" min="0" max="100" step="0.1" value={form.bodyFatPercent} onChange={(e) => setForm({ ...form, bodyFatPercent: e.target.value })} placeholder="e.g. 15" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Waist (cm)</label>
              <Input type="number" min="0" step="0.1" value={form.waistCm} onChange={(e) => setForm({ ...form, waistCm: e.target.value })} placeholder="e.g. 80" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Chest (cm)</label>
              <Input type="number" min="0" step="0.1" value={form.chestCm} onChange={(e) => setForm({ ...form, chestCm: e.target.value })} placeholder="e.g. 100" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Arm (cm)</label>
              <Input type="number" min="0" step="0.1" value={form.armCm} onChange={(e) => setForm({ ...form, armCm: e.target.value })} placeholder="e.g. 35" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Thigh (cm)</label>
              <Input type="number" min="0" step="0.1" value={form.thighCm} onChange={(e) => setForm({ ...form, thighCm: e.target.value })} placeholder="e.g. 55" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">Notes (optional)</label>
            <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any observations?" rows={2} />
          </div>
          <div className="mt-4 flex gap-3">
            <Button type="button" variant="destructive" onClick={() => { setShowForm(false); setForm(defaultForm) }}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving..." : "Save Measurement"}
            </Button>
          </div>
        </form>
      )}

      {(isLoading || !data) && <SummarySkeleton />}

      {isError && (
        <EmptyState
          icon={Activity}
          title="Failed to load measurements"
          description={error instanceof Error ? error.message : "Could not connect to the server."}
        />
      )}

      {latest && hasLatest && !isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {latest.weightKg != null && (
            <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg text-card-foreground">
              <p className="text-xl font-bold">{latest.weightKg.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">weight (kg)</p>
            </div>
          )}
          {latest.bodyFatPercent != null && (
            <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg text-card-foreground">
              <p className="text-xl font-bold">{latest.bodyFatPercent.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground">body fat</p>
            </div>
          )}
          {latest.waistCm != null && (
            <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg text-card-foreground">
              <p className="text-xl font-bold">{latest.waistCm.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">waist (cm)</p>
            </div>
          )}
          {latest.chestCm != null && (
            <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg text-card-foreground">
              <p className="text-xl font-bold">{latest.chestCm.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">chest (cm)</p>
            </div>
          )}
          {latest.armCm != null && (
            <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg text-card-foreground">
              <p className="text-xl font-bold">{latest.armCm.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">arm (cm)</p>
            </div>
          )}
          {latest.thighCm != null && (
            <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg text-card-foreground">
              <p className="text-xl font-bold">{latest.thighCm.toFixed(1)}</p>
              <p className="text-xs text-muted-foreground">thigh (cm)</p>
            </div>
          )}
        </div>
      )}

      {!isLoading && !isError && entries.length === 0 && (
        <EmptyState
          icon={Weight}
          title="No measurements yet"
          description="Start tracking your body measurements."
          action={{ label: "Add Measurement", onClick: () => setShowForm(true) }}
        />
      )}

      {!isLoading && !isError && entries.length > 0 && (
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-lg text-card-foreground">
          <h3 className="mb-4 text-sm font-semibold">History ({entries.length} entries)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium whitespace-nowrap">Date</th>
                  <th className="pb-2 font-medium whitespace-nowrap">Weight</th>
                  <th className="pb-2 font-medium whitespace-nowrap">Body Fat</th>
                  <th className="pb-2 font-medium whitespace-nowrap">Waist</th>
                  <th className="pb-2 font-medium whitespace-nowrap">Chest</th>
                  <th className="pb-2 font-medium whitespace-nowrap">Arm</th>
                  <th className="pb-2 font-medium whitespace-nowrap">Thigh</th>
                  <th className="pb-2 font-medium whitespace-nowrap">Notes</th>
                  <th className="w-8 pb-2" />
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-t border-border/20">
                    <td className="py-2 text-card-foreground whitespace-nowrap">{formatDate(entry.date)}</td>
                    <td className="py-2 text-card-foreground">{entry.weightKg?.toFixed(1) ?? "-"}</td>
                    <td className="py-2 text-card-foreground">{entry.bodyFatPercent != null ? `${entry.bodyFatPercent.toFixed(1)}%` : "-"}</td>
                    <td className="py-2 text-card-foreground">{entry.waistCm?.toFixed(1) ?? "-"}</td>
                    <td className="py-2 text-card-foreground">{entry.chestCm?.toFixed(1) ?? "-"}</td>
                    <td className="py-2 text-card-foreground">{entry.armCm?.toFixed(1) ?? "-"}</td>
                    <td className="py-2 text-card-foreground">{entry.thighCm?.toFixed(1) ?? "-"}</td>
                    <td className="py-2 text-muted-foreground max-w-[120px] truncate">{entry.notes ?? "-"}</td>
                    <td className="py-2">
                      <button
                        onClick={() => setDeleteId(entry.id)}
                        className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete measurement?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this measurement? This cannot be undone.
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
