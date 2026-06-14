import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { QueryGoalDto } from './dto/query-goal.dto';

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateGoalDto, userId: string) {
    return this.prisma.goal.create({
      data: {
        userId,
        name: dto.name,
        type: dto.type,
        targetValue: dto.targetValue,
        currentValue: dto.currentValue ?? 0,
        unit: dto.unit,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
      },
    });
  }

  async findAll(userId: string, query: QueryGoalDto) {
    const { type, status } = query;

    const where: Record<string, unknown> = { userId };

    if (type) where.type = type;
    if (status) where.status = status;

    const data = await this.prisma.goal.findMany({
      where,
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    const enriched = data.map((goal) => {
      const progress =
        goal.targetValue > 0
          ? Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100)
          : 0;
      return { ...goal, progress };
    });

    return enriched;
  }

  async findOne(id: string, userId: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    const progress =
      goal.targetValue > 0
        ? Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100)
        : 0;

    return { ...goal, progress };
  }

  async update(id: string, userId: string, dto: UpdateGoalDto) {
    const existing = await this.prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Goal not found');
    }

    return this.prisma.goal.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.targetValue !== undefined && {
          targetValue: dto.targetValue,
        }),
        ...(dto.currentValue !== undefined && {
          currentValue: dto.currentValue,
        }),
        ...(dto.unit !== undefined && { unit: dto.unit }),
        ...(dto.deadline !== undefined && {
          deadline: dto.deadline ? new Date(dto.deadline) : null,
        }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });
  }

  async complete(id: string, userId: string) {
    const existing = await this.prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Goal not found');
    }

    return this.prisma.goal.update({
      where: { id },
      data: {
        status: 'Completed',
        currentValue: existing.targetValue,
      },
    });
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Goal not found');
    }

    return this.prisma.goal.delete({ where: { id } });
  }
}
