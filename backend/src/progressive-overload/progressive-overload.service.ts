import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ExerciseProgression {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  bestSet: {
    weightKg: number;
    reps: number;
    estimatedOneRm: number;
    date: string;
  } | null;
  lastUsed: {
    weightKg: number | null;
    reps: number | null;
    date: string;
  } | null;
  previousBestSet: {
    weightKg: number;
    reps: number;
    estimatedOneRm: number;
    date: string;
  } | null;
  volumeProgression: Array<{
    date: string;
    volume: number;
  }>;
  monthlyStrength: Array<{
    month: string;
    bestWeight: number;
    bestReps: number;
    estimatedOneRm: number;
  }>;
}

@Injectable()
export class ProgressiveOverloadService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<ExerciseProgression[]> {
    const workouts = await this.prisma.workout.findMany({
      where: { userId },
      select: {
        id: true,
        date: true,
        workoutExercises: {
          select: {
            exercise: {
              select: { id: true, name: true, muscleGroup: true },
            },
            sets: {
              select: { weightKg: true, reps: true, createdAt: true },
              orderBy: { setNumber: 'asc' },
            },
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    const exerciseMap = new Map<string, ExerciseProgression>();

    for (const workout of workouts) {
      for (const we of workout.workoutExercises) {
        const exId = we.exercise.id;
        if (!exerciseMap.has(exId)) {
          exerciseMap.set(exId, {
            exerciseId: exId,
            exerciseName: we.exercise.name,
            muscleGroup: we.exercise.muscleGroup,
            bestSet: null,
            lastUsed: null,
            previousBestSet: null,
            volumeProgression: [],
            monthlyStrength: [],
          });
        }

        const entry = exerciseMap.get(exId)!;

        let workoutVolume = 0;
        let setBest: { weightKg: number; reps: number; estimatedOneRm: number } | null = null;

        for (const set of we.sets) {
          if (set.weightKg && set.reps) {
            const volume = set.weightKg * set.reps;
            workoutVolume += volume;
            const e1rm = set.weightKg * (1 + set.reps / 30);

            if (
              !setBest ||
              e1rm > setBest.estimatedOneRm ||
              (e1rm === setBest.estimatedOneRm && volume > setBest.weightKg * setBest.reps)
            ) {
              setBest = { weightKg: set.weightKg, reps: set.reps, estimatedOneRm: Math.round(e1rm * 10) / 10 };
            }
          }
        }

        if (workoutVolume > 0) {
          entry.volumeProgression.push({
            date: workout.date.toISOString().split('T')[0],
            volume: Math.round(workoutVolume * 10) / 10,
          });
        }

        if (setBest) {
          const dateStr = workout.date.toISOString().split('T')[0];

          if (
            !entry.bestSet ||
            setBest.estimatedOneRm > entry.bestSet.estimatedOneRm ||
            (setBest.estimatedOneRm === entry.bestSet.estimatedOneRm && setBest.weightKg > entry.bestSet.weightKg)
          ) {
            entry.previousBestSet = entry.bestSet
              ? { ...entry.bestSet }
              : null;
            entry.bestSet = { ...setBest, date: dateStr };
          } else if (
            !entry.previousBestSet ||
            setBest.estimatedOneRm > entry.previousBestSet.estimatedOneRm
          ) {
            entry.previousBestSet = { ...setBest, date: dateStr };
          }

          const monthKey = dateStr.substring(0, 7);
          const existingMonth = entry.monthlyStrength.find((m) => m.month === monthKey);
          if (existingMonth) {
            if (setBest.estimatedOneRm > existingMonth.estimatedOneRm) {
              existingMonth.bestWeight = setBest.weightKg;
              existingMonth.bestReps = setBest.reps;
              existingMonth.estimatedOneRm = setBest.estimatedOneRm;
            }
          } else {
            entry.monthlyStrength.push({
              month: monthKey,
              bestWeight: setBest.weightKg,
              bestReps: setBest.reps,
              estimatedOneRm: setBest.estimatedOneRm,
            });
          }
        }

        entry.lastUsed = {
          weightKg: setBest?.weightKg ?? null,
          reps: setBest?.reps ?? null,
          date: workout.date.toISOString().split('T')[0],
        };
      }
    }

    return Array.from(exerciseMap.values()).sort((a, b) => {
      const aRm = a.bestSet?.estimatedOneRm ?? 0;
      const bRm = b.bestSet?.estimatedOneRm ?? 0;
      return bRm - aRm;
    });
  }
}
