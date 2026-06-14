"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { Plus, Footprints, Trash2, Download } from "lucide-react"
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
import { Skeleton } from "@/components/ui/skeleton"

interface RunListItem {
  id: string
  date: string
  distanceKm: number
  durationMinutes: number
  averagePace: number | null
  type: string
  notes: string | null
}

interface PaginatedResponse {
  data: RunListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const typeLabels: Record<string, string> = {
  EasyRun: "Easy",
  RecoveryRun: "Recovery",
  TempoRun: "Tempo",
  IntervalRun: "Interval",
  LongRun: "Long",
  Race: "Race",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function formatPace(pace: number | null) {
  if (!pace) return "-"
  const min = Math.floor(pace)
  const sec = Math.round((pace - min) * 60)
  return `${min}:${sec.toString().padStart(2, "0")} /km`
}

function RunSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/40 bg-card p-5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-9 w-20 rounded-full" />
          </div>
          <div className="mt-3 flex gap-4">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function RunningPage() {
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading, isError, error } = useQuery<PaginatedResponse>({
    queryKey: ["runs"],
    queryFn: () => api.get("/runs?limit=50"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/runs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["runs"] })
      setDeleteId(null)
      toast.success("Run deleted")
    },
    onError: () => {
      toast.error("Failed to delete run")
    },
  })

  const totalDistance = data?.data.reduce((s, r) => s + r.distanceKm, 0) ?? 0
  const totalRuns = data?.total ?? 0

  return (
    <div className="animate-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Running</h2>
          <p className="text-sm text-muted-foreground">Track your runs and progress</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => downloadCsv("/export/runs/csv", "runs.csv")} title="Export CSV">
            <Download className="h-4 w-4" />
          </Button>
          <Link href="/running/new">
            <Button>
              <Plus className="mr-1.5 h-4 w-4" />
              New Run
            </Button>
          </Link>
        </div>
      </div>

      {!isLoading && !isError && data && data.data.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg text-card-foreground">
            <p className="text-2xl font-bold">{totalRuns}</p>
            <p className="text-xs text-muted-foreground">total runs</p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg text-card-foreground">
            <p className="text-2xl font-bold">{totalDistance.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">total km</p>
          </div>
          <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg text-card-foreground">
            <p className="text-2xl font-bold">
              {data.data.length > 0
                ? formatPace(
                    data.data.reduce((s, r) => s + (r.averagePace ?? 0), 0) / data.data.length,
                  )
                : "-"}
            </p>
            <p className="text-xs text-muted-foreground">avg pace</p>
          </div>
        </div>
      )}

      {isLoading && <RunSkeleton />}

      {isError && (
        <EmptyState
          icon={Footprints}
          title="Failed to load runs"
          description={error instanceof Error ? error.message : "Could not connect to the server."}
        />
      )}

      {!isLoading && !isError && data && data.data.length === 0 && (
        <EmptyState
          icon={Footprints}
          title="No runs yet"
          description="Start tracking your running activities."
          action={{ label: "Log Your First Run", onClick: () => window.location.href = "/running/new" }}
        />
      )}

      {!isLoading && !isError && data && data.data.length > 0 && (
        <div className="space-y-3">
          {data.data.map((run) => (
            <Link
              key={run.id}
              href={`/running/${run.id}`}
              className="group block rounded-2xl border border-border/40 bg-card p-5 shadow-lg text-card-foreground transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-card-foreground">
                      {run.distanceKm.toFixed(2)} km
                    </h3>
                    <Badge variant="secondary" className="text-[10px]">
                      {typeLabels[run.type] || run.type}
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {formatDate(run.date)}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatDuration(run.durationMinutes)}
                    {" · "}
                    pace {formatPace(run.averagePace)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setDeleteId(run.id)
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

      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete run?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this run? This cannot be undone.
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
