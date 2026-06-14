"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { Plus, Trash2, Footprints, Flag, Calendar, Gauge } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
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

interface Shoe {
  id: string
  brand: string
  model: string
  purchaseDate: string | null
  maxMileageKm: number | null
  currentMileageKm: number
  isActive: boolean
}

const defaultForm = {
  brand: "",
  model: "",
  purchaseDate: "",
  maxMileageKm: "",
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function MileageBar({ current, max }: { current: number; max: number | null }) {
  const pct = max && max > 0 ? Math.min((current / max) * 100, 100) : 0
  const isWarning = max !== null && pct >= 80
  const isCritical = max !== null && pct >= 100

  return (
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{current.toFixed(1)} km</span>
        {max && (
          <span className="text-muted-foreground">
            {pct >= 100 ? "Limit exceeded" : `${Math.round(pct)}%`}
          </span>
        )}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all ${
            isCritical
              ? "bg-destructive"
              : isWarning
                ? "bg-amber-500"
                : "bg-primary"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function ShoeSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/40 bg-card p-5 shadow-lg">
          <div className="mb-3 flex items-start justify-between">
            <div>
              <Skeleton className="mb-1 h-5 w-36" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="mb-3 h-2 w-full rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ShoesPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(defaultForm)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showRetired, setShowRetired] = useState(false)

  const { data: shoes, isLoading, isError, error } = useQuery<Shoe[]>({
    queryKey: ["shoes"],
    queryFn: () => api.get("/shoes"),
  })

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post("/shoes", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shoes"] })
      setDialogOpen(false)
      setForm(defaultForm)
      toast.success("Shoe added")
    },
    onError: () => {
      toast.error("Failed to add shoe")
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/shoes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shoes"] })
      setDeleteId(null)
      toast.success("Shoe removed")
    },
    onError: () => {
      toast.error("Failed to remove shoe")
    },
  })

  const retireMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/shoes/${id}/retire`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shoes"] })
      toast.success("Shoe retired")
    },
    onError: () => {
      toast.error("Failed to retire shoe")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.brand || !form.model) return

    const body: Record<string, unknown> = {
      brand: form.brand,
      model: form.model,
      purchaseDate: form.purchaseDate || undefined,
      maxMileageKm: form.maxMileageKm ? Number(form.maxMileageKm) : undefined,
    }

    createMutation.mutate(body)
  }

  const filtered = shoes?.filter((s) => (showRetired ? true : s.isActive)) ?? []

  let content: React.ReactNode

  if (isLoading) {
    content = <ShoeSkeleton />
  } else if (isError) {
    content = (
      <EmptyState
        icon={Footprints}
        title="Failed to load shoes"
        description={error instanceof Error ? error.message : "An error occurred"}
      />
    )
  } else if (filtered.length === 0) {
    content = (
      <EmptyState
        icon={Footprints}
        title={showRetired ? "No shoes found" : "No active shoes"}
        description={showRetired ? "No shoes match your criteria" : "Add your first pair of running shoes"}
      />
    )
  } else {
    content = (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((shoe) => {
          const hasWarning =
            shoe.maxMileageKm !== null && shoe.currentMileageKm >= shoe.maxMileageKm * 0.8
          const isCritical =
            shoe.maxMileageKm !== null && shoe.currentMileageKm >= shoe.maxMileageKm

          return (
            <Link
              key={shoe.id}
              href={`/shoes/${shoe.id}`}
              className="group block rounded-2xl border border-border/40 bg-card p-5 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                    {shoe.brand} {shoe.model}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {shoe.purchaseDate ? formatDate(shoe.purchaseDate) : "No purchase date"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isCritical && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                      MAXED
                    </Badge>
                  )}
                  {hasWarning && !isCritical && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600 border-amber-500/20"
                    >
                      WARNING
                    </Badge>
                  )}
                  {!shoe.isActive && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      RETIRED
                    </Badge>
                  )}
                </div>
              </div>

              <MileageBar current={shoe.currentMileageKm} max={shoe.maxMileageKm} />

              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{shoe.currentMileageKm.toFixed(1)} km total</span>
                {shoe.maxMileageKm && (
                  <span>max {shoe.maxMileageKm} km</span>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <div className="animate-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight">Shoes</h2>
          <p className="text-sm text-muted-foreground">Track your running shoe mileage</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Shoe
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowRetired(false)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
            !showRetired
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card text-muted-foreground hover:text-card-foreground border border-border/40"
          }`}
        >
          Active
        </button>
        <button
          type="button"
          onClick={() => setShowRetired(true)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
            showRetired
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card text-muted-foreground hover:text-card-foreground border border-border/40"
          }`}
        >
          All Shoes
        </button>
      </div>

      {content}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Shoe</DialogTitle>
            <DialogDescription>Log a new pair of running shoes</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Brand</label>
                <Input
                  placeholder="Nike"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Model</label>
                <Input
                  placeholder="Pegasus 40"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Purchase Date</label>
                <Input
                  type="date"
                  value={form.purchaseDate}
                  onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Mileage (km)</label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="600"
                  value={form.maxMileageKm}
                  onChange={(e) => setForm({ ...form, maxMileageKm: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="destructive" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Shoe</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this shoe and unlink it from all runs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
