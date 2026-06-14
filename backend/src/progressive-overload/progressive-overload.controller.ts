import { Controller, Get, UseGuards } from '@nestjs/common';
import { ProgressiveOverloadService } from './progressive-overload.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('progressive-overload')
@UseGuards(JwtAuthGuard)
export class ProgressiveOverloadController {
  constructor(private readonly service: ProgressiveOverloadService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.service.findAll(user.id);
  }
}
