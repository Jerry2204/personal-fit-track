"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Flame } from "lucide-react"
import type { TodaySummary, OverallStats } from "./dashboard-types"

interface Props {
  todaySummary: TodaySummary
  overallStats: OverallStats
  profileName: string | null
  userEmail: string
  avatarUrl?: string | null
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function WelcomeSection({ todaySummary, overallStats, profileName, userEmail, avatarUrl }: Props) {
  const greeting = getGreeting()
  const date = formatDate()
  const name = profileName || userEmail.split("@")[0] || "Athlete"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-11 w-11 border-2 border-border/40 shadow-md">
            <AvatarImage src={avatarUrl || undefined} alt={name} />
            <AvatarFallback className="bg-card text-sm font-bold tracking-tight text-primary-foreground">
              {name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {greeting}, {name}
            </h1>
            <p className="text-sm text-Secondary">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-border/40 bg-card px-5 py-3 shadow-lg">
            <Flame className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-extrabold text-foreground">{todaySummary.streakDays} day streak</p>
              <p className="text-[10px] font-medium text-muted-foreground leading-tight">Keep it going!</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border/40 bg-card text-card-foreground p-5 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Workouts</p>
          <p className="mt-1 text-2xl font-extrabold text-foreground">{overallStats.totalWorkouts}</p>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card text-card-foreground p-5 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Distance</p>
          <p className="mt-1 text-2xl font-extrabold text-foreground">
            {overallStats.totalDistance} <span className="text-sm font-medium text-muted-foreground">km</span>
          </p>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card text-card-foreground p-5 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Time</p>
          <p className="mt-1 text-2xl font-extrabold text-foreground">
            {Math.floor(overallStats.totalDuration / 60)}<span className="text-sm font-medium text-muted-foreground mr-1">h</span>
            {overallStats.totalDuration % 60}<span className="text-sm font-medium text-muted-foreground">m</span>
          </p>
        </div>
        <div className="rounded-2xl border border-border/40 bg-card text-card-foreground p-5 shadow-lg transition-all hover:shadow-xl hover:-translate-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Streak</p>
          <p className="mt-1 text-2xl font-extrabold text-foreground">
            {overallStats.currentStreak} <span className="text-sm font-medium text-muted-foreground">days</span>
          </p>
        </div>
      </div>
    </div>
  )
}
