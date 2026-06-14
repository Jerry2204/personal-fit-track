"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Trash2, Footprints } from "lucide-react"
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
  EasyRun: "Easy Run",
  RecoveryRun: "Recovery Run",
  TempoRun: "Tempo Run",
  IntervalRun: "Interval Run",
  LongRun: "Long Run",
  Race: "Race",
}

interface RunDetail {
  id: string
  date: string
  distanceKm: number
  durationMinutes: number
  averagePace: number | null
  type: string
  heartRateAvg: number | null
  caloriesEstimate: number | null
  notes: string | null
  shoe: { id: string; brand: string; model: string } | null
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

export default function RunDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const id = params.id as string
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const { data: run, isLoading, isError, error } = useQuery<RunDetail>({
    queryKey: ["run", id],
    queryFn: () => api.get(`/runs/${id}`),
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/runs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["runs"] })
      toast.success("Run deleted")
      router.push("/running")
    },
    onError: () => {
      toast.error("Failed to delete run")
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        icon={Footprints}
        title="Failed to load run"
        description={error instanceof Error ? error.message : "Run not found."}
      />
    )
  }

  if (!run) return null

  return (
    <div className="animate-in space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/running")} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight">
              {run.distanceKm.toFixed(2)} km
            </h2>
            <Badge variant="secondary" className="text-[10px]">
              {typeLabels[run.type] || run.type}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDate(run.date)} · {formatTime(run.date)}
          </p>
        </div>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg text-card-foreground transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
          <p className="text-xl font-bold">{run.distanceKm.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">distance (km)</p>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg text-card-foreground transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
          <p className="text-xl font-bold">{formatDuration(run.durationMinutes)}</p>
          <p className="text-xs text-muted-foreground">duration</p>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg text-card-foreground transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
          <p className="text-xl font-bold">{formatPace(run.averagePace)}</p>
          <p className="text-xs text-muted-foreground">avg pace</p>
        </div>
      </div>

      {run.notes && (
        <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg text-card-foreground">
          <p className="text-sm text-muted-foreground">{run.notes}</p>
        </div>
      )}

      {run.shoe && (
        <div className="rounded-2xl border border-border/40 bg-card p-4 shadow-lg text-card-foreground">
          <p className="text-sm font-semibold">Shoe</p>
          <p className="text-sm text-muted-foreground">
            {run.shoe.brand} {run.shoe.model}
          </p>
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
