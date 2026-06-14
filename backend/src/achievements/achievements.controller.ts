import { Controller, Get, UseGuards } from '@nestjs/common';
import { AchievementsService, AchievementsResponse } from './achievements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('achievements')
@UseGuards(JwtAuthGuard)
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }): Promise<AchievementsResponse> {
    return this.achievementsService.findAll(user.id);
  }
}
