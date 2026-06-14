export const currentUser = {
  name: "Alex Chen",
  email: "alex@example.com",
  initials: "AC",
}

export const todaySummary = {
  hasWorkout: true,
  workoutLabel: "Upper Body",
  workoutStatus: "completed" as const,
  hasRun: true,
  runDistance: 5.2,
  runDuration: 28,
  runStatus: "completed" as const,
  caloriesBurned: 420,
  streakDays: 12,
}

export const weeklyProgress = [
  { day: "Mon", sessions: 1, km: 0 },
  { day: "Tue", sessions: 0, km: 5.2 },
  { day: "Wed", sessions: 1, km: 0 },
  { day: "Thu", sessions: 1, km: 3.8 },
  { day: "Fri", sessions: 0, km: 0 },
  { day: "Sat", sessions: 1, km: 8.1 },
  { day: "Sun", sessions: 0, km: 0 },
]

export const weeklyTargets = {
  sessionsTarget: 4,
  sessionsCompleted: 4,
  kmTarget: 20,
  kmCompleted: 17.1,
}

export const recentWorkouts = [
  {
    id: "1",
    date: "Today",
    type: "Upper Body",
    duration: 52,
    exercises: 6,
    volume: 8240,
  },
  {
    id: "2",
    date: "Yesterday",
    type: "Running",
    duration: 28,
    exercises: 0,
    volume: 0,
    distance: 5.2,
  },
  {
    id: "3",
    date: "2 days ago",
    type: "Push",
    duration: 48,
    exercises: 5,
    volume: 7120,
  },
  {
    id: "4",
    date: "3 days ago",
    type: "Lower Body",
    duration: 55,
    exercises: 5,
    volume: 9800,
  },
]

export const recentRuns = [
  {
    id: "1",
    date: "Yesterday",
    distance: 5.2,
    duration: 28,
    pace: "5:23",
    type: "Easy Run" as const,
  },
  {
    id: "2",
    date: "2 days ago",
    distance: 3.8,
    duration: 20,
    pace: "5:16",
    type: "Recovery Run" as const,
  },
  {
    id: "3",
    date: "4 days ago",
    distance: 8.1,
    duration: 43,
    pace: "5:18",
    type: "Long Run" as const,
  },
]

export const goals = [
  {
    id: "1",
    name: "Run 100 km this month",
    type: "Distance" as const,
    current: 72,
    target: 100,
    unit: "km",
    deadline: "Jun 30, 2026",
    status: "active" as const,
  },
  {
    id: "2",
    name: "Bench Press 80 kg",
    type: "Strength" as const,
    current: 72.5,
    target: 80,
    unit: "kg",
    deadline: "Aug 15, 2026",
    status: "active" as const,
  },
  {
    id: "3",
    name: "Complete 20 gym sessions",
    type: "Sessions" as const,
    current: 14,
    target: 20,
    unit: "sessions",
    deadline: "Jun 30, 2026",
    status: "active" as const,
  },
]

export const bodyProgress = {
  currentWeight: 78.5,
  startWeight: 82.0,
  targetWeight: 75.0,
  weightChange: -3.5,
  lastMeasurement: "Jun 10, 2026",
  bodyFat: 14.2,
}

export const personalRecords = [
  {
    exercise: "Bench Press",
    value: "72.5 kg",
    date: "Jun 8, 2026",
    category: "strength" as const,
  },
  {
    exercise: "Squat",
    value: "95 kg",
    date: "Jun 5, 2026",
    category: "strength" as const,
  },
  {
    exercise: "Deadlift",
    value: "110 kg",
    date: "Jun 3, 2026",
    category: "strength" as const,
  },
  {
    exercise: "5K Run",
    value: "25:42",
    date: "Jun 2, 2026",
    category: "run" as const,
  },
  {
    exercise: "Longest Run",
    value: "12.4 km",
    date: "May 28, 2026",
    category: "run" as const,
  },
]

export const overallStats = {
  totalWorkouts: 42,
  totalDistance: 156.3,
  totalDuration: 2840,
  currentStreak: 12,
}
