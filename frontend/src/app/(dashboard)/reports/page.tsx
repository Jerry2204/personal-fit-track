"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  BarChart3,
  Dumbbell,
  Footprints,
  Timer,
  Gauge,
  Target,
  CalendarDays,
  Weight,
  TrendingDown,
  TrendingUp,
  Trophy,
  Zap,
  Download,
  Printer,
  Medal,
} from "lucide-react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { api } from "@/lib/api"
import { downloadCsv } from "@/lib/export-utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"

/* ---------- shared types ---------- */

interface MonthlyReport {
  period: { year: number; month: number; label: string }
  summary: {
    totalWorkouts: number; totalVolume: number; totalRunningDistance: number
    totalRunningDuration: number; averagePace: number | null
    goalCompletionRate: number; goalsCompleted: number; goalsCreated: number
    habitConsistency: number; consistencyScore: number
    weightChange: number | null; startWeight: number | null; currentWeight: number | null
    mostTrainedMuscle: string | null; mostFrequentRunType: string | null
    totalDaysInMonth: number; trackedDays: number; completedDays: number
  }
  personalRecords: { type: string; label: string; value: string; date: string | null }[]
  dailyBreakdown: { date: string; workouts: number; running: boolean; weight: number | null }[]
}

interface YearlyReport {
  period: { year: number; label: string }
  summary: {
    totalWorkouts: number; totalVolume: number
    totalRunningDistance: number; totalRunningDuration: number
    averagePace: number | null; goalCompletionRate: number
    goalsCompleted: number; totalGoals: number
    yearlyConsistency: number; weightChange: number | null
    startWeight: number | null; currentWeight: number | null
    trackedDays: number; completedDays: number
  }
  mostConsistentMonth: { month: string; rate: number } | null
  monthlyBreakdown: { month: string; workouts: number; volume: number; runningDistance: number; runningDuration: number }[]
  monthlyConsistency: { month: string; rate: number }[]
  achievements: { label: string; value: string; date?: string }[]
  personalRecords: { type: string; label: string; value: string; date: string | null }[]
}

/* ---------- constants ---------- */

const months = Array.from({ length: 12 }, (_, i) => i + 1)
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

const formatPace = (pace: number | null) => {
  if (!pace) return "—"
  const min = Math.floor(pace)
  const sec = Math.round((pace - min) * 60)
  return `${min}:${String(sec).padStart(2, "0")} /km`
}

const runTypeLabels: Record<string, string> = {
  EasyRun: "Easy Run", RecoveryRun: "Recovery Run", TempoRun: "Tempo Run",
  IntervalRun: "Interval Run", LongRun: "Long Run", Race: "Race",
}

/* ---------- shared components ---------- */

function SummaryCard({ icon: Icon, label, value, sub, highlight }: {
  icon: React.ElementType; label: string; value: string
  sub?: string | null; highlight?: "good" | "bad" | "neutral"
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold tracking-tight text-card-foreground">{value}</p>
      {sub && (
        <p className={`mt-0.5 text-xs ${highlight === "good" ? "text-primary" : highlight === "bad" ? "text-destructive" : "text-muted-foreground"}`}>
          {sub}
        </p>
      )}
    </div>
  )
}

function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-64 rounded-lg" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  )
}

/* ---------- monthly view ---------- */

