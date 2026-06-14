"use client"

import { personalRecords } from "./mock-data"
import { cn } from "@/lib/utils"
import { Trophy, Zap } from "lucide-react"

const typeColors = {
  Strength:
    "bg-secondary text-secondary-foreground border border-border/50",
  Running:
    "bg-primary/20 text-primary",
}

const categoryConfig = {
  strength: {
    icon: Zap,
    color: typeColors.Strength,
  },
  run: {
    icon: Trophy,
    color: typeColors.Running,
  },
}

export function PersonalRecordsSummary() {
  return (
    <div className="rounded-2xl border border-border/40 bg-card text-card-foreground shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden group">
      <div className="border-b border-border/40 px-6 py-4">
        <h3 className="text-sm font-semibold">Personal Records</h3>
      </div>
      <div className="divide-y divide-border/40">
        {personalRecords.map((pr) => {
          const cfg = categoryConfig[pr.category]
          const Icon = cfg.icon
          return (
            <div
              key={pr.exercise}
              className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30"
            >
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg",
                  cfg.color,
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{pr.exercise}</p>
                <p className="text-xs text-muted-foreground">{pr.date}</p>
              </div>
              <span className="shrink-0 text-sm font-bold">{pr.value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
