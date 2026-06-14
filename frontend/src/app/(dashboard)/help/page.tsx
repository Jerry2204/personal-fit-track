"use client"

import { useState } from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  Dumbbell,
  Footprints,
  BookOpen,
  Activity,
  Target,
  ListChecks,
  Calendar,
  BarChart3,
  Trophy,
  SportShoe,
  Settings,
  LifeBuoy,
  Search,
  HelpCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { helpPages, searchHelpPages } from "@/lib/help-content"
import { HelpSearch } from "@/components/help/help-search"
import { Accordion } from "@/components/ui/accordion"

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Dumbbell,
  Footprints,
  BookOpen,
  Activity,
  Target,
  ListChecks,
  Calendar,
  BarChart3,
  Trophy,
  SportShoe,
  Settings,
}

function HelpCard({
  title,
  description,
  iconName,
  href,
}: {
  title: string
  description: string
  iconName: string
  href: string
}) {
  const Icon = iconMap[iconName] || HelpCircle

  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-border/40 bg-card p-5 shadow-lg text-card-foreground transition-all hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <h3 className="mb-1 text-sm font-semibold">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </Link>
  )
}

export default function HelpCenterPage() {
  const [query, setQuery] = useState("")
  const results = query ? searchHelpPages(query) : helpPages

  return (
    <div className="animate-in space-y-6">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <LifeBuoy className="h-4 w-4 text-primary" />
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Support
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Help Center</h2>
        <p className="text-sm text-muted-foreground">
          Guides and resources to help you get the most out of FitTrack Pro.
        </p>
      </div>

      <HelpSearch value={query} onChange={setQuery} />

      {query && results.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-14">
          <Search className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-lg font-semibold text-foreground">No results found</p>
          <p className="text-sm text-muted-foreground">
            Try a different search term or browse the categories below.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {query ? ` ${results.length} article${results.length !== 1 ? "s" : ""} found` : "All Topics"}
              </h3>
            </div>
            <Link
              href="/help/getting-started"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              New here? Start with Getting Started
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((page) => (
              <HelpCard
                key={page.slug}
                title={page.title}
                description={page.description}
                iconName={page.icon}
                href={page.href}
              />
            ))}
          </div>

          {/* FAQ Section */}
          <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-lg text-card-foreground">
            <h3 className="mb-2 text-base font-semibold">Frequently Asked Questions</h3>
            <Accordion
              items={[
                {
                  question: "How do I reset my password?",
                  answer: "Go to the login page and click 'Forgot Password'. Follow the instructions sent to your email.",
                },
                {
                  question: "How is workout volume calculated?",
                  answer: "Volume = sets × reps × weight for each exercise. Total workout volume is the sum of all exercise volumes in a session.",
                },
                {
                  question: "How is running pace calculated?",
                  answer: "Pace = duration ÷ distance. It is shown as minutes per kilometre.",
                },
                {
                  question: "Can I edit or delete past entries?",
                  answer: "Yes. You can edit or delete workouts, runs, body progress entries, and goals from their respective detail pages.",
                },
                {
                  question: "Are my goals updated automatically?",
                  answer: "Yes. Goals track progress automatically as you log workouts, runs, and body measurements.",
                },
                {
                  question: "How do I export my data?",
                  answer: "Go to the Reports page and use the export options to download your data as CSV or PDF.",
                },
              ]}
            />
          </div>
        </>
      )}
    </div>
  )
}
