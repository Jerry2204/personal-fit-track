import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShoeDto } from './dto/create-shoe.dto';
import { UpdateShoeDto } from './dto/update-shoe.dto';

@Injectable()
export class ShoesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const shoes = await this.prisma.shoe.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const shoesWithMileage = await Promise.all(
      shoes.map(async (shoe) => {
        const mileage = await this.computeMileage(shoe.id);
        return {
          ...shoe,
          currentMileageKm: mileage,
        };
      }),
    );

    return shoesWithMileage;
  }

  async findOne(id: string, userId: string) {
    const shoe = await this.prisma.shoe.findFirst({
      where: { id, userId },
    });

    if (!shoe) {
      throw new NotFoundException('Shoe not found');
    }

    const currentMileageKm = await this.computeMileage(id);

    const runs = await this.prisma.runActivity.findMany({
      where: { shoeId: id },
      select: { distanceKm: true, date: true },
      orderBy: { date: 'asc' },
    });

    const monthlyGroups: Record<string, number> = {};
    for (const run of runs) {
      const key = new Date(run.date).toISOString().slice(0, 7);
      monthlyGroups[key] = (monthlyGroups[key] || 0) + run.distanceKm;
    }

    const mileageHistory = Object.entries(monthlyGroups)
      .map(([month, distance]) => ({ month, distanceKm: Math.round(distance * 100) / 100 }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      ...shoe,
      currentMileageKm,
      totalRuns: runs.length,
      mileageHistory,
    };
  }

  async create(dto: CreateShoeDto, userId: string) {
    return this.prisma.shoe.create({
      data: {
        userId,
        brand: dto.brand,
        model: dto.model,
        purchaseDate: dto.purchaseDate ? new Date(dto.purchaseDate) : undefined,
        maxMileageKm: dto.maxMileageKm,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateShoeDto) {
    const existing = await this.prisma.shoe.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Shoe not found');
    }

    return this.prisma.shoe.update({
      where: { id },
      data: {
        ...(dto.brand !== undefined && { brand: dto.brand }),
        ...(dto.model !== undefined && { model: dto.model }),
        ...(dto.purchaseDate !== undefined && {
          purchaseDate: new Date(dto.purchaseDate),
        }),
        ...(dto.maxMileageKm !== undefined && {
          maxMileageKm: dto.maxMileageKm,
        }),
      },
    });
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.shoe.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Shoe not found');
    }

    return this.prisma.shoe.delete({ where: { id } });
  }

  async retire(id: string, userId: string) {
    const existing = await this.prisma.shoe.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new NotFoundException('Shoe not found');
    }

    return this.prisma.shoe.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private async computeMileage(shoeId: string): Promise<number> {
    const result = await this.prisma.runActivity.aggregate({
      where: { shoeId },
      _sum: { distanceKm: true },
    });
    return Math.round((result._sum.distanceKm ?? 0) * 100) / 100;
  }
}
