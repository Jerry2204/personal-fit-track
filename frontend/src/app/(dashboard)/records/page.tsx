"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Trophy,
  Dumbbell,
  Footprints,
  Zap,
  CalendarDays,
  Timer,
  Gauge,
  Weight,
} from "lucide-react"
import { api } from "@/lib/api"
import { EmptyState } from "@/components/ui/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface BaseRecord {
  type: string
  value: string
  metric: number
  displayValue: string
  unit: string
  date?: string
}

interface StrongestLift extends BaseRecord {
  type: "strongest_lift"
  exerciseName: string
  muscleGroup: string
}

interface LongestRun extends BaseRecord {
  type: "longest_run"
  durationMinutes: number
  runType: string
}

interface FastestRun extends BaseRecord {
  type: "fastest_run"
  distanceKm: number
  runType: string
}

interface HighestVolume extends BaseRecord {
  type: "highest_volume"
  workoutType: string
}

interface HighestWeeklyMileage extends BaseRecord {
  type: "highest_weekly_mileage"
  weekOf: string
  runCount: number
}

type PersonalRecord = StrongestLift | LongestRun | FastestRun | HighestVolume | HighestWeeklyMileage

interface RecordsData {
  strongestLift: StrongestLift | null
  longestRun: LongestRun | null
  fastestRun: FastestRun | null
  highestVolume: HighestVolume | null
  highestWeeklyMileage: HighestWeeklyMileage | null
}

const tabs = [
  { id: "all", label: "All" },
  { id: "lifting", label: "Lifting" },
  { id: "running", label: "Running" },
  { id: "volume", label: "Volume" },
  { id: "mileage", label: "Mileage" },
] as const

type TabId = (typeof tabs)[number]["id"]

const categoryConfig: Record<string, { label: string; icon: React.ElementType; gradient: string; accent: string }> = {
  strongest_lift: {
    label: "Strongest Lift",
    icon: Dumbbell,
    gradient: "from-blue-600/20 via-blue-500/10 to-transparent",
    accent: "text-blue-400",
  },
  longest_run: {
    label: "Longest Run",
    icon: Footprints,
    gradient: "from-emerald-600/20 via-emerald-500/10 to-transparent",
    accent: "text-emerald-400",
  },
  fastest_run: {
    label: "Fastest Run",
    icon: Gauge,
    gradient: "from-cyan-600/20 via-cyan-500/10 to-transparent",
    accent: "text-cyan-400",
  },
  highest_volume: {
    label: "Highest Volume",
    icon: Weight,
    gradient: "from-purple-600/20 via-purple-500/10 to-transparent",
    accent: "text-purple-400",
  },
  highest_weekly_mileage: {
    label: "Highest Weekly Mileage",
    icon: CalendarDays,
    gradient: "from-amber-600/20 via-amber-500/10 to-transparent",
    accent: "text-amber-400",
  },
}

function getRecordCategory(record: PersonalRecord): string {
  if (record.type === "strongest_lift") return "lifting"
  if (record.type === "longest_run" || record.type === "fastest_run") return "running"
  if (record.type === "highest_volume") return "volume"
  if (record.type === "highest_weekly_mileage") return "mileage"
  return ""
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function RecordCard({ record, index }: { record: PersonalRecord; index: number }) {
  const config = categoryConfig[record.type]
  if (!config) return null

  const Icon = config.icon

  let subtitle = ""
  if (record.type === "strongest_lift") {
    subtitle = `${record.exerciseName} · ${record.muscleGroup}`
  } else if (record.type === "longest_run") {
    const hrs = Math.floor(record.durationMinutes / 60)
    const mins = record.durationMinutes % 60
    subtitle = `${hrs}h ${mins}m · ${record.runType.replace(/([A-Z])/g, " $1").trim()}`
  } else if (record.type === "fastest_run") {
    subtitle = `${record.distanceKm.toFixed(1)}km · ${record.runType.replace(/([A-Z])/g, " $1").trim()}`
  } else if (record.type === "highest_volume") {
    subtitle = record.workoutType
  } else if (record.type === "highest_weekly_mileage") {
    subtitle = `${record.runCount} run${record.runCount === 1 ? "" : "s"}`
  }

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-50`} />
      <div className="relative z-10 p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{config.label}</p>
              {record.date && (
                <p className="text-xs text-muted-foreground/60">{formatDate(record.date)}</p>
              )}
            </div>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10">
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
        </div>

        <div className="mb-3">
          <span className="text-3xl font-bold tracking-tight text-card-foreground">
            {record.displayValue}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{subtitle}</p>
          <Badge
            variant="secondary"
            className={`${config.accent} bg-transparent border border-current/20`}
          >
            #{index + 1}
          </Badge>
        </div>
      </div>
    </div>
  )
}

function RecordsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/40 bg-card p-6 shadow-lg">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div>
                <Skeleton className="mb-1 h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="mb-3 h-8 w-28" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

function tabRecords(data: RecordsData, tab: TabId): PersonalRecord[] {
  const all: PersonalRecord[] = []
  if (data.strongestLift) all.push(data.strongestLift)
  if (data.longestRun) all.push(data.longestRun)
  if (data.fastestRun) all.push(data.fastestRun)
  if (data.highestVolume) all.push(data.highestVolume)
  if (data.highestWeeklyMileage) all.push(data.highestWeeklyMileage)

  if (tab === "all") return all
  return all.filter((r) => getRecordCategory(r) === tab)
}

const tabIcons: Record<TabId, React.ElementType> = {
  all: Trophy,
  lifting: Dumbbell,
  running: Footprints,
  volume: Zap,
  mileage: CalendarDays,
}

export default function RecordsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("all")

  const { data, isLoading, isError, error } = useQuery<RecordsData>({
    queryKey: ["personal-records"],
    queryFn: () => api.get("/personal-records"),
  })

  const records = data ? tabRecords(data, activeTab) : []

  let content: React.ReactNode

  if (isLoading) {
    content = <RecordsSkeleton />
  } else if (isError) {
    content = (
      <EmptyState
        icon={Trophy}
        title="Failed to load records"
        description={error instanceof Error ? error.message : "An error occurred"}
      />
    )
  } else if (!data || Object.values(data).every((v) => v === null)) {
    content = (
      <EmptyState
        icon={Trophy}
        title="No personal records yet"
        description="Start working out and logging runs to earn your first records"
      />
    )
  } else if (records.length === 0) {
    content = (
      <EmptyState
        icon={Trophy}
        title={`No ${tabs.find((t) => t.id === activeTab)?.label.toLowerCase()} records found`}
        description="Try a different category or add more activity data"
      />
    )
  } else {
    content = (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {records.map((record, i) => (
          <RecordCard key={record.type} record={record} index={i} />
        ))}
      </div>
    )
  }

  return (
    <div className="animate-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Personal Records</h2>
        <p className="text-sm text-muted-foreground">Your all-time best achievements</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => {
          const TabIcon = tabIcons[tab.id]
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground hover:text-card-foreground border border-border/40"
              }`}
            >
              <TabIcon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {content}
    </div>
  )
}
