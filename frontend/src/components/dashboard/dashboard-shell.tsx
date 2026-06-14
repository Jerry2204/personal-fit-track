"use client"

import { useSidebar } from "./sidebar-provider"
import { cn } from "@/lib/utils"
import { Topbar } from "./topbar"

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar()

  return (
    <main
      className={cn(
        "flex-1 transition-all duration-300 ease-in-out pb-16 md:pb-0",
        collapsed ? "md:ml-16" : "md:ml-64",
      )}
    >
      <Topbar />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  )
}
