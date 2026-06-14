import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getAnalytics(userId: string) {
    return {
      ...(await this.getSummary(userId)),
      ...(await this.getWeeklyProgress(userId)),
      ...(await this.getRecentActivity(userId)),
      ...(await this.getGoals(userId)),
      ...(await this.getBodyProgress(userId)),
      ...(await this.getPersonalRecords(userId)),
      charts: await this.getCharts(userId),
    };
  }

  private async getSummary(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayWorkout, todayRun, totalWorkouts, totalDistance, totalDuration, streakDays, profile] =
      await Promise.all([
        this.prisma.workout.findFirst({
          where: { userId, date: { gte: today, lt: tomorrow } },
          orderBy: { date: 'desc' },
        }),
        this.prisma.runActivity.findFirst({
          where: { userId, date: { gte: today, lt: tomorrow } },
          orderBy: { date: 'desc' },
        }),
        this.prisma.workout.count({ where: { userId } }),
        this.prisma.runActivity.aggregate({
          where: { userId },
          _sum: { distanceKm: true },
        }),
        this.prisma.runActivity.aggregate({
          where: { userId },
          _sum: { durationMinutes: true },
        }),
        this.computeStreak(userId),
        this.prisma.profile.findUnique({ where: { userId }, select: { name: true } }),
      ]);

    const totalDistanceKm = totalDistance._sum.distanceKm ?? 0;
    const totalDurationMin = totalDuration._sum.durationMinutes ?? 0;

    const caloriesBurned =
      (todayWorkout?.durationMinutes ?? 0) * 7 + (todayRun?.durationMinutes ?? 0) * 10;

    return {
      profileName: profile?.name ?? null,
      todaySummary: {
        hasWorkout: !!todayWorkout,
        workoutLabel: todayWorkout?.type ?? null,
        hasRun: !!todayRun,
        runDistance: todayRun?.distanceKm ?? null,
        runDuration: todayRun?.durationMinutes ?? null,
        caloriesBurned,
        streakDays,
      },
      overallStats: {
        totalWorkouts,
        totalDistance: Math.round(totalDistanceKm * 10) / 10,
        totalDuration: totalDurationMin,
        currentStreak: streakDays,
      },
    };
  }

  private async computeStreak(userId: string): Promise<number> {
    const logs = await this.prisma.habitLog.findMany({
      where: { userId },
      select: { date: true, workoutDone: true, runningDone: true },
      orderBy: { date: 'desc' },
    });

    if (logs.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    const checkDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const log = logs.find(
        (l) => l.date.toISOString().split('T')[0] === dateStr,
      );

      if (log && (log.workoutDone || log.runningDone)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  private async getWeeklyProgress(userId: string) {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const [weekWorkouts, weekRuns] = await Promise.all([
      this.prisma.workout.findMany({
        where: { userId, date: { gte: weekStart, lt: weekEnd } },
        select: { date: true },
      }),
      this.prisma.runActivity.findMany({
        where: { userId, date: { gte: weekStart, lt: weekEnd } },
        select: { date: true, distanceKm: true },
      }),
    ]);

    const workoutDays = new Set(
      weekWorkouts.map((w) => w.date.toISOString().split('T')[0]),
    );

    const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const runsOnDay = weekRuns.filter(
        (r) => r.date.toISOString().split('T')[0] === dateStr,
      );
      const km = runsOnDay.reduce((sum, r) => sum + r.distanceKm, 0);

      return {
        day: dayLabels[i],
        sessions: workoutDays.has(dateStr) ? 1 : 0,
        km: Math.round(km * 10) / 10,
      };
    });

    const sessionsCompleted = weeklyProgress.filter((d) => d.sessions > 0).length;
    const kmCompleted = weeklyProgress.reduce((sum, d) => sum + d.km, 0);

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    return {
      weeklyProgress,
      weeklyTargets: {
        sessionsTarget: profile?.weeklyWorkoutTarget ?? 4,
        sessionsCompleted,
        kmTarget: profile?.weeklyRunningTargetKm ?? 20,
        kmCompleted: Math.round(kmCompleted * 10) / 10,
      },
    };
  }

  private async getRecentActivity(userId: string) {
    const [workouts, runs] = await Promise.all([
      this.prisma.workout.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 4,
        include: {
          workoutExercises: {
            include: {
              sets: { select: { weightKg: true, reps: true } },
              exercise: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.runActivity.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 3,
      }),
    ]);

    const timeAgo = (d: Date) => {
      const diff = Math.floor(
        (new Date().getTime() - new Date(d).getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diff === 0) return 'Today';
      if (diff === 1) return 'Yesterday';
      return `${diff} days ago`;
    };

    const formatPace = (pace: number | null) => {
      if (!pace) return '0:00';
      const min = Math.floor(pace);
      const sec = Math.round((pace - min) * 60);
      return `${min}:${String(sec).padStart(2, '0')}`;
    };

    const recentWorkouts = workouts.map((w) => {
      let volume = 0;
      let exCount = 0;
      for (const we of w.workoutExercises) {
        exCount++;
        for (const s of we.sets) {
          volume += (s.weightKg ?? 0) * (s.reps ?? 0);
        }
      }
      return {
        id: w.id,
        date: timeAgo(w.date),
        type: w.type,
        duration: w.durationMinutes ?? 0,
        exercises: exCount,
        volume,
      };
    });

    const recentRuns = runs.map((r) => ({
      id: r.id,
      date: timeAgo(r.date),
      distance: Math.round(r.distanceKm * 10) / 10,
      duration: r.durationMinutes,
      pace: formatPace(r.averagePace),
      type: r.type,
    }));

    return { recentWorkouts, recentRuns };
  }

  private async getGoals(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId, status: 'Active' },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });

    const formatDeadline = (d: Date | null) => {
      if (!d) return 'No deadline';
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    };

    const typeLabels: Record<string, string> = {
      RunDistance: 'Distance',
      WorkoutSessions: 'Sessions',
      BodyWeight: 'Weight',
      Strength: 'Strength',
      RunningPace: 'Pace',
      Nutrition: 'Nutrition',
      Other: 'Other',
    };

    return {
      goals: goals.map((g) => ({
        id: g.id,
        name: g.name,
        type: typeLabels[g.type] ?? g.type,
        current: g.currentValue,
        target: g.targetValue,
        unit: g.unit,
        deadline: formatDeadline(g.deadline),
        status: g.status,
      })),
    };
  }

  private async getBodyProgress(userId: string) {
    const [profile, entries, allBodyProgress] = await Promise.all([
      this.prisma.profile.findUnique({ where: { userId } }),
      this.prisma.bodyProgress.findMany({
        where: { userId, weightKg: { not: null } },
        orderBy: { date: 'desc' },
        take: 30,
        select: { weightKg: true, date: true },
      }),
      this.prisma.bodyProgress.findFirst({
        where: { userId, weightKg: { not: null } },
        orderBy: { date: 'asc' },
        select: { weightKg: true },
      }),
    ]);

    if (entries.length === 0) {
      return {
        bodyProgress: null,
        bodyProgressTrend: [],
      };
    }

    const current = entries[0];
    const startWeight = allBodyProgress?.weightKg ?? profile?.currentWeightKg;
    const targetWeight = profile?.targetWeightKg;

    return {
      bodyProgress: {
        currentWeight: current.weightKg,
        startWeight,
        targetWeight,
        weightChange:
          startWeight !== null && startWeight !== undefined && current.weightKg !== null
            ? Math.round((current.weightKg - startWeight) * 10) / 10
            : null,
        lastMeasurement: current.date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        bodyFat: null,
      },
      bodyProgressTrend: entries
        .reverse()
        .map((e) => ({
          date: e.date.toISOString().split('T')[0],
          weight: e.weightKg,
        })),
    };
  }

  private async getPersonalRecords(userId: string) {
    const [strongestLift, longestRun] = await Promise.all([
      this.prisma.workoutSet.findFirst({
        where: {
          workoutExercise: { workout: { userId } },
          weightKg: { not: null },
          reps: { not: null },
        },
        orderBy: [{ weightKg: 'desc' }, { reps: 'desc' }],
        select: {
          weightKg: true,
          workoutExercise: {
            select: {
              exercise: { select: { name: true } },
              workout: { select: { date: true } },
            },
          },
        },
      }),
      this.prisma.runActivity.findFirst({
        where: { userId },
        orderBy: { distanceKm: 'desc' },
        select: { distanceKm: true, date: true },
      }),
    ]);

    const records: {
      exercise: string;
      value: string;
      date: string;
      category: string;
    }[] = [];

    if (strongestLift) {
      records.push({
        exercise: strongestLift.workoutExercise.exercise.name,
        value: `${strongestLift.weightKg} kg`,
        date: strongestLift.workoutExercise.workout.date
          .toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        category: 'Strength',
      });
    }

    if (longestRun) {
      records.push({
        exercise: 'Longest Run',
        value: `${longestRun.distanceKm.toFixed(1)} km`,
        date: longestRun.date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        category: 'Running',
      });
    }

    return { personalRecords: records };
  }

  private async getCharts(userId: string) {
    const now = new Date();
    const week = 7 * 24 * 60 * 60 * 1000;

    const weeks: Date[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getTime() - i * week);
      const ws = new Date(d);
      ws.setDate(d.getDate() - d.getDay());
      ws.setHours(0, 0, 0, 0);
      weeks.push(ws);
    }

    const weekLabel = (d: Date) => {
      const month = d.toLocaleDateString('en-US', { month: 'short' });
      const day = d.getDate();
      return `${month} ${day}`;
    };

    const [allWorkouts, allRuns, allBodyProgress, allGoals, allHabitLogs] =
      await Promise.all([
        this.prisma.workout.findMany({
          where: { userId },
          include: {
            workoutExercises: {
              include: {
                sets: { select: { weightKg: true, reps: true } },
              },
            },
          },
        }),
        this.prisma.runActivity.findMany({
          where: { userId },
        }),
        this.prisma.bodyProgress.findMany({
          where: { userId, weightKg: { not: null } },
          orderBy: { date: 'asc' },
          select: { weightKg: true, date: true },
        }),
        this.prisma.goal.findMany({
          where: { userId },
        }),
        this.prisma.habitLog.findMany({
          where: { userId },
        }),
      ]);

    const inWeek = (date: Date, weekStart: Date) => {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const ws = new Date(weekStart);
      const we = new Date(ws);
      we.setDate(we.getDate() + 7);
      return d >= ws && d < we;
    };

    const sumSets = (w: typeof allWorkouts[0]) => {
      let total = 0;
      for (const we of w.workoutExercises) {
        for (const s of we.sets) {
          total += (s.weightKg ?? 0) * (s.reps ?? 0);
        }
      }
      return total;
    };

    const workoutVolume = weeks.map((ws) => ({
      week: weekLabel(ws),
      volume: allWorkouts
        .filter((w) => inWeek(w.date, ws))
        .reduce((sum, w) => sum + sumSets(w), 0),
    }));

    const runningDistance = weeks.map((ws) => ({
      week: weekLabel(ws),
      distance: Math.round(
        allRuns
          .filter((r) => inWeek(r.date, ws))
          .reduce((sum, r) => sum + r.distanceKm, 0) * 10,
      ) / 10,
    }));

    const runningPace = weeks.map((ws) => {
      const runsInWeek = allRuns.filter(
        (r) => inWeek(r.date, ws) && r.averagePace !== null,
      );
      const avgPace =
        runsInWeek.length > 0
          ? Math.round(
              (runsInWeek.reduce((sum, r) => sum + (r.averagePace ?? 0), 0) /
                runsInWeek.length) *
                100,
            ) / 100
          : 0;
      return {
        week: weekLabel(ws),
        pace: avgPace,
      };
    });

    const weightTrend = allBodyProgress.map((e) => ({
      date: e.date.toISOString().split('T')[0],
      weight: e.weightKg,
    }));

    const months: Date[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d);
    }

    const monthLabel = (d: Date) =>
      d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

    const inMonth = (date: Date, month: Date) => {
      const d = new Date(date);
      return (
        d.getFullYear() === month.getFullYear() &&
        d.getMonth() === month.getMonth()
      );
    };

    const goalCompletion = months.map((m) => {
      const monthGoals = allGoals.filter((g) => inMonth(g.createdAt, m));
      const completed = monthGoals.filter(
        (g) => g.status === 'Completed',
      ).length;
      return {
        month: monthLabel(m),
        completed,
        total: monthGoals.length,
      };
    });

    const habitConsistency = weeks.map((ws) => {
      const logsInWeek = allHabitLogs.filter((l) => inWeek(l.date, ws));
      const trackedDays = logsInWeek.length;
      const completedDays = logsInWeek.filter(
        (l) => l.workoutDone || l.runningDone,
      ).length;
      return {
        week: weekLabel(ws),
        rate: trackedDays > 0 ? Math.round((completedDays / trackedDays) * 100) : 0,
      };
    });

    return {
      workoutVolume,
      runningDistance,
      runningPace,
      weightTrend,
      goalCompletion,
      habitConsistency,
    };
  }
}
