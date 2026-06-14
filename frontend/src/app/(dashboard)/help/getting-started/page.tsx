"use client"

import Link from "next/link"
import { ArrowRight, Rocket, BookOpen, Dumbbell, Target, ListChecks } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HelpLayout, HelpSection, HelpTips } from "@/components/help/help-layout"
import { OnboardingChecklist } from "@/components/help/onboarding-checklist"

export default function GettingStartedPage() {
  return (
    <HelpLayout
      title="Getting Started"
      description="Everything you need to begin your fitness tracking journey with FitTrack Pro."
    >
      <OnboardingChecklist />

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/help/dashboard"
          className="group flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-5 shadow-lg text-card-foreground transition-all hover:-translate-y-0.5 hover:shadow-xl"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Read the Help Guide</p>
            <p className="text-xs text-muted-foreground">
              Learn about every feature in detail
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>

        <Link
          href="/exercises"
          className="group flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-5 shadow-lg text-card-foreground transition-all hover:-translate-y-0.5 hover:shadow-xl"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Dumbbell className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Explore Exercises</p>
            <p className="text-xs text-muted-foreground">
              Browse the exercise library
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>

        <Link
          href="/goals"
          className="group flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-5 shadow-lg text-card-foreground transition-all hover:-translate-y-0.5 hover:shadow-xl"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Set Your First Goal</p>
            <p className="text-xs text-muted-foreground">
              Define what you want to achieve
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>

        <Link
          href="/habits"
          className="group flex items-center gap-4 rounded-2xl border border-border/40 bg-card p-5 shadow-lg text-card-foreground transition-all hover:-translate-y-0.5 hover:shadow-xl"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <ListChecks className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Build Daily Habits</p>
            <p className="text-xs text-muted-foreground">
              Start tracking your daily routines
            </p>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <HelpSection title="Welcome to FitTrack Pro">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">You are in control of your fitness journey</p>
              <p className="text-xs text-muted-foreground">
                FitTrack Pro helps you log, track, and analyse every aspect of your training.
              </p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            Whether you are a beginner or an experienced athlete, the app is designed to be simple
            enough for daily use while providing powerful insights into your progress.
          </p>

          <HelpTips
            tips={[
              "Start by setting up your profile with your fitness goals.",
              "Log your first workout or run to see the dashboard come to life.",
              "Set weekly targets that challenge but don't overwhelm you.",
              "Use the Help Center anytime you need guidance.",
              "Consistency matters more than perfection — just keep logging.",
            ]}
          />
        </div>
      </HelpSection>

      <div className="flex justify-center">
        <Link href="/help">
          <Button variant="outline">
            Browse All Help Articles
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </HelpLayout>
  )
}
