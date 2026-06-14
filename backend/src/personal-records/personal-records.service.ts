import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PersonalRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const [strongestLift, longestRun, fastestRun, highestVolume, highestWeeklyMileage] =
      await Promise.all([
        this.getStrongestLift(userId),
        this.getLongestRun(userId),
        this.getFastestRun(userId),
        this.getHighestWorkoutVolume(userId),
        this.getHighestWeeklyMileage(userId),
      ]);

    return {
      strongestLift,
      longestRun,
      fastestRun,
      highestVolume,
      highestWeeklyMileage,
    };
  }

  private async getStrongestLift(userId: string) {
    const sets = await this.prisma.workoutSet.findMany({
      where: {
        workoutExercise: {
          workout: { userId },
        },
        weightKg: { not: null },
        reps: { not: null },
      },
      select: {
        weightKg: true,
        reps: true,
        setNumber: true,
        workoutExercise: {
          select: {
            exercise: { select: { name: true, muscleGroup: true } },
            workout: { select: { date: true } },
          },
        },
      },
      orderBy: [{ weightKg: 'desc' }, { reps: 'desc' }],
      take: 1,
    });

    if (sets.length === 0) return null;

    const s = sets[0];
    const volume = (s.weightKg ?? 0) * (s.reps ?? 0);

    return {
      type: 'strongest_lift' as const,
      value: `${s.weightKg} kg × ${s.reps} reps`,
      metric: volume,
      displayValue: `${s.weightKg}kg × ${s.reps}`,
      exerciseName: s.workoutExercise.exercise.name,
      muscleGroup: s.workoutExercise.exercise.muscleGroup,
      date: s.workoutExercise.workout.date,
      unit: 'kg',
    };
  }

  private async getLongestRun(userId: string) {
    const run = await this.prisma.runActivity.findFirst({
      where: { userId },
      orderBy: { distanceKm: 'desc' },
      select: {
        distanceKm: true,
        durationMinutes: true,
        date: true,
        type: true,
      },
    });

    if (!run) return null;

    return {
      type: 'longest_run' as const,
      value: `${run.distanceKm.toFixed(1)} km`,
      metric: run.distanceKm,
      displayValue: `${run.distanceKm.toFixed(1)}km`,
      durationMinutes: run.durationMinutes,
      date: run.date,
      runType: run.type,
      unit: 'km',
    };
  }

  private async getFastestRun(userId: string) {
    const run = await this.prisma.runActivity.findFirst({
      where: {
        userId,
        averagePace: { not: null },
        distanceKm: { gte: 1 },
      },
      orderBy: { averagePace: 'asc' },
      select: {
        distanceKm: true,
        averagePace: true,
        date: true,
        type: true,
        durationMinutes: true,
      },
    });

    if (!run || !run.averagePace) return null;

    const paceMin = Math.floor(run.averagePace);
    const paceSec = Math.round((run.averagePace - paceMin) * 60);

    return {
      type: 'fastest_run' as const,
      value: `${paceMin}:${String(paceSec).padStart(2, '0')} /km`,
      metric: run.averagePace,
      displayValue: `${paceMin}:${String(paceSec).padStart(2, '0')}`,
      distanceKm: run.distanceKm,
      date: run.date,
      runType: run.type,
      unit: '/km',
    };
  }

  private async getHighestWorkoutVolume(userId: string) {
    const workouts = await this.prisma.workout.findMany({
      where: { userId },
      select: {
        id: true,
        date: true,
        type: true,
        workoutExercises: {
          select: {
            sets: {
              select: { weightKg: true, reps: true },
            },
          },
        },
      },
    });

    if (workouts.length === 0) return null;

    let bestWorkout: (typeof workouts)[0] | null = null;
    let bestVolume = 0;

    for (const w of workouts) {
      let volume = 0;
      for (const we of w.workoutExercises) {
        for (const s of we.sets) {
          volume += (s.weightKg ?? 0) * (s.reps ?? 0);
        }
      }
      if (volume > bestVolume) {
        bestVolume = volume;
        bestWorkout = w;
      }
    }

    if (!bestWorkout) return null;

    return {
      type: 'highest_volume' as const,
      value: `${bestVolume.toLocaleString()} kg`,
      metric: bestVolume,
      displayValue: `${bestVolume.toLocaleString()}kg`,
      date: bestWorkout.date,
      workoutType: bestWorkout.type,
      unit: 'kg',
    };
  }

  private async getHighestWeeklyMileage(userId: string) {
    const runs = await this.prisma.runActivity.findMany({
      where: { userId },
      select: { distanceKm: true, date: true },
      orderBy: { date: 'asc' },
    });

    if (runs.length === 0) return null;

    const weekMap = new Map<string, { total: number; dates: Date[] }>();

    for (const r of runs) {
      const d = new Date(r.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().split('T')[0];

      const entry = weekMap.get(key) || { total: 0, dates: [] };
      entry.total += r.distanceKm;
      entry.dates.push(r.date);
      weekMap.set(key, entry);
    }

    let bestWeek: string | null = null;
    let bestMileage = 0;

    for (const [key, entry] of weekMap) {
      if (entry.total > bestMileage) {
        bestMileage = entry.total;
        bestWeek = key;
      }
    }

    if (!bestWeek) return null;

    const weekEntry = weekMap.get(bestWeek)!;
    const weekStart = new Date(bestWeek + 'T00:00:00');

    return {
      type: 'highest_weekly_mileage' as const,
      value: `${bestMileage.toFixed(1)} km`,
      metric: bestMileage,
      displayValue: `${bestMileage.toFixed(1)}km`,
      weekOf: bestWeek,
      runCount: weekEntry.dates.length,
      unit: 'km',
    };
  }
}
