import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRunDto } from './dto/create-run.dto';
import { UpdateRunDto } from './dto/update-run.dto';
import { QueryRunDto } from './dto/query-run.dto';

function calcAveragePace(distanceKm: number, durationMinutes: number): number | undefined {
  if (distanceKm > 0 && durationMinutes > 0) {
    return Math.round((durationMinutes / distanceKm) * 100) / 100;
  }
  return undefined;
}

@Injectable()
export class RunsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRunDto, userId: string) {
    const averagePace = calcAveragePace(dto.distanceKm, dto.durationMinutes);

    return this.prisma.runActivity.create({
      data: {
        userId,
        date: dto.date ? new Date(dto.date) : new Date(),
        distanceKm: dto.distanceKm,
        durationMinutes: dto.durationMinutes,
        averagePace,
        type: dto.type ?? 'EasyRun',
        shoeId: dto.shoeId,
        heartRateAvg: dto.heartRateAvg,
        caloriesEstimate: dto.caloriesEstimate,
        notes: dto.notes,
      },
    });
  }

  async findAll(userId: string, query: QueryRunDto) {
    const { type, from, to, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId };

    if (type) {
      where.type = type;
    }

    if (from || to) {
      const dateFilter: Record<string, Date> = {};
      if (from) dateFilter.gte = new Date(from);
      if (to) dateFilter.lte = new Date(to);
      where.date = dateFilter;
    }

    const [data, total] = await Promise.all([
      this.prisma.runActivity.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          shoe: {
            select: { id: true, brand: true, model: true },
          },
        },
      }),
      this.prisma.runActivity.count({ where }),
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
    const run = await this.prisma.runActivity.findFirst({
      where: { id, userId },
      include: {
        shoe: {
          select: { id: true, brand: true, model: true },
        },
      },
    });

    if (!run) {
      throw new NotFoundException('Run not found');
    }

    return run;
  }

  async update(id: string, userId: string, dto: UpdateRunDto) {
    const existing = await this.prisma.runActivity.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Run not found');
    }

    const distanceKm = dto.distanceKm ?? existing.distanceKm;
    const durationMinutes = dto.durationMinutes ?? existing.durationMinutes;
    const averagePace = calcAveragePace(distanceKm, durationMinutes);

    return this.prisma.runActivity.update({
      where: { id },
      data: {
        ...(dto.date !== undefined && { date: new Date(dto.date) }),
        ...(dto.distanceKm !== undefined && { distanceKm: dto.distanceKm }),
        ...(dto.durationMinutes !== undefined && {
          durationMinutes: dto.durationMinutes,
        }),
        averagePace,
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.shoeId !== undefined && { shoeId: dto.shoeId }),
        ...(dto.heartRateAvg !== undefined && {
          heartRateAvg: dto.heartRateAvg,
        }),
        ...(dto.caloriesEstimate !== undefined && {
          caloriesEstimate: dto.caloriesEstimate,
        }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: {
        shoe: {
          select: { id: true, brand: true, model: true },
        },
      },
    });
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.runActivity.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Run not found');
    }

    return this.prisma.runActivity.delete({ where: { id } });
  }
}
