"use client"

import { useState, useMemo, useEffect } from "react"
import { createPortal } from "react-dom"
import { useQuery } from "@tanstack/react-query"
import {
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Footprints,
  Activity,
  CheckCircle2,
} from "lucide-react"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface DayCell {
  date: string
  count: number
  workoutCount: number
  runCount: number
  bodyProgressCount: number
  habitCount: number
}

interface MonthLabel {
  label: string
  weekIndex: number
}

interface HeatmapResponse {
  from: string
  to: string
  weeks: DayCell[][]
  monthLabels: MonthLabel[]
  totalDays: number
}

const CELL_SIZE = 11
const CELL_GAP = 2
const STEP = CELL_SIZE + CELL_GAP

const COLORS = [
  "#1e2a3a",
  "#0e4429",
  "#006d32",
  "#26a641",
  "#39d353",
]

function getColor(count: number): string {
  if (count >= 10) return COLORS[4]
  if (count >= 7) return COLORS[3]
  if (count >= 4) return COLORS[2]
  if (count >= 1) return COLORS[1]
  return COLORS[0]
}

const DAY_LABELS = ["Mon", "", "Wed", "", "Fri", "", ""]

function formatDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function formatLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

function formatTooltipDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function ActivityHeatmap() {
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [filters, setFilters] = useState({
    workout: true,
    run: true,
    bodyProgress: true,
    habit: true,
  })
  const [tooltip, setTooltip] = useState<{
    x: number
    y: number
    day: DayCell | null
  }>({ x: 0, y: 0, day: null })

  const toParam = formatDate(endDate)
  const todayStr = formatDate(new Date())
  const isCurrent = toParam >= todayStr

  const { data, isLoading, isError } = useQuery<HeatmapResponse>({
    queryKey: ["calendar", "heatmap", toParam],
    queryFn: () => api.get(`/calendar/heatmap?to=${toParam}`),
  })

  const filteredWeeks = useMemo(() => {
    if (!data) return []
    const allActive =
      filters.workout && filters.run && filters.bodyProgress && filters.habit
    if (allActive) return data.weeks

    return data.weeks.map((week) =>
      week.map((day) => {
        let count = 0
        if (filters.workout) count += day.workoutCount
        if (filters.run) count += day.runCount
        if (filters.bodyProgress) count += day.bodyProgressCount
        if (filters.habit) count += day.habitCount
        return { ...day, count }
      }),
    )
  }, [data, filters])

  const rangeLabel = useMemo(() => {
    if (!data) return ""
    return `${formatLabel(data.from)} – ${formatLabel(data.to)}`
  }, [data])

  const tooltipEl =
    tooltip.day &&
    createPortal(
      <div
        className="fixed z-[9999] pointer-events-none"
        style={{
          left: tooltip.x,
          top: tooltip.y,
          transform: "translate(-50%, -100%)",
        }}
      >
        <div
          className="text-xs rounded-md px-3 py-1.5 shadow-lg whitespace-nowrap"
          style={{
            backgroundColor: "#24293e",
            color: "#e6edf3",
            border: "1px solid #373e52",
          }}
        >
          {tooltip.day.count === 0 ? (
            <span>
              No contributions on{" "}
              <span className="font-medium">
                {formatTooltipDate(tooltip.day.date)}
              </span>
            </span>
          ) : (
            <span>
              <span className="font-medium">
                {tooltip.day.count} contribution
                {tooltip.day.count === 1 ? "" : "s"}
              </span>{" "}
              on {formatTooltipDate(tooltip.day.date)}
            </span>
          )}
        </div>
      </div>,
      document.body,
    )

  return (
    <>
      {tooltipEl}
      <div
        className="relative rounded-xl overflow-hidden border border-white/5"
        style={{ backgroundColor: "#1a1f2e" }}
      >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: "#e6edf3" }}>
            Activity Heatmap
          </h3>
          {!isLoading && data && (
            <p className="text-[11px] mt-0.5" style={{ color: "#8b949e" }}>
              {rangeLabel}
            </p>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => {
              const d = new Date(endDate)
              d.setMonth(d.getMonth() - 12)
              d.setDate(1)
              setEndDate(d)
            }}
            className="flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
            style={{ width: 28, height: 28, color: "#8b949e" }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setEndDate(new Date())}
            disabled={isCurrent}
            className="flex items-center justify-center rounded-md hover:bg-white/10 transition-colors disabled:opacity-30 text-[11px] font-medium"
            style={{ width: 36, height: 28, color: "#8b949e" }}
          >
            Now
          </button>
          <button
            onClick={() => {
              const d = new Date(endDate)
              d.setMonth(d.getMonth() + 12)
              d.setDate(1)
              setEndDate(d)
            }}
            disabled={isCurrent}
            className="flex items-center justify-center rounded-md hover:bg-white/10 transition-colors disabled:opacity-30"
            style={{ width: 28, height: 28, color: "#8b949e" }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filter toggles */}
      <div className="flex flex-wrap items-center gap-1.5 px-5 pb-3">
        {([
          ["workout", "Workout", Dumbbell, "#e6edf3"],
          ["run", "Run", Footprints, "#e6edf3"],
          ["bodyProgress", "Progress", Activity, "#e6edf3"],
          ["habit", "Habit", CheckCircle2, "#e6edf3"],
        ] as const).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() =>
              setFilters((f) => ({ ...f, [key]: !f[key as keyof typeof filters] }))
            }
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
              filters[key as keyof typeof filters]
                ? "bg-white/10"
                : "bg-white/5",
            )}
            style={{
              color: filters[key as keyof typeof filters] ? "#e6edf3" : "#8b949e",
            }}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Heatmap Grid */}
      {isLoading ? (
        <div className="px-5 pb-4">
          <Skeleton className="h-3 w-48 mb-3" style={{ backgroundColor: "#1e2a3a" }} />
          <div className="flex" style={{ gap: CELL_GAP }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="flex flex-col" style={{ gap: CELL_GAP }}>
                {Array.from({ length: 7 }).map((_, j) => (
                  <Skeleton
                    key={j}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      borderRadius: 2,
                      backgroundColor: "#1e2a3a",
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      ) : isError || !data || data.weeks.length === 0 ? (
        <div className="flex items-center justify-center px-5 pb-6" style={{ height: 140 }}>
          <p className="text-sm" style={{ color: "#8b949e" }}>
            No activity data available
          </p>
        </div>
      ) : (
        <div className="px-5 pb-3 overflow-x-auto">
          <div style={{ minWidth: filteredWeeks.length * STEP + 50 }}>
            {/* Month labels */}
            <div className="flex" style={{ marginLeft: 48, height: 14 }}>
              {data.monthLabels.map((ml, i) => {
                const left = ml.weekIndex * STEP
                const nextLeft =
                  i + 1 < data.monthLabels.length
                    ? data.monthLabels[i + 1].weekIndex * STEP
                    : filteredWeeks.length * STEP
                const width = Math.max(nextLeft - left, 1)
                return (
                  <div
                    key={`${ml.label}-${ml.weekIndex}`}
                    className="text-[11px] leading-none shrink-0"
                    style={{ color: "#8b949e", width }}
                  >
                    {ml.label}
                  </div>
                )
              })}
            </div>

            {/* Grid row */}
            <div className="flex mt-1">
              {/* Day labels */}
              <div
                className="flex flex-col shrink-0"
                style={{ width: 46, gap: CELL_GAP }}
              >
                {DAY_LABELS.map((label, i) => (
                  <div
                    key={i}
                    className="text-[11px] leading-none flex items-end"
                    style={{
                      color: "#8b949e",
                      height: CELL_SIZE,
                      paddingBottom: 1,
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* Cells */}
              <div className="flex" style={{ gap: CELL_GAP }}>
                {filteredWeeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col" style={{ gap: CELL_GAP }}>
                    {week.map((day, di) => (
                      <div
                        key={`${wi}-${di}`}
                        className="relative cursor-pointer"
                        style={{
                          width: CELL_SIZE,
                          height: CELL_SIZE,
                          borderRadius: 2,
                          backgroundColor: getColor(day.count),
                        }}
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect()
                          setTooltip({
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                            day,
                          })
                        }}
                        onMouseLeave={() =>
                          setTooltip({ x: 0, y: 0, day: null })
                        }
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end mt-3" style={{ gap: 3 }}>
              <span className="text-[11px] leading-none mr-1" style={{ color: "#8b949e" }}>
                Less
              </span>
              {COLORS.map((color, i) => (
                <div
                  key={i}
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    borderRadius: 2,
                    backgroundColor: color,
                  }}
                />
              ))}
              <span className="text-[11px] leading-none ml-1" style={{ color: "#8b949e" }}>
                More
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom link */}
      {!isLoading && data && data.weeks.length > 0 && (
        <div className="px-5 pb-3">
          <a
            href="#"
            className="text-[11px] no-underline hover:underline"
            style={{ color: "#8b949e" }}
            onClick={(e) => e.preventDefault()}
          >
            Learn how we count contributions
          </a>
        </div>
      )}

    </div>
    </>
  )
}
