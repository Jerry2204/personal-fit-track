import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { QueryWorkoutDto } from './dto/query-workout.dto';

const workoutInclude = {
  workoutExercises: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      exercise: {
        select: {
          id: true,
          name: true,
          muscleGroup: true,
        },
      },
      sets: {
        orderBy: { setNumber: 'asc' as const },
      },
    },
  },
};

@Injectable()
export class WorkoutsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorkoutDto, userId: string) {
    return this.prisma.workout.create({
      data: {
        userId,
        date: dto.date ? new Date(dto.date) : new Date(),
        type: dto.type,
        durationMinutes: dto.durationMinutes,
        notes: dto.notes,
        workoutExercises: dto.exercises
          ? {
              create: dto.exercises.map((ex) => ({
                exerciseId: ex.exerciseId,
                sortOrder: ex.sortOrder ?? 0,
                notes: ex.notes,
                sets: ex.sets
                  ? {
                      create: ex.sets.map((s) => ({
                        setNumber: s.setNumber,
                        reps: s.reps,
                        weightKg: s.weightKg,
                        rpe: s.rpe,
                      })),
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: workoutInclude,
    });
  }

  async findAll(userId: string, query: QueryWorkoutDto) {
    const { from, to, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };

    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.gte = new Date(from);
      if (to) dateFilter.lte = new Date(to);
      where.date = dateFilter;
    }

    const [data, total] = await Promise.all([
      this.prisma.workout.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          workoutExercises: {
            include: {
              exercise: { select: { name: true } },
              sets: true,
            },
          },
        },
      }),
      this.prisma.workout.count({ where }),
    ]);

    const enriched = data.map((w) => {
      const totalVolume = w.workoutExercises.reduce((sum, we) => {
        return (
          sum +
          we.sets.reduce((s, set) => s + (set.reps ?? 0) * (set.weightKg ?? 0), 0)
        );
      }, 0);
      const exerciseCount = w.workoutExercises.length;
      const setCount = w.workoutExercises.reduce(
        (s, we) => s + we.sets.length,
        0,
      );
      const { workoutExercises, ...rest } = w;
      return { ...rest, exerciseCount, setCount, totalVolume };
    });

    return {
      data: enriched,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string) {
    const workout = await this.prisma.workout.findFirst({
      where: { id, userId },
      include: workoutInclude,
    });

    if (!workout) {
      throw new NotFoundException('Workout not found');
    }

    const totalVolume = workout.workoutExercises.reduce((sum, we) => {
      return (
        sum +
        we.sets.reduce((s, set) => s + (set.reps ?? 0) * (set.weightKg ?? 0), 0)
      );
    }, 0);

    return { ...workout, totalVolume };
  }

  async update(id: string, userId: string, dto: UpdateWorkoutDto) {
    const existing = await this.prisma.workout.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Workout not found');
    }

    if (dto.exercises) {
      await this.prisma.workoutExercise.deleteMany({
        where: { workoutId: id },
      });

      for (const ex of dto.exercises) {
        const created = await this.prisma.workoutExercise.create({
          data: {
            workoutId: id,
            exerciseId: ex.exerciseId,
            sortOrder: ex.sortOrder ?? 0,
            notes: ex.notes,
          },
        });

        if (ex.sets && ex.sets.length > 0) {
          await this.prisma.workoutSet.createMany({
            data: ex.sets.map((s) => ({
              workoutExerciseId: created.id,
              setNumber: s.setNumber,
              reps: s.reps,
              weightKg: s.weightKg,
              rpe: s.rpe,
            })),
          });
        }
      }
    }

    return this.prisma.workout.update({
      where: { id },
      data: {
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.durationMinutes !== undefined && {
          durationMinutes: dto.durationMinutes,
        }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: workoutInclude,
    });
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.workout.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Workout not found');
    }

    return this.prisma.workout.delete({ where: { id } });
  }
}
