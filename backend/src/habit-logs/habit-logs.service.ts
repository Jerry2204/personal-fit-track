import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHabitLogDto } from './dto/create-habit-log.dto';
import { UpdateHabitLogDto } from './dto/update-habit-log.dto';
import { QueryHabitLogDto } from './dto/query-habit-log.dto';

@Injectable()
export class HabitLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateHabitLogDto, userId: string) {
    return this.prisma.habitLog.create({
      data: {
        userId,
        date: dto.date ? new Date(dto.date) : new Date(),
        waterIntakeMl: dto.waterIntakeMl,
        sleepHours: dto.sleepHours,
        steps: dto.steps,
        caloriesIntake: dto.caloriesIntake,
        proteinG: dto.proteinG,
        bodyWeightKg: dto.bodyWeightKg,
        mood: dto.mood,
        energyLevel: dto.energyLevel,
        notes: dto.notes,
      },
    });
  }

  async findAll(userId: string, query: QueryHabitLogDto) {
    const { from, to, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };

    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.gte = new Date(from);
      if (to) dateFilter.lte = new Date(to);
      where.date = dateFilter;
    }

    const [data, total] = await Promise.all([
      this.prisma.habitLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.habitLog.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string) {
    const entry = await this.prisma.habitLog.findFirst({
      where: { id, userId },
    });

    if (!entry) {
      throw new NotFoundException('Habit log entry not found');
    }

    return entry;
  }

  async findToday(userId: string) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    return this.prisma.habitLog.findFirst({
      where: { userId, date: { gte: start, lte: end } },
      orderBy: { date: 'desc' },
    });
  }

  async update(id: string, userId: string, dto: UpdateHabitLogDto) {
    const existing = await this.prisma.habitLog.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Habit log entry not found');
    }

    return this.prisma.habitLog.update({
      where: { id },
      data: {
        ...(dto.date !== undefined && { date: new Date(dto.date) }),
        ...(dto.waterIntakeMl !== undefined && { waterIntakeMl: dto.waterIntakeMl }),
        ...(dto.sleepHours !== undefined && { sleepHours: dto.sleepHours }),
        ...(dto.steps !== undefined && { steps: dto.steps }),
        ...(dto.caloriesIntake !== undefined && { caloriesIntake: dto.caloriesIntake }),
        ...(dto.proteinG !== undefined && { proteinG: dto.proteinG }),
        ...(dto.bodyWeightKg !== undefined && { bodyWeightKg: dto.bodyWeightKg }),
        ...(dto.mood !== undefined && { mood: dto.mood }),
        ...(dto.energyLevel !== undefined && { energyLevel: dto.energyLevel }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.habitLog.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Habit log entry not found');
    }

    return this.prisma.habitLog.delete({ where: { id } });
  }
}
