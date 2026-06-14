"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { Footprints } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const runTypes = [
  "EasyRun",
  "RecoveryRun",
  "TempoRun",
  "IntervalRun",
  "LongRun",
  "Race",
] as const

const typeLabels: Record<string, string> = {
  EasyRun: "Easy Run",
  RecoveryRun: "Recovery Run",
  TempoRun: "Tempo Run",
  IntervalRun: "Interval Run",
  LongRun: "Long Run",
  Race: "Race",
}

function calcPace(distanceKm: number, durationMinutes: number): string {
  if (distanceKm <= 0 || durationMinutes <= 0) return "-"
  const pace = durationMinutes / distanceKm
  const min = Math.floor(pace)
  const sec = Math.round((pace - min) * 60)
  return `${min}:${sec.toString().padStart(2, "0")} /km`
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export default function NewRunPage() {
  const router = useRouter()
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [type, setType] = useState("")
  const [distanceKm, setDistanceKm] = useState("")
  const [durationHours, setDurationHours] = useState("")
  const [durationMinutes, setDurationMinutes] = useState("")
  const [notes, setNotes] = useState("")

  const durationTotal = (Number(durationHours) || 0) * 60 + (Number(durationMinutes) || 0)

  const createMutation = useMutation({
    mutationFn: (body: unknown) => api.post("/runs", body),
    onSuccess: () => {
      toast.success("Run saved")
      router.push("/running")
    },
    onError: () => {
      toast.error("Failed to save run")
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!type || !distanceKm || durationTotal <= 0) return

    await createMutation.mutateAsync({
      date: new Date(date).toISOString(),
      type,
      distanceKm: Number(distanceKm),
      durationMinutes: durationTotal,
      notes: notes || undefined,
    })
  }

  const pace = calcPace(Number(distanceKm), durationTotal)
  const canSubmit = type && distanceKm && durationTotal > 0

  return (
    <div className="animate-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">New Run</h2>
        <p className="text-sm text-muted-foreground">Log today&apos;s running activity</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-lg text-card-foreground">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <DatePicker value={date} onChange={setDate} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {runTypes.map((t) => (
                    <SelectItem key={t} value={t}>
                      {typeLabels[t]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Distance (km)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
                placeholder="e.g. 5.2"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Duration</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  value={durationHours}
                  onChange={(e) => setDurationHours(e.target.value)}
                  placeholder="hrs"
                  className="w-24"
                />
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="min"
                  className="w-24"
                />
              </div>
            </div>
          </div>

          {distanceKm && durationTotal > 0 && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-border/40 bg-muted/30 px-4 py-3">
              <Footprints className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-semibold">Average pace</p>
                <p className="text-xs text-muted-foreground">
                  {pace} · {formatDuration(durationTotal)} total
                </p>
              </div>
            </div>
          )}

          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">Notes (optional)</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How did it feel? Weather conditions?" rows={2} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div />
          <div className="flex gap-3">
            <Button type="button" variant="destructive" onClick={() => router.push("/running")}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || createMutation.isPending}>
              {createMutation.isPending ? "Saving..." : "Save Run"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
