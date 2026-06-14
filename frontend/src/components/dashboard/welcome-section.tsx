"use client"

import { currentUser, todaySummary, overallStats } from "./mock-data"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Flame } from "lucide-react"

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

export function WelcomeSection() {
  const greeting = getGreeting()
  const date = formatDate()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10 border-2 border-primary/10">
            <AvatarFallback className="bg-primary/5 text-sm font-semibold text-primary">
              {currentUser.initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {greeting}, {currentUser.name.split(" ")[0]}
            </h1>
            <p className="text-sm text-muted-foreground">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant="success"
            className="gap-1.5 px-3 py-1 text-sm font-medium"
          >
            <Flame className="h-3.5 w-3.5" />
            {todaySummary.streakDays} day streak
          </Badge>
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
