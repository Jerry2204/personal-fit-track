"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
  Settings,
  Plus,
  Scale,
  HelpCircle,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

const navCommands = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/exercises", label: "Exercise Library", icon: BookOpen },
  { href: "/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/running", label: "Running Tracker", icon: Footprints },
  { href: "/body-progress", label: "Body Progress", icon: Activity },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/habits", label: "Habit Log", icon: ListChecks },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/reports", label: "Monthly Report", icon: BarChart3 },
  { href: "/reports", label: "Yearly Report", icon: BarChart3 },
  { href: "/records", label: "Personal Records", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Help Center", icon: HelpCircle },
]

const quickActions = [
  { id: "add-workout", label: "Add Workout", icon: Plus, href: "/workouts/new" },
  { id: "add-running", label: "Add Running Activity", icon: Footprints, href: "/running/new" },
  { id: "add-body-progress", label: "Add Body Progress", icon: Scale, href: "/body-progress" },
  { id: "create-goal", label: "Create Goal", icon: Target, href: "/goals" },
  { id: "add-habit", label: "Add Habit Log", icon: ListChecks, href: "/habits" },
]

const recentPages: { href: string; label: string }[] = []

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = useCallback(
    (command: () => void) => {
      setOpen(false)
      command()
    },
    [],
  )

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, actions..." />
      <CommandList>
        <CommandEmpty>
          <div className="py-4">
            <p className="text-sm font-medium text-foreground">No results found</p>
            <p className="text-xs text-muted-foreground">
              Try a different search term
            </p>
          </div>
        </CommandEmpty>
        <CommandGroup heading="Quick Actions">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <CommandItem
                key={action.id}
                onSelect={() => runCommand(() => router.push(action.href))}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{action.label}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigate">
          {navCommands.map((item) => {
            const Icon = item.icon
            return (
              <CommandItem
                key={`${item.href}-${item.label}`}
                onSelect={() => runCommand(() => router.push(item.href))}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            )
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
