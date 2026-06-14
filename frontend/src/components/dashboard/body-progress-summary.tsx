"use client"

import { Progress } from "@/components/ui/progress"
import { TrendingDown } from "lucide-react"
import type { BodyProgress } from "./dashboard-types"

interface Props {
  bodyProgress: BodyProgress | null
}

export function BodyProgressSummary({ bodyProgress }: Props) {
  if (!bodyProgress || bodyProgress.currentWeight === null) return null

  const startWeight = bodyProgress.startWeight ?? bodyProgress.currentWeight
  const targetWeight = bodyProgress.targetWeight
  const weightChange = bodyProgress.currentWeight - startWeight

  const weightLossPercent =
    targetWeight !== null && startWeight !== targetWeight
      ? Math.min(
          ((startWeight - bodyProgress.currentWeight) /
            (startWeight - targetWeight)) *
            100,
          100,
        )
      : 0

  const remainingKg =
    targetWeight !== null ? bodyProgress.currentWeight - targetWeight : 0

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
            {bodyProgress.lastMeasurement
              ? `Last measured ${bodyProgress.lastMeasurement}`
              : "No recent measurements"}
          </p>
        </div>
        <div className="rounded-full bg-primary/10 p-3">
          <TrendingDown className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Started at</span>
          <span className="font-medium">{startWeight} kg</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {weightChange < 0 ? "Lost" : "Gained"}
          </span>
          <span
            className={`font-medium ${
              weightChange <= 0 ? "text-primary" : "text-destructive"
            }`}
          >
            {weightChange >= 0 ? "+" : ""}
            {Math.abs(weightChange).toFixed(1)} kg
          </span>
        </div>
        {bodyProgress.bodyFat !== null && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Body fat</span>
            <span className="font-medium">{bodyProgress.bodyFat}%</span>
          </div>
        )}

        {targetWeight !== null && (
          <div className="pt-1">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Goal progress</span>
              <span className="font-medium">
                {remainingKg > 0
                  ? `${remainingKg.toFixed(1)} kg to go`
                  : "Goal reached!"}
              </span>
            </div>
            <Progress value={Math.max(weightLossPercent, 0)} className="h-2" />
          </div>
        )}
      </div>
    </div>
  )
}
