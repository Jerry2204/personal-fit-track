import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileAvatarController } from './profile-avatar.controller';
import { ProfileService } from './profile.service';

@Module({
  controllers: [ProfileController, ProfileAvatarController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
