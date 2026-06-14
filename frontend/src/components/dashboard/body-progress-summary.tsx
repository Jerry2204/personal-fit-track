"use client"

import { bodyProgress } from "./mock-data"
import { Progress } from "@/components/ui/progress"
import { TrendingDown } from "lucide-react"

export function BodyProgressSummary() {
  const weightLossPercent = Math.min(
    ((bodyProgress.startWeight - bodyProgress.currentWeight) /
      (bodyProgress.startWeight - bodyProgress.targetWeight)) *
      100,
    100,
  )
  const remainingKg = bodyProgress.currentWeight - bodyProgress.targetWeight

  return (
    <div className="rounded-2xl border border-border/40 bg-card text-card-foreground p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
      <h3 className="mb-4 text-sm font-semibold">Body Progress</h3>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold tracking-tight">
            {bodyProgress.currentWeight}
            <span className="text-lg font-normal text-muted-foreground">
              {" "}
              kg
            </span>
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Last measured {bodyProgress.lastMeasurement}
          </p>
        </div>
        <div className="rounded-full bg-primary/10 p-3">
          <TrendingDown className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Started at</span>
          <span className="font-medium">{bodyProgress.startWeight} kg</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Lost</span>
          <span className="font-medium text-primary">
            -{Math.abs(bodyProgress.weightChange)} kg
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Body fat</span>
          <span className="font-medium">{bodyProgress.bodyFat}%</span>
        </div>

        <div className="pt-1">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Goal progress</span>
            <span className="font-medium">
              {remainingKg > 0
                ? `${remainingKg.toFixed(1)} kg to go`
                : "Goal reached!"}
            </span>
          </div>
          <Progress value={weightLossPercent} className="h-2" />
        </div>
      </div>
    </div>
  )
}
