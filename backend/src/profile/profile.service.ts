import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { join, extname } from 'path';
import { unlink } from 'fs/promises';

const AVATAR_DIR = join(process.cwd(), 'uploads', 'avatars');

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      profile: user.profile || null,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = await this.prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        ...dto,
      },
      update: dto,
    });

    return profile;
  }

  async processAndSaveAvatar(userId: string, tempPath: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    try {
      const sharpMod = (await import('sharp')).default;
      const ext = extname(tempPath) || '.jpg';
      const filename = `avatar-${userId}-${Date.now()}${ext}`;
      const outputPath = join(AVATAR_DIR, filename);

      await sharpMod(tempPath)
        .resize(200, 200, { fit: 'cover', position: 'centre' })
        .toFile(outputPath);

      await unlink(tempPath).catch(() => {});

      const oldProfile = user.profile;
      if (oldProfile?.avatarUrl) {
        const oldPath = join(AVATAR_DIR, oldProfile.avatarUrl.replace('/uploads/avatars/', ''));
        await unlink(oldPath).catch(() => {});
      }

      const avatarUrl = `/uploads/avatars/${filename}`;

      await this.prisma.profile.upsert({
        where: { userId },
        create: { userId, avatarUrl },
        update: { avatarUrl },
      });

      return avatarUrl;
    } catch (err) {
      await unlink(tempPath).catch(() => {});
      throw new InternalServerErrorException(
        err instanceof Error ? err.message : 'Failed to process image',
      );
    }
  }
}
