"use client"

import { goals } from "./mock-data"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const typeColors = {
  Distance:
    "bg-primary/20 text-primary",
  Strength:
    "bg-secondary text-secondary-foreground border border-border/50",
  Sessions:
    "bg-muted text-muted-foreground border border-border/50",
}

const typeLabels = {
  Distance: "Distance",
  Strength: "Strength",
  Sessions: "Sessions",
}

export function GoalCard() {
  return (
    <div className="rounded-2xl border border-border/40 bg-card text-foreground shadow-lg transition-all hover:shadow-xl overflow-hidden">
      <div className="border-b border-border/40 px-5 py-4">
        <h3 className="text-sm font-semibold">Active Goals</h3>
      </div>
      <div className="divide-y">
        {goals.map((goal) => {
          const percent = Math.min((goal.current / goal.target) * 100, 100)
          return (
            <div key={goal.id} className="px-5 py-4">
              <div className="mb-2 flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-tight text-foreground">
                    {goal.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                        typeColors[goal.type],
                      )}
                    >
                      {typeLabels[goal.type]}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Due {goal.deadline}
                    </span>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-bold text-foreground">
                  {goal.current}/{goal.target}
                  <span className="text-xs text-muted-foreground">
                    {" "}
                    {goal.unit}
                  </span>
                </span>
              </div>
              <Progress value={percent} className="h-1.5" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
