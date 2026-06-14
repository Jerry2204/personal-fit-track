import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';
import { UpdateActivityStatusDto } from './dto/update-plan-day-status.dto';

const activityInclude = {
  workout: {
    select: { id: true, date: true, type: true, durationMinutes: true },
  },
  run: {
    select: { id: true, date: true, type: true, distanceKm: true, durationMinutes: true, averagePace: true },
  },
};

const planInclude = {
  days: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      activities: {
        orderBy: { sortOrder: 'asc' as const },
        include: activityInclude,
      },
    },
  },
};

@Injectable()
export class WorkoutPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateWorkoutPlanDto, userId: string) {
    return this.prisma.workoutPlan.create({
      data: {
        userId,
        name: dto.name,
        startDate: new Date(dto.startDate),
        days: dto.days
          ? {
              create: dto.days.map((day) => ({
                dayOfWeek: day.dayOfWeek,
                name: day.name,
                notes: day.notes,
                sortOrder: day.sortOrder ?? day.dayOfWeek,
                activities: day.activities
                  ? {
                      create: day.activities.map((act) => ({
                        activityType: act.activityType,
                        name: act.name,
                        workoutType: act.activityType === 'Workout' ? (act.workoutType ?? undefined) : undefined,
                        runType: act.activityType === 'Run' ? (act.runType ?? undefined) : undefined,
                        targetDistanceKm: act.targetDistanceKm,
                        targetDurationMinutes: act.targetDurationMinutes,
                        targetPace: act.targetPace,
                        notes: act.notes,
                        sortOrder: act.sortOrder ?? 0,
                      })),
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: planInclude,
    });
  }

  async findAll(userId: string) {
    const plans = await this.prisma.workoutPlan.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
      include: {
        days: {
          orderBy: { sortOrder: 'asc' },
          include: {
            activities: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });

    const enriched = plans.map((plan) => {
      const allActivities = plan.days.flatMap((d) => d.activities);
      const totalActivities = allActivities.length;
      const completedActivities = allActivities.filter((a) => a.status === 'Completed').length;
      const skippedActivities = allActivities.filter((a) => a.status === 'Skipped').length;
      const progress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

      return { ...plan, totalActivities, completedActivities, skippedActivities, progress };
    });

    return enriched;
  }

  async findOne(id: string, userId: string) {
    const plan = await this.prisma.workoutPlan.findFirst({
      where: { id, userId },
      include: planInclude,
    });

    if (!plan) {
      throw new NotFoundException('Workout plan not found');
    }

    const allActivities = plan.days.flatMap((d) => d.activities);
    const totalActivities = allActivities.length;
    const completedActivities = allActivities.filter((a) => a.status === 'Completed').length;
    const skippedActivities = allActivities.filter((a) => a.status === 'Skipped').length;
    const progress = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

    return { ...plan, totalActivities, completedActivities, skippedActivities, progress };
  }

  async update(id: string, userId: string, dto: UpdateWorkoutPlanDto) {
    const existing = await this.prisma.workoutPlan.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Workout plan not found');
    }

    if (dto.days) {
      await this.prisma.workoutPlanDay.deleteMany({
        where: { workoutPlanId: id },
      });

      for (const day of dto.days) {
        await this.prisma.workoutPlanDay.create({
          data: {
            workoutPlanId: id,
            dayOfWeek: day.dayOfWeek!,
            name: day.name,
            notes: day.notes,
            sortOrder: day.sortOrder ?? day.dayOfWeek!,
            activities: day.activities
              ? {
                  create: day.activities.map((act) => ({
                    activityType: act.activityType!,
                    name: act.name,
                    workoutType: act.activityType === 'Workout' ? (act.workoutType ?? undefined) : undefined,
                    runType: act.activityType === 'Run' ? (act.runType ?? undefined) : undefined,
                    targetDistanceKm: act.targetDistanceKm,
                    targetDurationMinutes: act.targetDurationMinutes,
                    targetPace: act.targetPace,
                    notes: act.notes,
                    sortOrder: act.sortOrder ?? 0,
                  })),
                }
              : undefined,
          },
        });
      }
    }

    return this.prisma.workoutPlan.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.startDate && { startDate: new Date(dto.startDate) }),
      },
      include: planInclude,
    });
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.workoutPlan.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Workout plan not found');
    }

    return this.prisma.workoutPlan.delete({ where: { id } });
  }

  async updateActivityStatus(planId: string, activityId: string, userId: string, dto: UpdateActivityStatusDto) {
    const plan = await this.prisma.workoutPlan.findFirst({
      where: { id: planId, userId },
    });

    if (!plan) {
      throw new NotFoundException('Workout plan not found');
    }

    const activity = await this.prisma.workoutPlanDayActivity.findFirst({
      where: { id: activityId },
      include: { workoutPlanDay: true },
    });

    if (!activity || activity.workoutPlanDay.workoutPlanId !== planId) {
      throw new NotFoundException('Plan activity not found');
    }

    return this.prisma.workoutPlanDayActivity.update({
      where: { id: activityId },
      data: {
        ...(dto.status && { status: dto.status }),
        ...(dto.completedDate !== undefined && { completedDate: dto.completedDate ? new Date(dto.completedDate) : null }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.workoutId !== undefined && { workoutId: dto.workoutId ?? null }),
        ...(dto.runId !== undefined && { runId: dto.runId ?? null }),
        ...(dto.targetDistanceKm !== undefined && { targetDistanceKm: dto.targetDistanceKm }),
        ...(dto.targetDurationMinutes !== undefined && { targetDurationMinutes: dto.targetDurationMinutes }),
      },
      include: activityInclude,
    });
  }
}
