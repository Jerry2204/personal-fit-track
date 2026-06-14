"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/lib/auth-store"
import { useSidebar } from "./sidebar-provider"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  LayoutDashboard,
  Dumbbell,
  Footprints,
  BookOpen,
  Activity,
  Target,
  Trophy,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ListChecks,
  SportShoe,
  Medal,
  TrendingUp,
  CalendarArrowUp,
  LifeBuoy,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Training",
    items: [
      { href: "/exercises", label: "Exercises", icon: BookOpen },
      { href: "/workouts", label: "Workouts", icon: Dumbbell },
      { href: "/workout-plans", label: "Plans", icon: CalendarArrowUp },
      { href: "/running", label: "Running", icon: Footprints },
    ],
  },
  {
    title: "Progress",
    items: [
      { href: "/body-progress", label: "Body Progress", icon: Activity },
      { href: "/goals", label: "Goals", icon: Target },
      { href: "/habits", label: "Habits", icon: ListChecks },
      { href: "/calendar", label: "Calendar", icon: Calendar },
    ],
  },
  {
    title: "Analytics",
    items: [
      { href: "/reports", label: "Reports", icon: BarChart3 },
      { href: "/records", label: "Records", icon: Trophy },
      { href: "/progressive-overload", label: "Progressive", icon: TrendingUp },
      { href: "/achievements", label: "Achievements", icon: Medal },
    ],
  },
  {
    title: "Equipment",
    items: [
      { href: "/shoes", label: "Shoes", icon: SportShoe },
    ],
  },
  {
    title: "System",
    items: [
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/help", label: "Help Center", icon: LifeBuoy },
    ],
  },
]

const mobileNavItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/workout-plans", label: "Plans", icon: CalendarArrowUp },
  { href: "/running", label: "Running", icon: Footprints },
  { href: "/shoes", label: "Shoes", icon: SportShoe },
]

export function Sidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuthStore()
  const { collapsed, toggleSidebar } = useSidebar()
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  const toggleGroup = (title: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(title)) {
        next.delete(title)
      } else {
        next.add(title)
      }
      return next
    })
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex md:flex-col md:fixed md:inset-y-0 z-30 transition-all duration-300 ease-in-out border-r bg-card",
          collapsed ? "md:w-16" : "md:w-64",
        )}
      >
        <div className="flex h-16 items-center px-4 pt-2">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3 font-bold tracking-tight w-full transition-all duration-300",
              collapsed ? "justify-center" : "justify-start px-2",
            )}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-xs font-bold text-primary-foreground">
              FT
            </div>
            {!collapsed && (
              <span className="text-base whitespace-nowrap overflow-hidden">
                FitTrack Pro
              </span>
            )}
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4 custom-scrollbar">
          {navGroups.map((group) => {
            const isGroupActive = group.items.some((item) => pathname === item.href)
            const isCollapsed = collapsedGroups.has(group.title)
            return (
              <div key={group.title} className="space-y-0.5">
                {!collapsed && (
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors",
                      isGroupActive
                        ? "text-primary"
                        : "text-muted-foreground/60 hover:text-foreground",
                    )}
                  >
                    <span>{group.title}</span>
                    <ChevronDown
                      className={cn(
                        "h-3 w-3 transition-transform duration-200",
                        isCollapsed && "-rotate-90",
                      )}
                    />
                  </button>
                )}
                {(!isCollapsed || collapsed) && (
                  <div className={cn(collapsed ? "space-y-1.5" : "space-y-0.5")}>
                    {group.items.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-300 relative overflow-hidden",
                            collapsed ? "justify-center px-2" : "justify-start",
                            isActive
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                          title={collapsed ? item.label : undefined}
                        >
                          <item.icon
                            className={cn(
                              "shrink-0 transition-transform duration-300 group-hover:scale-110",
                              collapsed ? "h-5 w-5" : "h-4 w-4",
                            )}
                          />
                          {!collapsed && (
                            <span className="whitespace-nowrap z-10">{item.label}</span>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="p-4 space-y-2 relative">
          <ThemeToggle collapsed={collapsed} />
          
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl p-2 transition-all duration-300 border border-transparent hover:border-border/40 hover:bg-muted/30",
              collapsed && "justify-center p-1",
            )}
          >
            <Avatar className={cn("shrink-0 transition-all duration-300", collapsed ? "h-8 w-8" : "h-9 w-9 border-2 border-primary/20")}>
              <AvatarImage src={user?.avatarUrl || undefined} alt={user?.name || "Avatar"} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {user?.name || "User"}
                </p>
                <p className="truncate text-xs font-medium text-muted-foreground">
                  {user?.email || "user@example.com"}
                </p>
              </div>
            )}
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                onClick={() => {
                  logout()
                  window.location.href = "/"
                }}
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="w-full h-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-1"
              onClick={() => {
                logout()
                window.location.href = "/"
              }}
              title="Log out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Floating Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 flex size-6 items-center justify-center rounded-full border bg-background shadow-sm transition-colors hover:bg-muted z-40"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm md:hidden pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-around py-2 px-2">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-medium transition-all duration-300",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className={cn("transition-transform duration-300", isActive ? "h-5 w-5 scale-110" : "h-5 w-5")} />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
