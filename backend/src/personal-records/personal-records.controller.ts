import { Controller, Get, UseGuards } from '@nestjs/common';
import { PersonalRecordsService } from './personal-records.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('personal-records')
@UseGuards(JwtAuthGuard)
export class PersonalRecordsController {
  constructor(private readonly personalRecordsService: PersonalRecordsService) {}

  @Get()
  findAll(@CurrentUser() user: { id: string }) {
    return this.personalRecordsService.findAll(user.id);
  }
}
