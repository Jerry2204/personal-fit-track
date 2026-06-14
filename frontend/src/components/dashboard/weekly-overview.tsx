"use client"

import { weeklyProgress, weeklyTargets } from "./mock-data"
import { Progress } from "@/components/ui/progress"
import { Dumbbell, Footprints } from "lucide-react"

export function WeeklyOverview() {
  const sessionsPercent = Math.min(
    (weeklyTargets.sessionsCompleted / weeklyTargets.sessionsTarget) * 100,
    100,
  )
  const kmPercent = Math.min(
    (weeklyTargets.kmCompleted / weeklyTargets.kmTarget) * 100,
    100,
  )

  return (
    <div className="rounded-2xl border border-border/40 bg-card text-card-foreground p-6 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
      <h3 className="mb-4 text-sm font-semibold">Weekly Progress</h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Gym Sessions</span>
            </div>
            <span className="font-medium">
              {weeklyTargets.sessionsCompleted}/{weeklyTargets.sessionsTarget}
            </span>
          </div>
          <Progress value={sessionsPercent} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Footprints className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Running</span>
            </div>
            <span className="font-medium">
              {weeklyTargets.kmCompleted}/{weeklyTargets.kmTarget} km
            </span>
          </div>
          <Progress value={kmPercent} className="h-2" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1.5">
        {weeklyProgress.map((day) => (
          <div key={day.day} className="text-center">
            <p className="mb-1 text-xs text-muted-foreground">{day.day}</p>
            <div className="flex flex-col items-center gap-0.5">
              <div
                className={`h-8 w-full rounded-sm transition-colors ${
                  day.sessions > 0
                    ? "bg-primary"
                    : day.km > 0
                      ? "bg-primary/60"
                      : "bg-muted"
                }`}
              />
              <span className="text-[10px] text-muted-foreground">
                {day.sessions > 0
                  ? `${day.sessions}`
                  : day.km > 0
                    ? `${day.km}`
                    : "-"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
