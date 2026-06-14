"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api, ApiClientError } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Bell, BellRing, CheckCheck, Trophy, Target, Dumbbell, ClipboardList, Timer, Info, AlertTriangle, CheckCircle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  severity: string
  link: string | null
  read: boolean
  createdAt: string
}

interface PaginatedResponse {
  data: Notification[]
  total: number
  page: number
  limit: number
  totalPages: number
}

function getIcon(type: string) {
  switch (type) {
    case "goal_reminder": return Target
    case "workout_reminder": return Dumbbell
    case "habit_reminder": return ClipboardList
    case "achievement": return Trophy
    default: return Info
  }
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "warning": return "text-amber-500"
    case "success": return "text-emerald-500"
    default: return "text-muted-foreground"
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: unreadData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => api.get<number>("/notifications/unread-count"),
    refetchInterval: 60000,
  })

  const { data: paginated, isLoading } = useQuery({
    queryKey: ["notifications", "list"],
    queryFn: () => api.get<PaginatedResponse>("/notifications?limit=50"),
    enabled: open,
  })

  const checkMutation = useMutation({
    mutationFn: () => api.post("/notifications/check", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
    onError: (err: Error) => {
      if (err instanceof ApiClientError && err.statusCode === 500) return
      toast.error("Failed to check notifications")
    },
  })

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => api.patch("/notifications/read-all", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast.success("All notifications marked as read")
    },
    onError: () => toast.error("Failed to mark all as read"),
  })

  const unreadCount = unreadData ?? 0

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      checkMutation.mutate()
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative size-8 rounded-lg text-muted-foreground hover:text-foreground">
          {unreadCount > 0 ? (
            <>
              <BellRing className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            </>
          ) : (
            <Bell className="h-4 w-4" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex flex-col p-0">
        <SheetHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
          <SheetTitle className="text-base">Notifications</SheetTitle>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1.5 text-muted-foreground"
              onClick={() => markAllReadMutation.mutate()}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </SheetHeader>
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Timer className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : !paginated?.data.length ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="mb-2 h-8 w-8" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {paginated.data.map((n) => {
                const Icon = getIcon(n.type)
                return (
                  <div
                    key={n.id}
                    className={cn(
                      "flex gap-3 px-6 py-4 text-sm transition-colors hover:bg-muted/30",
                      !n.read && "bg-primary/5",
                    )}
                  >
                    <div className="mt-0.5 shrink-0">
                      <Icon className={cn("h-4 w-4", getSeverityColor(n.severity))} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn("font-medium", !n.read && "text-foreground")}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 h-6 w-6 rounded-full text-muted-foreground hover:text-foreground"
                            onClick={() => markReadMutation.mutate(n.id)}
                          >
                            <CheckCheck className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <p className="mt-0.5 text-muted-foreground line-clamp-2">{n.message}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground/60">
                        {formatTimeAgo(n.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

function formatTimeAgo(dateStr: string) {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}
