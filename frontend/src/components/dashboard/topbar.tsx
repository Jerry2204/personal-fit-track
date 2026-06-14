"use client"

import { usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSidebar } from "./sidebar-provider"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/workouts": "Workouts",
  "/running": "Running",
  "/exercises": "Exercises",
  "/body-progress": "Body Progress",
  "/goals": "Goals",
  "/records": "Records",
  "/habits": "Habits",
  "/calendar": "Calendar",
  "/reports": "Reports",
  "/settings": "Settings",
}

export function Topbar() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const { collapsed, setCollapsed } = useSidebar()

  const pageTitle = pageTitles[pathname] || "Dashboard"

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-md px-4 sm:px-6 lg:px-8">
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

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Avatar className="size-8 cursor-pointer border-2 border-primary/10 transition-all hover:border-primary/30">
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