function MonthlyView({ year, month }: { year: number; month: number }) {
  const { data, isLoading, isError, error } = useQuery<MonthlyReport>({
    queryKey: ["monthly-report", year, month],
    queryFn: () => api.get(`/reports/monthly?year=${year}&month=${month}`),
  })

  if (isLoading) return <ReportSkeleton />
  if (isError) return <EmptyState icon={BarChart3} title="Failed to load report" description={error instanceof Error ? error.message : "An error occurred"} />
  if (!data) return null

  const s = data.summary

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <SummaryCard icon={Dumbbell} label="Workouts" value={String(s.totalWorkouts)} sub={`${s.totalWorkouts} sessions`} />
        <SummaryCard icon={Zap} label="Volume" value={s.totalVolume > 0 ? `${(s.totalVolume / 1000).toFixed(1)}k` : "0"} sub={s.totalVolume > 0 ? `${s.totalVolume.toLocaleString()} kg` : null} />
        <SummaryCard icon={Footprints} label="Running Distance" value={`${s.totalRunningDistance.toFixed(1)}`} sub={`${s.totalRunningDistance.toFixed(1)} km`} />
        <SummaryCard icon={Timer} label="Run Duration" value={`${Math.floor(s.totalRunningDuration / 60)}h`} sub={`${s.totalRunningDuration} min`} />
        <SummaryCard icon={Gauge} label="Avg Pace" value={s.averagePace ? formatPace(s.averagePace) : "—"} sub={s.averagePace ? "/km" : null} />
        <SummaryCard icon={Target} label="Goals" value={`${s.goalCompletionRate}%`} sub={s.goalCompletionRate >= 50 ? `${s.goalsCompleted} completed` : `${s.goalsCreated} created`} highlight={s.goalCompletionRate >= 50 ? "good" : "neutral"} />
        <SummaryCard icon={CalendarDays} label="Consistency" value={`${s.consistencyScore}%`} sub={s.habitConsistency > 0 ? `${s.completedDays}/${s.totalDaysInMonth} days` : "No habit data"} highlight={s.consistencyScore >= 50 ? "good" : "neutral"} />
        <SummaryCard icon={Weight} label="Weight" value={s.currentWeight !== null ? `${s.currentWeight}` : "—"} sub={s.weightChange !== null ? `${s.weightChange >= 0 ? "+" : ""}${s.weightChange.toFixed(1)} kg` : null} highlight={s.weightChange !== null ? (s.weightChange <= 0 ? "good" : "bad") : "neutral"} />
      </div>

      <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-lg">
        <h3 className="mb-4 text-sm font-semibold text-card-foreground">Highlights</h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {s.mostTrainedMuscle && (
            <div className="rounded-xl border border-border/40 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground mb-1">Most Trained Muscle</p>
              <p className="text-lg font-bold text-card-foreground">{s.mostTrainedMuscle}</p>
            </div>
          )}
          {s.mostFrequentRunType && (
            <div className="rounded-xl border border-border/40 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground mb-1">Most Frequent Run Type</p>
              <p className="text-lg font-bold text-card-foreground">{runTypeLabels[s.mostFrequentRunType] || s.mostFrequentRunType}</p>
            </div>
          )}
          {s.consistencyScore > 0 && (
            <div className="rounded-xl border border-border/40 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground mb-1">Consistency Score</p>
              <p className="text-lg font-bold text-card-foreground">{s.consistencyScore}%<span className="text-sm font-normal text-muted-foreground ml-1">({s.trackedDays}/{s.totalDaysInMonth} days tracked)</span></p>
            </div>
          )}
          {s.startWeight !== null && s.currentWeight !== null && (
            <div className="rounded-xl border border-border/40 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground mb-1">Weight Change</p>
              <p className="text-lg font-bold text-card-foreground flex items-center gap-1">
                {s.weightChange !== null && s.weightChange <= 0 ? <TrendingDown className="h-4 w-4 text-primary" /> : <TrendingUp className="h-4 w-4 text-destructive" />}
                {s.weightChange !== null ? `${s.weightChange >= 0 ? "+" : ""}${s.weightChange.toFixed(1)} kg` : "—"}
              </p>
              <p className="text-xs text-muted-foreground">{s.startWeight} → {s.currentWeight} kg</p>
            </div>
          )}
          {data.personalRecords.length > 0 && data.personalRecords.map((pr, i) => (
            <div key={i} className="rounded-xl border border-border/40 bg-muted/30 p-4">
              <p className="text-xs text-muted-foreground mb-1">Personal Record</p>
              <p className="text-lg font-bold text-card-foreground flex items-center gap-1"><Trophy className="h-4 w-4 text-amber-500" />{pr.value}</p>
              <p className="text-xs text-muted-foreground">{pr.label}{pr.date ? ` · ${new Date(pr.date).toLocaleDateString()}` : ""}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-lg">
        <h3 className="mb-4 text-sm font-semibold text-card-foreground">Daily Activity</h3>
        {data.dailyBreakdown.length > 0 ? (
          <>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => {
                const day = i + 1
                const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                const entry = data.dailyBreakdown.find((d) => d.date === dateStr)
                const hw = entry && entry.workouts > 0
                const hr = entry && entry.running
                return (
                  <div key={day} className={`flex flex-col items-center gap-0.5 rounded-lg p-1.5 transition-colors ${hw && hr ? "bg-primary" : hw ? "bg-primary/70" : hr ? "bg-primary/40" : "bg-muted/50"}`}
                    title={hw || hr ? `Day ${day}: ${hw ? "Workout" : ""}${hw && hr ? " + " : ""}${hr ? "Run" : ""}` : `Day ${day}: Rest`}>
                    <span className={`text-[10px] font-medium ${hw || hr ? "text-primary-foreground" : "text-muted-foreground"}`}>{day}</span>
                    {(hw || hr) && <div className="flex gap-0.5">{hw && <div className="h-1 w-1 rounded-full bg-white/80" />}{hr && <div className="h-1 w-1 rounded-full bg-white/80" />}</div>}
                  </div>
                )
              })}
            </div>
            <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-primary" /> Workout + Run</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-primary/70" /> Workout</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-primary/40" /> Run</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded bg-muted/50" /> Rest</span>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No activity recorded this month</p>
        )}
      </div>
    </div>
  )
}

