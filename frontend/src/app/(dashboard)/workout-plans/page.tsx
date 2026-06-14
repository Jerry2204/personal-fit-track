"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { Plus, CalendarCheck, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"
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

interface WorkoutPlan {
  id: string
  name: string
  startDate: string
  createdAt: string
  totalActivities: number
  completedActivities: number
  skippedActivities: number
  progress: number
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export default function WorkoutPlansPage() {
  const queryClient = useQueryClient()
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: plans, isLoading, isError, error } = useQuery<WorkoutPlan[]>({
    queryKey: ["workout-plans"],
    queryFn: () => api.get("/workout-plans"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/workout-plans/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workout-plans"] })
      setDeleteId(null)
      toast.success("Workout plan deleted")
    },
    onError: () => {
      toast.error("Failed to delete workout plan")
    },
  })

  const handleDelete = (id: string) => {
    setDeleteId(id)
  }

  return (
    <div className="animate-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workout Plans</h2>
          <p className="text-sm text-muted-foreground">
            Plan your weekly workout schedule
          </p>
        </div>
        <Link href="/workout-plans/new">
          <Button>
            <Plus className="mr-1.5 h-4 w-4" />
            New Plan
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl border border-border/40 bg-card p-5 shadow-lg text-card-foreground">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="mt-2 h-4 w-32" />
              <Skeleton className="mt-3 h-2 w-full" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <EmptyState
          icon={CalendarCheck}
          title="Failed to load plans"
          description={error instanceof Error ? error.message : "Could not connect to the server."}
        />
      )}

      {!isLoading && !isError && plans && plans.length === 0 && (
        <EmptyState
          icon={CalendarCheck}
          title="No workout plans yet"
          description="Create a weekly plan to organize your training schedule."
          action={{ label: "Create Your First Plan", onClick: () => window.location.href = "/workout-plans/new" }}
        />
      )}

      {!isLoading && !isError && plans && plans.length > 0 && (
        <div className="space-y-3">
          {plans.map((plan) => (
            <Link
              key={plan.id}
              href={`/workout-plans/${plan.id}`}
              className="group block rounded-2xl border border-border/40 bg-card p-5 shadow-lg text-card-foreground transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">
                      {plan.name}
                    </h3>
                    <Badge variant="secondary" className="text-[10px]">
                      {formatDate(plan.startDate)}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {plan.totalActivities} activities · {plan.completedActivities} completed · {plan.skippedActivities} skipped
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${plan.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {plan.progress}%
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    handleDelete(plan.id)
                  }}
                  className="ml-3 flex size-8 shrink-0 items-center justify-center rounded-lg text-destructive opacity-0 transition-opacity hover:bg-destructive/20 group-hover:opacity-100"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete workout plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workout plan? This cannot be undone.
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
