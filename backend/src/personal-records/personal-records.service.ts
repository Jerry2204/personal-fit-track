import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PersonalRecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const [
      strongestLift,
      longestRun,
      fastestRun,
      highestVolume,
      highestWeeklyMileage,
      best1K,
      best5K,
      best10K,
      bestHM,
      bestFM,
    ] = await Promise.all([
      this.getStrongestLift(userId),
      this.getLongestRun(userId),
      this.getFastestRun(userId),
      this.getHighestWorkoutVolume(userId),
      this.getHighestWeeklyMileage(userId),
      this.getBestRaceEstimate(userId, 1, '1 km', 'best_1k', 0.3),
      this.getBestRaceEstimate(userId, 5, '5 km', 'best_5k'),
      this.getBestRaceEstimate(userId, 10, '10 km', 'best_10k'),
      this.getBestRaceEstimate(userId, 21.1, 'Half Marathon', 'best_hm'),
      this.getBestRaceEstimate(userId, 42.2, 'Full Marathon', 'best_fm'),
    ]);

    return {
      strongestLift,
      longestRun,
      fastestRun,
      highestVolume,
      highestWeeklyMileage,
      best1K,
      best5K,
      best10K,
      bestHM,
      bestFM,
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

  private async getBestRaceEstimate(
    userId: string,
    targetDistanceKm: number,
    label: string,
    typeKey: string,
    tolerance: number = 0.1,
  ) {
    const runs = await this.prisma.runActivity.findMany({
      where: { userId },
      select: { distanceKm: true, durationMinutes: true, averagePace: true, date: true, type: true },
      orderBy: { date: 'asc' },
    });

    if (runs.length === 0) return null;

    let bestTimeMinutes: number | null = null;
    let bestRun: (typeof runs)[0] | null = null;
    let isEstimated = false;

    // 1. Check runs within tolerance of target distance (actual or close-to-actual)
    const minDist = targetDistanceKm * (1 - tolerance);
    const maxDist = targetDistanceKm * (1 + tolerance);
    const closeRuns = runs.filter((r) => r.distanceKm >= minDist && r.distanceKm <= maxDist);

    for (const run of closeRuns) {
      const estimatedTime = (run.durationMinutes / run.distanceKm) * targetDistanceKm;
      if (bestTimeMinutes === null || estimatedTime < bestTimeMinutes) {
        bestTimeMinutes = estimatedTime;
        bestRun = run;
        isEstimated = Math.abs(run.distanceKm - targetDistanceKm) > 0.01;
      }
    }

    // 2. Check runs that exceed the target distance — extrapolate from those
    const longerRuns = runs.filter((r) => r.distanceKm > targetDistanceKm * 1.1);
    for (const run of longerRuns) {
      const estimatedTime = (run.durationMinutes / run.distanceKm) * targetDistanceKm;
      if (bestTimeMinutes === null || estimatedTime < bestTimeMinutes) {
        bestTimeMinutes = estimatedTime;
        bestRun = run;
        isEstimated = true;
      }
    }

    if (bestTimeMinutes === null || !bestRun) return null;

    return this.formatRaceRecord(bestTimeMinutes, bestRun, targetDistanceKm, label, typeKey, isEstimated);
  }

  private formatRaceRecord(
    bestTimeMinutes: number,
    run: { distanceKm: number; durationMinutes: number; date: Date; type: string },
    targetDistanceKm: number,
    label: string,
    typeKey: string,
    isEstimated: boolean,
  ) {
    const totalSeconds = Math.round(bestTimeMinutes * 60);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    let displayValue: string;
    if (hrs > 0) {
      displayValue = `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    } else {
      displayValue = `${mins}:${String(secs).padStart(2, '0')}`;
    }

    const actualDistKm = run.distanceKm;
    const runPace = run.durationMinutes / run.distanceKm;
    const paceMin = Math.floor(runPace);
    const paceSec = Math.round((runPace - paceMin) * 60);
    const paceStr = `${paceMin}:${String(paceSec).padStart(2, '0')} /km`;

    return {
      type: typeKey,
      value: `${displayValue}${isEstimated ? '*' : ''}`,
      metric: bestTimeMinutes,
      displayValue,
      label,
      targetDistanceKm,
      actualDistanceKm: Math.round(actualDistKm * 100) / 100,
      formattedPace: paceStr,
      date: run.date,
      runType: run.type,
      isEstimated,
      unit: 'time',
    };
  }

  private async getBestRunForDistance(
    userId: string,
    distanceKm: number,
    label: string,
    typeKey: string,
  ) {
    // returns the best average pace formatted as time for the given distance
    // uses runs that are at least half the target distance to estimate
    const runs = await this.prisma.runActivity.findMany({
      where: {
        userId,
        averagePace: { not: null },
        distanceKm: { gte: Math.max(1, distanceKm * 0.5) },
      },
      select: { distanceKm: true, durationMinutes: true, averagePace: true, date: true, type: true },
      orderBy: { averagePace: 'asc' },
      take: 1,
    });

    if (runs.length === 0) return null;

    const bestRun = runs[0];
    if (bestRun.averagePace === null) return null;
    const estimatedTimeMinutes = bestRun.averagePace * distanceKm;

    return this.formatRaceRecord(estimatedTimeMinutes, bestRun, distanceKm, label, typeKey, true);
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
