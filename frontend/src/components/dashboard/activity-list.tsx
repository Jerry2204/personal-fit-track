"use client"

import { Dumbbell, Footprints, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface WorkoutItem {
  id: string
  date: string
  type: string
  duration: number
  exercises?: number
  volume?: number
  distance?: number
}

interface RunItem {
  id: string
  date: string
  distance: number
  duration: number
  pace: string
  type: string
}

interface ActivityListProps {
  title: string
  icon: ReactNode
  items: WorkoutItem[] | RunItem[]
  type: "workout" | "run"
  viewAllHref?: string
}

export function ActivityList({
  title,
  icon,
  items,
  type,
  viewAllHref,
}: ActivityListProps) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card text-card-foreground shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden group">
      <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{icon}</span>
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {viewAllHref && (
          <button className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            View all <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="divide-y divide-border/40">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30"
          >
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg",
                type === "workout"
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary text-secondary-foreground",
              )}
            >
              {type === "workout" ? (
                <Dumbbell className="h-4 w-4" />
              ) : (
                <Footprints className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{item.type}</p>
              <p className="text-xs text-muted-foreground">{item.date}</p>
            </div>
            <div className="text-right">
              {"pace" in item ? (
                <>
                  <p className="text-sm font-medium">{item.distance} km</p>
                  <p className="text-xs text-muted-foreground">
                    {item.pace} /km
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium">{item.duration}m</p>
                  <p className="text-xs text-muted-foreground">
                    {"exercises" in item && item.exercises
                      ? `${item.exercises} exercises`
                      : ""}
                  </p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
