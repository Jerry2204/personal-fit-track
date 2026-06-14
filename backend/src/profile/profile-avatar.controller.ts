import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

const AVATAR_DIR = join(process.cwd(), 'uploads', 'avatars');
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileAvatarController {
  constructor(private readonly profileService: ProfileService) {}

  @Post('avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: AVATAR_DIR,
        filename: (_req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `temp-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: (_req, file, callback) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
        if (!allowedMimes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Invalid file type. Allowed: JPEG, PNG, WebP, AVIF',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: { id: string },
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const avatarUrl = await this.profileService.processAndSaveAvatar(
      user.id,
      file.path,
    );

    return { avatarUrl };
  }
}
