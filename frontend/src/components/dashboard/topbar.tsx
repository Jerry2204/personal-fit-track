"use client"

import { usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSidebar } from "./sidebar-provider"
import { Menu, LifeBuoy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationBell } from "@/components/notification-bell"
import Link from "next/link"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/workouts": "Workouts",
  "/workout-plans": "Workout Plans",
  "/running": "Running",
  "/shoes": "Shoes",
  "/exercises": "Exercises",
  "/body-progress": "Body Progress",
  "/goals": "Goals",
  "/records": "Records",
  "/progressive-overload": "Progressive Overload",
  "/habits": "Habits",
  "/calendar": "Calendar",
  "/reports": "Reports",
  "/achievements": "Achievements",
  "/settings": "Settings",
  "/help": "Help Center",
  "/help/getting-started": "Getting Started",
}

function getPageTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname]
  for (const [prefix, title] of Object.entries(pageTitles)) {
    if (pathname.startsWith(prefix + "/") && prefix !== "/") return title
  }
  return "Dashboard"
}

export function Topbar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { collapsed, setCollapsed } = useSidebar()

  const pageTitle = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 shadow-sm">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:inline-flex size-8 rounded-lg text-muted-foreground hover:text-foreground"
          onClick={() => setCollapsed((prev: boolean) => !prev)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-bold tracking-tight">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-3">
        <NotificationBell />
        <Link
          href="/help"
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Help Center"
        >
          <LifeBuoy className="h-4 w-4" />
        </Link>
        <ThemeToggle />
        <Avatar className="size-8 cursor-pointer border-2 border-primary/10 transition-all hover:border-primary/30">
          <AvatarImage src={user?.avatarUrl || undefined} alt={user?.name || "Avatar"} />
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
