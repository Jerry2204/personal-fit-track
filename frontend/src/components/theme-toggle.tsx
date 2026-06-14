"use client"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
  collapsed?: boolean
}

export function ThemeToggle({ className, collapsed }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size={collapsed ? "icon" : "sm"}
      onClick={toggleTheme}
      className={cn(
        "gap-2 text-muted-foreground hover:text-foreground",
        collapsed && "w-full",
        className,
      )}
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light" ? (
        <Moon className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} />
      ) : (
        <Sun className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4")} />
      )}
      {!collapsed && (
        <span className="text-xs">{theme === "light" ? "Dark mode" : "Light mode"}</span>
      )}
    </Button>
  )
}
