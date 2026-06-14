"use client"

import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: { value: number; positive: boolean }
  className?: string
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/40 bg-card p-5 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
        className,
      )}
    >
      {/* Subtle background glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-extrabold tracking-tight text-foreground">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground font-medium">{description}</p>
          )}
        </div>
        {Icon && (
          <div className="rounded-xl bg-primary/10 p-3 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 group-hover:shadow-md group-hover:rotate-3 z-10">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1">
          <span
            className={cn(
              "inline-flex items-center text-xs font-medium",
              trend.positive
                ? "text-primary"
                : "text-destructive",
            )}
          >
            {trend.positive ? "+" : ""}
            {trend.value}%
          </span>
          <span className="text-xs text-muted-foreground">vs last month</span>
        </div>
      )}
    </div>
  )
}