/* ---------- yearly view ---------- */

function YearlyView({ year }: { year: number }) {
  const { data, isLoading, isError, error } = useQuery<YearlyReport>({
    queryKey: ["yearly-report", year],
    queryFn: () => api.get(`/reports/yearly?year=${year}`),
  })

  if (isLoading) return <ReportSkeleton />
  if (isError) return <EmptyState icon={BarChart3} title="Failed to load report" description={error instanceof Error ? error.message : "An error occurred"} />
  if (!data) return null

  const s = data.summary
  const tooltipStyle = { backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "13px" }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard icon={Dumbbell} label="Total Workouts" value={String(s.totalWorkouts)} sub={`${s.totalWorkouts} sessions`} />
        <SummaryCard icon={Zap} label="Volume" value={s.totalVolume > 0 ? `${(s.totalVolume / 1000).toFixed(1)}k` : "0"} sub={s.totalVolume > 0 ? `${(s.totalVolume / 1000).toFixed(1)}k kg` : null} />
        <SummaryCard icon={Footprints} label="Running Distance" value={`${s.totalRunningDistance.toFixed(0)}`} sub={`${s.totalRunningDistance.toFixed(1)} km`} />
        <SummaryCard icon={Timer} label="Run Duration" value={`${Math.floor(s.totalRunningDuration / 60)}h`} sub={`${s.totalRunningDuration} min`} />
        <SummaryCard icon={Gauge} label="Avg Pace" value={s.averagePace ? formatPace(s.averagePace) : "—"} sub={s.averagePace ? "/km" : null} />
        <SummaryCard icon={Target} label="Goal Completion" value={`${s.goalCompletionRate}%`} sub={`${s.goalsCompleted}/${s.totalGoals} completed`} highlight={s.goalCompletionRate >= 50 ? "good" : "neutral"} />
        <SummaryCard icon={CalendarDays} label="Consistency" value={`${s.yearlyConsistency}%`} sub={`${s.completedDays}/${s.trackedDays} active days`} highlight={s.yearlyConsistency >= 50 ? "good" : "neutral"} />
        <SummaryCard icon={Weight} label="Weight" value={s.currentWeight !== null ? `${s.currentWeight}` : "—"} sub={s.weightChange !== null ? `${s.weightChange >= 0 ? "+" : ""}${s.weightChange.toFixed(1)} kg` : null} highlight={s.weightChange !== null ? (s.weightChange <= 0 ? "good" : "bad") : "neutral"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Monthly Workout Volume Chart */}
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-lg">
          <h3 className="mb-3 text-sm font-semibold text-card-foreground">Monthly Workout Volume</h3>
          {data.monthlyBreakdown.some((m) => m.volume > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.monthlyBreakdown} margin={{ top: 5, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${(v as number).toLocaleString()} kg`, "Volume"]} />
                <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-10 text-center">No workout data this year</p>
          )}
        </div>

        {/* Monthly Running Distance Chart */}
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-lg">
          <h3 className="mb-3 text-sm font-semibold text-card-foreground">Monthly Running Distance</h3>
          {data.monthlyBreakdown.some((m) => m.runningDistance > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.monthlyBreakdown} margin={{ top: 5, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${(v as number).toFixed(1)} km`, "Distance"]} />
                <Bar dataKey="runningDistance" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-10 text-center">No running data this year</p>
          )}
        </div>

        {/* Monthly Consistency Chart */}
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-lg">
          <h3 className="mb-3 text-sm font-semibold text-card-foreground">Monthly Consistency</h3>
          {data.monthlyConsistency.some((m) => m.rate > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.monthlyConsistency} margin={{ top: 5, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Consistency"]} />
                <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-10 text-center">No habit data this year</p>
          )}
        </div>

        {/* Achievements */}
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-lg">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground flex items-center gap-1">
            <Medal className="h-4 w-4 text-amber-500" /> Best Achievements
          </h3>
          {data.achievements.length > 0 ? (
            <div className="space-y-3">
              {data.achievements.map((a, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-border/40 bg-muted/30 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10">
                    <Trophy className="h-4 w-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{a.label}</p>
                    <p className="text-xs text-muted-foreground">{a.value}{a.date ? ` · ${new Date(a.date).toLocaleDateString()}` : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">No achievements this year</p>
          )}
        </div>
      </div>

      {/* Personal Records */}
      {data.personalRecords.length > 0 && (
        <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-lg">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">All-Time Personal Records</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.personalRecords.map((pr, i) => (
              <div key={i} className="rounded-xl border border-border/40 bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground mb-1">Personal Record</p>
                <p className="text-lg font-bold text-card-foreground flex items-center gap-1"><Trophy className="h-4 w-4 text-amber-500" />{pr.value}</p>
                <p className="text-xs text-muted-foreground">{pr.label}{pr.date ? ` · ${new Date(pr.date).toLocaleDateString()}` : ""}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Most Consistent Month */}
      {data.mostConsistentMonth && (
        <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-lg">
          <h3 className="mb-4 text-sm font-semibold text-card-foreground">Most Consistent Month</h3>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Medal className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-card-foreground">{data.mostConsistentMonth.month}</p>
              <p className="text-sm text-muted-foreground">{data.mostConsistentMonth.rate}% consistency rate</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- page ---------- */

export default function ReportsPage() {
  const now = new Date()
  const [tab, setTab] = useState<"monthly" | "yearly">("monthly")
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

  const handlePrint = () => window.print()

  return (
    <div className="animate-in space-y-6 print:space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
          <p className="text-sm text-muted-foreground">Monthly and yearly fitness summaries</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex items-center rounded-xl border border-border/40 bg-card p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setTab("monthly")}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-200 ${tab === "monthly" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-card-foreground"}`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setTab("yearly")}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-200 ${tab === "yearly" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-card-foreground"}`}
            >
              Yearly
            </button>
          </div>
          {/* Period selector */}
          {tab === "monthly" ? (
            <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-card p-1">
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="bg-transparent px-2 py-1 text-sm font-medium text-card-foreground outline-none">
                {months.map((m) => (<option key={m} value={m}>{new Date(2000, m - 1).toLocaleDateString("en-US", { month: "long" })}</option>))}
              </select>
              <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="bg-transparent px-2 py-1 text-sm font-medium text-card-foreground outline-none">
                {years.map((y) => (<option key={y} value={y}>{y}</option>))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-card p-1">
              <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="bg-transparent px-2 py-1 text-sm font-medium text-card-foreground outline-none">
                {years.map((y) => (<option key={y} value={y}>{y}</option>))}
              </select>
            </div>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const path = tab === "monthly"
                ? `/export/reports/monthly/csv?year=${year}&month=${month}`
                : `/export/reports/yearly/csv?year=${year}`
              const filename = tab === "monthly"
                ? `monthly-report-${year}-${String(month).padStart(2, "0")}.csv`
                : `yearly-report-${year}.csv`
              downloadCsv(path, filename)
            }}
            title="Export CSV"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handlePrint} title="Print / PDF">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block">
        <h1 className="text-2xl font-bold">{tab === "monthly" ? "Monthly Report" : "Yearly Report"}</h1>
      </div>

      {tab === "monthly" ? <MonthlyView year={year} month={month} /> : <YearlyView year={year} />}
    </div>
  )
}
