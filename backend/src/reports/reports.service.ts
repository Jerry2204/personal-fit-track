import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMonthly(userId: string, year?: number, month?: number) {
    const now = new Date();
    const y = year ?? now.getFullYear();
    const m = month ?? now.getMonth() + 1;

    const monthStart = new Date(y, m - 1, 1);
    const monthEnd = new Date(y, m, 1);

    const monthLabel = monthStart.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    const [
      workouts,
      runs,
      goals,
      habitLogs,
      bodyProgressEntries,
      allBodyProgress,
      profile,
    ] = await Promise.all([
      this.prisma.workout.findMany({
        where: { userId, date: { gte: monthStart, lt: monthEnd } },
        include: {
          workoutExercises: {
            include: {
              exercise: { select: { name: true, muscleGroup: true } },
              sets: { select: { weightKg: true, reps: true } },
            },
          },
        },
        orderBy: { date: 'asc' },
      }),
      this.prisma.runActivity.findMany({
        where: { userId, date: { gte: monthStart, lt: monthEnd } },
        orderBy: { date: 'asc' },
      }),
      this.prisma.goal.findMany({
        where: { userId },
      }),
      this.prisma.habitLog.findMany({
        where: { userId, date: { gte: monthStart, lt: monthEnd } },
      }),
      this.prisma.bodyProgress.findMany({
        where: { userId, date: { gte: monthStart, lt: monthEnd }, weightKg: { not: null } },
        orderBy: { date: 'asc' },
        select: { weightKg: true, date: true },
      }),
      this.prisma.bodyProgress.findFirst({
        where: { userId, weightKg: { not: null } },
        orderBy: { date: 'asc' },
        select: { weightKg: true, date: true },
      }),
      this.prisma.profile.findUnique({
        where: { userId },
        select: { currentWeightKg: true, targetWeightKg: true },
      }),
    ]);

    const workoutsInMonth = workouts.length;
    const runsInMonth = runs.length;

    // Workout volume
    let totalVolume = 0;
    const muscleGroupCount: Record<string, number> = {};

    for (const w of workouts) {
      let workoutVolume = 0;
      for (const we of w.workoutExercises) {
        const mg = we.exercise.muscleGroup;
        muscleGroupCount[mg] = (muscleGroupCount[mg] || 0) + 1;
        for (const s of we.sets) {
          const vol = (s.weightKg ?? 0) * (s.reps ?? 0);
          workoutVolume += vol;
          totalVolume += vol;
        }
      }
    }

    const mostTrainedMuscle =
      Object.entries(muscleGroupCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    // Running stats
    const totalDistance = runs.reduce((s, r) => s + r.distanceKm, 0);
    const totalDuration = runs.reduce((s, r) => s + r.durationMinutes, 0);
    const avgPace = runs.length > 0 && totalDistance > 0
      ? Math.round((totalDuration / totalDistance) * 100) / 100
      : null;

    const runTypeCount: Record<string, number> = {};
    for (const r of runs) {
      runTypeCount[r.type] = (runTypeCount[r.type] || 0) + 1;
    }
    const mostFrequentRunType =
      Object.entries(runTypeCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    // Goals
    const goalsInMonth = goals.filter((g) => {
      const created = new Date(g.createdAt);
      return created >= monthStart && created < monthEnd;
    });
    const completedInMonth = goals.filter((g) => {
      const updated = new Date(g.updatedAt);
      return g.status === 'Completed' && updated >= monthStart && updated < monthEnd;
    });
    const goalCompletionRate =
      goals.length > 0
        ? Math.round((goals.filter((g) => g.status === 'Completed').length / goals.length) * 100)
        : 0;

    // Habit consistency
    const totalDaysInMonth = new Date(y, m, 0).getDate();
    const trackedDays = habitLogs.length;
    const completedDays = habitLogs.filter(
      (l) => l.workoutDone || l.runningDone,
    ).length;
    const consistencyScore =
      trackedDays > 0
        ? Math.round((completedDays / totalDaysInMonth) * 100)
        : 0;
    const habitRate =
      trackedDays > 0
        ? Math.round((completedDays / trackedDays) * 100)
        : 0;

    // Weight change
    const startWeight = allBodyProgress?.weightKg ?? null;
    const currentWeight =
      bodyProgressEntries.length > 0
        ? bodyProgressEntries[bodyProgressEntries.length - 1].weightKg
        : profile?.currentWeightKg ?? null;
    const weightChange =
      startWeight !== null && currentWeight !== null
        ? Math.round((currentWeight - startWeight) * 10) / 10
        : null;

    // Personal records this month
    const strongestLift = await this.findStrongestLift(userId);
    const longestRun = await this.findLongestRun(userId);
    const fastestRun = await this.findFastestRun(userId);

    const personalRecords: {
      type: string; label: string; value: string; date: string | null;
    }[] = [];

    if (strongestLift) {
      personalRecords.push({
        type: 'strength',
        label: strongestLift.exerciseName,
        value: `${strongestLift.weightKg} kg × ${strongestLift.reps}`,
        date: strongestLift.date
          ? new Date(strongestLift.date).toISOString().split('T')[0]
          : null,
      });
    }
    if (longestRun) {
      personalRecords.push({
        type: 'running',
        label: 'Longest Run',
        value: `${longestRun.distanceKm.toFixed(1)} km`,
        date: longestRun.date ? new Date(longestRun.date).toISOString().split('T')[0] : null,
      });
    }
    if (fastestRun) {
      const paceMin = Math.floor(fastestRun.averagePace!);
      const paceSec = Math.round((fastestRun.averagePace! - paceMin) * 60);
      personalRecords.push({
        type: 'running',
        label: 'Fastest Run',
        value: `${paceMin}:${String(paceSec).padStart(2, '0')} /km`,
        date: fastestRun.date ? new Date(fastestRun.date).toISOString().split('T')[0] : null,
      });
    }

    return {
      period: { year: y, month: m, label: monthLabel },
      summary: {
        totalWorkouts: workoutsInMonth,
        totalVolume: Math.round(totalVolume),
        totalRunningDistance: Math.round(totalDistance * 10) / 10,
        totalRunningDuration: totalDuration,
        averagePace: avgPace,
        goalCompletionRate,
        goalsCompleted: completedInMonth.length,
        goalsCreated: goalsInMonth.length,
        habitConsistency: habitRate,
        consistencyScore,
        weightChange,
        startWeight,
        currentWeight,
        mostTrainedMuscle,
        mostFrequentRunType,
        totalDaysInMonth,
        trackedDays,
        completedDays,
      },
      personalRecords,
      dailyBreakdown: this.buildDailyBreakdown(workouts, runs, bodyProgressEntries),
    };
  }

  private buildDailyBreakdown(
    workouts: any[],
    runs: any[],
    bodyProgress: any[],
  ) {
    const dayMap = new Map<string, { workouts: number; running: boolean; weight: number | null }>();

    for (const w of workouts) {
      const key = new Date(w.date).toISOString().split('T')[0];
      const entry = dayMap.get(key) || { workouts: 0, running: false, weight: null };
      entry.workouts++;
      dayMap.set(key, entry);
    }

    for (const r of runs) {
      const key = new Date(r.date).toISOString().split('T')[0];
      const entry = dayMap.get(key) || { workouts: 0, running: false, weight: null };
      entry.running = true;
      dayMap.set(key, entry);
    }

    for (const bp of bodyProgress) {
      const key = new Date(bp.date).toISOString().split('T')[0];
      const entry = dayMap.get(key) || { workouts: 0, running: false, weight: null };
      entry.weight = bp.weightKg;
      dayMap.set(key, entry);
    }

    return Array.from(dayMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getYearly(userId: string, year?: number) {
    const now = new Date();
    const y = year ?? now.getFullYear();

    const yearStart = new Date(y, 0, 1);
    const yearEnd = new Date(y + 1, 0, 1);

    const yearLabel = yearStart.toLocaleDateString('en-US', { year: 'numeric' });

    const [
      workouts,
      runs,
      goals,
      habitLogs,
      bodyProgressAll,
      profile,
    ] = await Promise.all([
      this.prisma.workout.findMany({
        where: { userId, date: { gte: yearStart, lt: yearEnd } },
        include: {
          workoutExercises: {
            include: {
              exercise: { select: { name: true, muscleGroup: true } },
              sets: { select: { weightKg: true, reps: true } },
            },
          },
        },
        orderBy: { date: 'asc' },
      }),
      this.prisma.runActivity.findMany({
        where: { userId, date: { gte: yearStart, lt: yearEnd } },
        orderBy: { date: 'asc' },
      }),
      this.prisma.goal.findMany({ where: { userId } }),
      this.prisma.habitLog.findMany({
        where: { userId, date: { gte: yearStart, lt: yearEnd } },
      }),
      this.prisma.bodyProgress.findMany({
        where: { userId, weightKg: { not: null } },
        orderBy: { date: 'asc' },
        select: { weightKg: true, date: true },
      }),
      this.prisma.profile.findUnique({
        where: { userId },
        select: { currentWeightKg: true, targetWeightKg: true },
      }),
    ]);

    const bodyProgressInYear = bodyProgressAll.filter(
      (bp) => bp.date >= yearStart && bp.date < yearEnd,
    );

    // Total workouts & volume
    const totalWorkouts = workouts.length;
    let totalVolume = 0;
    for (const w of workouts) {
      for (const we of w.workoutExercises) {
        for (const s of we.sets) {
          totalVolume += (s.weightKg ?? 0) * (s.reps ?? 0);
        }
      }
    }

    // Total running
    const totalRunningDistance = runs.reduce((s, r) => s + r.distanceKm, 0);
    const totalRunningDuration = runs.reduce((s, r) => s + r.durationMinutes, 0);

    // Average pace year
    const averagePace =
      runs.length > 0 && totalRunningDistance > 0
        ? Math.round((totalRunningDuration / totalRunningDistance) * 100) / 100
        : null;

    // Weight progress
    const entryBeforeYear = bodyProgressAll
      .filter((bp) => bp.date < yearStart)
      .pop();
    const startWeight = entryBeforeYear?.weightKg ?? bodyProgressInYear[0]?.weightKg ?? null;
    const currentWeight =
      bodyProgressInYear.length > 0
        ? bodyProgressInYear[bodyProgressInYear.length - 1].weightKg
        : profile?.currentWeightKg ?? null;
    const weightChange =
      startWeight !== null && currentWeight !== null
        ? Math.round((currentWeight - startWeight) * 10) / 10
        : null;

    // Goals
    const completedInYear = goals.filter(
      (g) => g.status === 'Completed',
    ).length;
    const totalGoals = goals.length;
    const goalCompletionRate =
      totalGoals > 0 ? Math.round((completedInYear / totalGoals) * 100) : 0;

    // Monthly breakdown for consistency
    const trackedDays = habitLogs.length;
    const completedDays = habitLogs.filter(
      (l) => l.workoutDone || l.runningDone,
    ).length;
    const yearlyConsistency =
      trackedDays > 0 ? Math.round((completedDays / trackedDays) * 100) : 0;

    // Most consistent month
    let mostConsistentMonth: { month: number; rate: number } | null = null;
    const monthlyConsistency: { month: string; rate: number }[] = [];
    for (let m = 0; m < 12; m++) {
      const ms = new Date(y, m, 1);
      const me = new Date(y, m + 1, 1);
      const logs = habitLogs.filter((l) => l.date >= ms && l.date < me);
      const daysInMonth = new Date(y, m + 1, 0).getDate();
      const done = logs.filter((l) => l.workoutDone || l.runningDone).length;
      const rate = daysInMonth > 0 ? Math.round((done / daysInMonth) * 100) : 0;
      monthlyConsistency.push({
        month: ms.toLocaleDateString('en-US', { month: 'short' }),
        rate,
      });
      if (!mostConsistentMonth || rate > mostConsistentMonth.rate) {
        mostConsistentMonth = { month: m + 1, rate };
      }
    }

    // Monthly breakdown for charts
    const monthlyBreakdown = await Promise.all(
      Array.from({ length: 12 }, async (_, i) => {
        const ms = new Date(y, i, 1);
        const me = new Date(y, i + 1, 1);
        const mWorkouts = workouts.filter((w) => w.date >= ms && w.date < me);
        const mRuns = runs.filter((r) => r.date >= ms && r.date < me);

        let mVolume = 0;
        for (const w of mWorkouts) {
          for (const we of w.workoutExercises) {
            for (const s of we.sets) {
              mVolume += (s.weightKg ?? 0) * (s.reps ?? 0);
            }
          }
        }

        return {
          month: ms.toLocaleDateString('en-US', { month: 'short' }),
          workouts: mWorkouts.length,
          volume: Math.round(mVolume),
          runningDistance: Math.round(mRuns.reduce((s, r) => s + r.distanceKm, 0) * 10) / 10,
          runningDuration: mRuns.reduce((s, r) => s + r.durationMinutes, 0),
        };
      }),
    );

    // Best achievements
    const strongestLiftMonth = await this.findStrongestLiftInRange(userId, yearStart, yearEnd);
    const longestRunMonth = await this.findLongestRunInRange(userId, yearStart, yearEnd);
    const fastestRunMonth = await this.findFastestRunInRange(userId, yearStart, yearEnd);

    const achievements: { label: string; value: string; date?: string }[] = [];

    if (strongestLiftMonth) {
      achievements.push({
        label: `Strongest Lift — ${strongestLiftMonth.exerciseName}`,
        value: `${strongestLiftMonth.weightKg} kg`,
        date: strongestLiftMonth.date?.toISOString().split('T')[0],
      });
    }
    if (longestRunMonth) {
      achievements.push({
        label: 'Longest Run',
        value: `${longestRunMonth.distanceKm.toFixed(1)} km`,
        date: longestRunMonth.date?.toISOString().split('T')[0],
      });
    }
    if (fastestRunMonth) {
      const paceMin = Math.floor(fastestRunMonth.averagePace!);
      const paceSec = Math.round((fastestRunMonth.averagePace! - paceMin) * 60);
      achievements.push({
        label: 'Fastest Run',
        value: `${paceMin}:${String(paceSec).padStart(2, '0')} /km`,
        date: fastestRunMonth.date?.toISOString().split('T')[0],
      });
    }

    // Personal records (all-time, not just year)
    const strongestLift = await this.findStrongestLift(userId);
    const longestRun = await this.findLongestRun(userId);
    const fastestRun = await this.findFastestRun(userId);

    const personalRecords: { type: string; label: string; value: string; date: string | null }[] = [];
    if (strongestLift) {
      personalRecords.push({
        type: 'strength',
        label: strongestLift.exerciseName,
        value: `${strongestLift.weightKg} kg × ${strongestLift.reps}`,
        date: strongestLift.date?.toISOString().split('T')[0] ?? null,
      });
    }
    if (longestRun) {
      personalRecords.push({
        type: 'running',
        label: 'Longest Run',
        value: `${longestRun.distanceKm.toFixed(1)} km`,
        date: longestRun.date?.toISOString().split('T')[0] ?? null,
      });
    }
    if (fastestRun) {
      const paceMin = Math.floor(fastestRun.averagePace!);
      const paceSec = Math.round((fastestRun.averagePace! - paceMin) * 60);
      personalRecords.push({
        type: 'running',
        label: 'Fastest Run',
        value: `${paceMin}:${String(paceSec).padStart(2, '0')} /km`,
        date: fastestRun.date?.toISOString().split('T')[0] ?? null,
      });
    }

    return {
      period: { year: y, label: yearLabel },
      summary: {
        totalWorkouts,
        totalVolume: Math.round(totalVolume),
        totalRunningDistance: Math.round(totalRunningDistance * 10) / 10,
        totalRunningDuration,
        averagePace,
        goalCompletionRate,
        goalsCompleted: completedInYear,
        totalGoals,
        yearlyConsistency,
        weightChange,
        startWeight,
        currentWeight,
        trackedDays,
        completedDays,
      },
      mostConsistentMonth: mostConsistentMonth
        ? {
            month: new Date(y, mostConsistentMonth.month - 1).toLocaleDateString('en-US', {
              month: 'long',
            }),
            rate: mostConsistentMonth.rate,
          }
        : null,
      monthlyBreakdown,
      monthlyConsistency,
      achievements,
      personalRecords,
    };
  }

  private async findStrongestLiftInRange(userId: string, from: Date, to: Date) {
    const set = await this.prisma.workoutSet.findFirst({
      where: {
        workoutExercise: {
          workout: { userId, date: { gte: from, lt: to } },
        },
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
    });
    if (!set) return null;
    return {
      exerciseName: set.workoutExercise.exercise.name,
      weightKg: set.weightKg,
      date: set.workoutExercise.workout.date,
    };
  }

  private async findLongestRunInRange(userId: string, from: Date, to: Date) {
    return this.prisma.runActivity.findFirst({
      where: { userId, date: { gte: from, lt: to } },
      orderBy: { distanceKm: 'desc' },
      select: { distanceKm: true, date: true },
    });
  }

  private async findFastestRunInRange(userId: string, from: Date, to: Date) {
    return this.prisma.runActivity.findFirst({
      where: { userId, averagePace: { not: null }, distanceKm: { gte: 1 }, date: { gte: from, lt: to } },
      orderBy: { averagePace: 'asc' },
      select: { averagePace: true, date: true },
    });
  }

  private async findStrongestLift(userId: string) {
    const set = await this.prisma.workoutSet.findFirst({
      where: {
        workoutExercise: { workout: { userId } },
        weightKg: { not: null },
        reps: { not: null },
      },
      orderBy: [{ weightKg: 'desc' }, { reps: 'desc' }],
      select: {
        weightKg: true,
        reps: true,
        workoutExercise: {
          select: {
            exercise: { select: { name: true } },
            workout: { select: { date: true } },
          },
        },
      },
    });

    if (!set) return null;
    return {
      exerciseName: set.workoutExercise.exercise.name,
      weightKg: set.weightKg,
      reps: set.reps,
      date: set.workoutExercise.workout.date,
    };
  }

  private async findLongestRun(userId: string) {
    const run = await this.prisma.runActivity.findFirst({
      where: { userId },
      orderBy: { distanceKm: 'desc' },
      select: { distanceKm: true, date: true },
    });
    return run;
  }

  private async findFastestRun(userId: string) {
    const run = await this.prisma.runActivity.findFirst({
      where: { userId, averagePace: { not: null }, distanceKm: { gte: 1 } },
      orderBy: { averagePace: 'asc' },
      select: { averagePace: true, date: true },
    });
    return run;
  }
}
