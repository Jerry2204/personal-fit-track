"use client"

import Link from "next/link"
import { ArrowLeft, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HelpLayoutProps {
  title: string
  description?: string
  children: React.ReactNode
}

export function HelpLayout({ title, description, children }: HelpLayoutProps) {
  return (
    <div className="animate-in space-y-6">
      <Link
        href="/help"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Help Center
      </Link>

      <div>
        <div className="mb-1 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <HelpCircle className="h-4 w-4 text-primary" />
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Help Guide
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      {children}
    </div>
  )
}

export function HelpSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-lg text-card-foreground">
      <h3 className="mb-3 text-base font-semibold">{title}</h3>
      {children}
    </div>
  )
}

export function HelpSteps({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-2">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3 text-sm text-muted-foreground">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {i + 1}
          </span>
          <span className="pt-0.5">{step}</span>
        </li>
      ))}
    </ol>
  )
}

export function HelpTips({ tips }: { tips: string[] }) {
  return (
    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
        Tips
      </p>
      <ul className="space-y-1.5">
        {tips.map((tip, i) => (
          <li key={i} className="flex gap-2 text-sm text-amber-800 dark:text-amber-300">
            <span className="mt-0.5 shrink-0">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
