import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBodyProgressDto } from './dto/create-body-progress.dto';
import { UpdateBodyProgressDto } from './dto/update-body-progress.dto';
import { QueryBodyProgressDto } from './dto/query-body-progress.dto';

@Injectable()
export class BodyProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBodyProgressDto, userId: string) {
    return this.prisma.bodyProgress.create({
      data: {
        userId,
        date: dto.date ? new Date(dto.date) : new Date(),
        weightKg: dto.weightKg,
        bodyFatPercent: dto.bodyFatPercent,
        waistCm: dto.waistCm,
        chestCm: dto.chestCm,
        armCm: dto.armCm,
        thighCm: dto.thighCm,
        notes: dto.notes,
      },
    });
  }

  async findAll(userId: string, query: QueryBodyProgressDto) {
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
      this.prisma.bodyProgress.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      this.prisma.bodyProgress.count({ where }),
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
    const entry = await this.prisma.bodyProgress.findFirst({
      where: { id, userId },
    });

    if (!entry) {
      throw new NotFoundException('Body progress entry not found');
    }

    return entry;
  }

  async findLatest(userId: string) {
    const latest = await this.prisma.bodyProgress.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return latest;
  }

  async update(id: string, userId: string, dto: UpdateBodyProgressDto) {
    const existing = await this.prisma.bodyProgress.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Body progress entry not found');
    }

    return this.prisma.bodyProgress.update({
      where: { id },
      data: {
        ...(dto.date !== undefined && { date: new Date(dto.date) }),
        ...(dto.weightKg !== undefined && { weightKg: dto.weightKg }),
        ...(dto.bodyFatPercent !== undefined && {
          bodyFatPercent: dto.bodyFatPercent,
        }),
        ...(dto.waistCm !== undefined && { waistCm: dto.waistCm }),
        ...(dto.chestCm !== undefined && { chestCm: dto.chestCm }),
        ...(dto.armCm !== undefined && { armCm: dto.armCm }),
        ...(dto.thighCm !== undefined && { thighCm: dto.thighCm }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.bodyProgress.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Body progress entry not found');
    }

    return this.prisma.bodyProgress.delete({ where: { id } });
  }
}
