"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Settings, Save, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"

interface ProfileData {
  name: string
  age: number | null
  gender: string | null
  heightCm: number | null
  currentWeightKg: number | null
  fitnessGoal: string | null
  activityLevel: string | null
  targetWeightKg: number | null
  weeklyWorkoutTarget: number | null
  weeklyRunningTargetKm: number | null
}

interface ProfileResponse {
  id: string
  email: string
  profile: ProfileData | null
}

const genders = ["Male", "Female", "Other"] as const
const fitnessGoals = ["FatLoss", "MuscleGain", "Maintenance", "Endurance", "Strength"] as const
const activityLevels = ["Sedentary", "LightlyActive", "ModeratelyActive", "VeryActive", "ExtremelyActive"] as const

const goalLabels: Record<string, string> = {
  FatLoss: "Fat Loss",
  MuscleGain: "Muscle Gain",
  Maintenance: "Maintenance",
  Endurance: "Endurance",
  Strength: "Strength",
}

const activityLabels: Record<string, string> = {
  Sedentary: "Sedentary",
  LightlyActive: "Lightly Active",
  ModeratelyActive: "Moderately Active",
  VeryActive: "Very Active",
  ExtremelyActive: "Extremely Active",
}

const defaultForm: ProfileData = {
  name: "",
  age: null,
  gender: null,
  heightCm: null,
  currentWeightKg: null,
  fitnessGoal: null,
  activityLevel: null,
  targetWeightKg: null,
  weeklyWorkoutTarget: null,
  weeklyRunningTargetKm: null,
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/40 bg-card p-5 shadow-lg">
          <Skeleton className="mb-4 h-5 w-40" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function SettingsPage() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const [form, setForm] = useState<ProfileData>(defaultForm)
  const [loaded, setLoaded] = useState(false)

  const { data, isLoading, isError, error } = useQuery<ProfileResponse>({
    queryKey: ["profile"],
    queryFn: () => api.get("/profile"),
  })

  useEffect(() => {
    if (data && !loaded) {
      const p = data.profile
      setForm({
        name: p?.name ?? "",
        age: p?.age ?? null,
        gender: p?.gender ?? null,
        heightCm: p?.heightCm ?? null,
        currentWeightKg: p?.currentWeightKg ?? null,
        fitnessGoal: p?.fitnessGoal ?? null,
        activityLevel: p?.activityLevel ?? null,
        targetWeightKg: p?.targetWeightKg ?? null,
        weeklyWorkoutTarget: p?.weeklyWorkoutTarget ?? null,
        weeklyRunningTargetKm: p?.weeklyRunningTargetKm ?? null,
      })
      setLoaded(true)
    }
  }, [data, loaded])

  const updateMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.put("/profile", body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      toast.success("Profile updated")
    },
    onError: () => {
      toast.error("Failed to update profile")
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const body: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(form)) {
      if (value !== null && value !== "") {
        body[key] = value
      }
    }
    updateMutation.mutate(body)
  }

  const setNum = (key: keyof ProfileData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value === "" ? null : Number(value) }))
  }

  if (isLoading) return <div className="animate-in space-y-6"><SettingsSkeleton /></div>

  if (isError) {
    return (
      <div className="animate-in space-y-6">
        <EmptyState
          icon={AlertTriangle}
          title="Failed to load profile"
          description={error instanceof Error ? error.message : "An error occurred"}
        />
      </div>
    )
  }

  return (
    <div className="animate-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your profile and preferences</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account</CardTitle>
            <CardDescription>Your login details (read-only)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={data?.email ?? ""} disabled />
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
            <CardDescription>Basic details about yourself</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" type="number" min={1} max={150} value={form.age ?? ""} onChange={(e) => setNum("age", e.target.value)} placeholder="25" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={form.gender ?? ""} onValueChange={(v) => setForm({ ...form, gender: v || null })}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="heightCm">Height (cm)</Label>
                <Input id="heightCm" type="number" min={50} max={300} value={form.heightCm ?? ""} onChange={(e) => setNum("heightCm", e.target.value)} placeholder="175" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fitness Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fitness Details</CardTitle>
            <CardDescription>Current stats and goals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currentWeightKg">Current Weight (kg)</Label>
                <Input id="currentWeightKg" type="number" min={20} max={500} step={0.1} value={form.currentWeightKg ?? ""} onChange={(e) => setNum("currentWeightKg", e.target.value)} placeholder="75" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetWeightKg">Target Weight (kg)</Label>
                <Input id="targetWeightKg" type="number" min={20} max={500} step={0.1} value={form.targetWeightKg ?? ""} onChange={(e) => setNum("targetWeightKg", e.target.value)} placeholder="70" />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fitnessGoal">Fitness Goal</Label>
                <Select value={form.fitnessGoal ?? ""} onValueChange={(v) => setForm({ ...form, fitnessGoal: v || null })}>
                  <SelectTrigger id="fitnessGoal">
                    <SelectValue placeholder="Select goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {fitnessGoals.map((g) => (
                      <SelectItem key={g} value={g}>{goalLabels[g]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="activityLevel">Activity Level</Label>
                <Select value={form.activityLevel ?? ""} onValueChange={(v) => setForm({ ...form, activityLevel: v || null })}>
                  <SelectTrigger id="activityLevel">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {activityLevels.map((a) => (
                      <SelectItem key={a} value={a}>{activityLabels[a]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Targets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Targets</CardTitle>
            <CardDescription>Set your weekly fitness targets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="weeklyWorkoutTarget">Workouts per Week</Label>
                <Input id="weeklyWorkoutTarget" type="number" min={1} max={14} value={form.weeklyWorkoutTarget ?? ""} onChange={(e) => setNum("weeklyWorkoutTarget", e.target.value)} placeholder="4" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weeklyRunningTargetKm">Weekly Running Target (km)</Label>
                <Input id="weeklyRunningTargetKm" type="number" min={0} max={500} step={0.5} value={form.weeklyRunningTargetKm ?? ""} onChange={(e) => setNum("weeklyRunningTargetKm", e.target.value)} placeholder="20" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending}>
            <Save className="mr-1.5 h-4 w-4" />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
