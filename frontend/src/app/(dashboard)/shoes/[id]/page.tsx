"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Footprints,
  Trash2,
  Flag,
  Calendar,
  Gauge,
  Route,
} from "lucide-react"
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

interface MileageHistoryEntry {
  month: string
  distanceKm: number
}

interface ShoeDetail {
  id: string
  brand: string
  model: string
  purchaseDate: string | null
  maxMileageKm: number | null
  currentMileageKm: number
  isActive: boolean
  totalRuns: number
  mileageHistory: MileageHistoryEntry[]
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function monthLabel(month: string) {
  const d = new Date(month + "-01T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

function ShoeDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div>
          <Skeleton className="mb-1 h-6 w-48" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-lg">
        <Skeleton className="mb-4 h-6 w-32" />
        <Skeleton className="mb-3 h-3 w-full rounded-full" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-40 w-full rounded-2xl" />
    </div>
  )
}

export default function ShoeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showDelete, setShowDelete] = useState(false)

  const { data: shoe, isLoading, isError, error } = useQuery<ShoeDetail>({
    queryKey: ["shoe", id],
    queryFn: () => api.get(`/shoes/${id}`),
  })

  const retireMutation = useMutation({
    mutationFn: () => api.patch(`/shoes/${id}/retire`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shoe", id] })
      queryClient.invalidateQueries({ queryKey: ["shoes"] })
      toast.success("Shoe retired")
    },
    onError: () => {
      toast.error("Failed to retire shoe")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/shoes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shoes"] })
      toast.success("Shoe removed")
      router.push("/shoes")
    },
    onError: () => {
      toast.error("Failed to remove shoe")
    },
  })

  if (isLoading) {
    return (
      <div className="animate-in space-y-6">
        <ShoeDetailSkeleton />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="animate-in space-y-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-card-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <EmptyState
          icon={Footprints}
          title="Failed to load shoe"
          description={error instanceof Error ? error.message : "An error occurred"}
        />
      </div>
    )
  }

  if (!shoe) return null

  const pct =
    shoe.maxMileageKm && shoe.maxMileageKm > 0
      ? Math.min((shoe.currentMileageKm / shoe.maxMileageKm) * 100, 100)
      : 0
  const isWarning = shoe.maxMileageKm !== null && pct >= 80
  const isCritical = shoe.maxMileageKm !== null && pct >= 100

  return (
    <div className="animate-in space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="w-fit gap-1.5 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-card-foreground">
              {shoe.brand} {shoe.model}
            </h2>
            {isCritical && (
              <Badge variant="destructive">MAXED</Badge>
            )}
            {isWarning && !isCritical && (
              <Badge
                variant="secondary"
                className="bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-400 dark:border-amber-500/30"
              >
                WARNING
              </Badge>
            )}
            {!shoe.isActive && (
              <Badge variant="secondary">RETIRED</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {shoe.purchaseDate ? `Purchased ${formatDate(shoe.purchaseDate)}` : "No purchase date"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {shoe.isActive && (
            <Button
              variant="destructive"
              disabled={retireMutation.isPending}
              onClick={() => retireMutation.mutate()}
            >
              <Flag className="mr-1.5 h-4 w-4" />
              Retire
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Mileage Progress */}
      <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-card-foreground">Mileage</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Route className="h-3.5 w-3.5" />
              {shoe.totalRuns} runs
            </span>
          </div>
        </div>
        <div className="mb-3">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-3xl font-bold text-card-foreground">
              {shoe.currentMileageKm.toFixed(1)}
              <span className="text-lg font-normal text-muted-foreground"> km</span>
            </span>
            {shoe.maxMileageKm && (
              <span className="text-sm text-muted-foreground">
                of {shoe.maxMileageKm} km
              </span>
            )}
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full rounded-full transition-all ${
                isCritical
                  ? "bg-destructive"
                  : isWarning
                    ? "bg-amber-500"
                    : "bg-primary"
              }`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          {shoe.maxMileageKm && (
            <p className={`mt-1.5 text-xs ${isCritical ? "text-destructive" : isWarning ? "text-amber-500 dark:text-amber-400" : "text-muted-foreground"}`}>
              {isCritical
                ? "Exceeded recommended mileage — consider retiring these shoes"
                : isWarning
                  ? "Approaching maximum recommended mileage"
                  : `${Math.round(pct)}% of max mileage used`}
            </p>
          )}
        </div>
      </div>

      {/* Mileage History */}
      {shoe.mileageHistory.length > 0 ? (
        <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-lg">
          <h3 className="mb-4 font-semibold text-card-foreground">Mileage History</h3>
          <div className="space-y-2">
            {shoe.mileageHistory.map((entry) => {
              const maxEntry = Math.max(...shoe.mileageHistory.map((h) => h.distanceKm), 1)
              const barPct = (entry.distanceKm / maxEntry) * 100
              return (
                <div key={entry.month} className="flex items-center gap-3">
                  <span className="w-20 shrink-0 text-xs text-muted-foreground">
                    {monthLabel(entry.month)}
                  </span>
                  <div className="flex-1">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-12 text-right text-xs font-medium text-card-foreground">
                    {entry.distanceKm.toFixed(0)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Footprints}
          title="No mileage data yet"
          description="Log runs with this shoe to see mileage history"
        />
      )}

      <AlertDialog open={showDelete} onOpenChange={(o) => !o && setShowDelete(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Shoe</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete these shoes and unlink them from all runs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteMutation.mutate()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
