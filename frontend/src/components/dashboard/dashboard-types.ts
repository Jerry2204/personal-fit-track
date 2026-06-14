export interface TodaySummary {
  hasWorkout: boolean
  workoutLabel: string | null
  hasRun: boolean
  runDistance: number | null
  runDuration: number | null
  caloriesBurned: number
  streakDays: number
}

export interface OverallStats {
  totalWorkouts: number
  totalDistance: number
  totalDuration: number
  currentStreak: number
}

export interface WeeklyProgressDay {
  day: string
  sessions: number
  km: number
}

export interface WeeklyTargets {
  sessionsTarget: number
  sessionsCompleted: number
  kmTarget: number
  kmCompleted: number
}

export interface RecentWorkout {
  id: string
  date: string
  type: string
  duration: number
  exercises: number
  volume: number
}

export interface RecentRun {
  id: string
  date: string
  distance: number
  duration: number
  pace: string
  type: string
}

export interface DashboardGoal {
  id: string
  name: string
  type: string
  current: number
  target: number
  unit: string | null
  deadline: string
  status: string
}

export interface BodyProgress {
  currentWeight: number | null
  startWeight: number | null
  targetWeight: number | null
  weightChange: number | null
  lastMeasurement: string | null
  bodyFat: number | null
}

export interface PersonalRecord {
  exercise: string
  value: string
  date: string
  category: string
}

export interface ChartData {
  workoutVolume: { week: string; volume: number }[]
  runningDistance: { week: string; distance: number }[]
  runningPace: { week: string; pace: number }[]
  weightTrend: { date: string; weight: number | null }[]
  goalCompletion: { month: string; completed: number; total: number }[]
  habitConsistency: { week: string; rate: number }[]
}

export interface DashboardAnalytics {
  profileName: string | null
  todaySummary: TodaySummary
  overallStats: OverallStats
  weeklyProgress: WeeklyProgressDay[]
  weeklyTargets: WeeklyTargets
  recentWorkouts: RecentWorkout[]
  recentRuns: RecentRun[]
  goals: DashboardGoal[]
  bodyProgress: BodyProgress | null
  bodyProgressTrend: { date: string; weight: number | null }[]
  personalRecords: PersonalRecord[]
  charts: ChartData
}
