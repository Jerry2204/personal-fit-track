"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { gettingStartedSteps } from "@/lib/help-content"

function ChecklistItem({
  step,
  index,
  completed,
  onToggle,
}: {
  step: (typeof gettingStartedSteps)[number]
  index: number
  completed: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border p-4 transition-all",
        completed
          ? "border-green-200 bg-green-50 dark:border-green-900/30 dark:bg-green-950/10"
          : "border-border/40 bg-card text-card-foreground",
      )}
    >
      <button
        onClick={onToggle}
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all",
          completed
            ? "border-green-500 bg-green-500 text-white"
            : "border-muted-foreground/30 hover:border-primary/50",
        )}
      >
        {completed ? (
          <Check className="h-4 w-4" />
        ) : (
          <span className="text-xs font-bold text-muted-foreground">{index + 1}</span>
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-sm font-medium",
            completed ? "text-green-700 line-through dark:text-green-400" : "text-card-foreground",
          )}
        >
          {step.title}
        </p>
        <p className="text-xs text-muted-foreground">{step.description}</p>
      </div>
      <Link href={step.href}>
        <Button variant="outline" size="sm" className="text-xs">
          Go
        </Button>
      </Link>
    </div>
  )
}

export function OnboardingChecklist() {
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [expanded, setExpanded] = useState(true)

  const allDone = completed.size === gettingStartedSteps.length
  const progress = Math.round((completed.size / gettingStartedSteps.length) * 100)

  const toggleItem = (index: number) => {
    setCompleted((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <div className="rounded-2xl border border-border/40 bg-card shadow-lg text-card-foreground">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Check className="h-4 w-4 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold">Getting Started Checklist</h3>
            <p className="text-xs text-muted-foreground">
              {allDone
                ? "All done!"
                : `${completed.size} of ${gettingStartedSteps.length} complete`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden h-2 w-20 overflow-hidden rounded-full bg-muted sm:block">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="space-y-2 px-5 pb-5">
          {gettingStartedSteps.map((step, i) => (
            <ChecklistItem
              key={i}
              step={step}
              index={i}
              completed={completed.has(i)}
              onToggle={() => toggleItem(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
