import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HabitLogsService } from './habit-logs.service';
import { CreateHabitLogDto } from './dto/create-habit-log.dto';
import { UpdateHabitLogDto } from './dto/update-habit-log.dto';
import { QueryHabitLogDto } from './dto/query-habit-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('habit-logs')
@UseGuards(JwtAuthGuard)
export class HabitLogsController {
  constructor(private readonly habitLogsService: HabitLogsService) {}

  @Post()
  create(
    @Body() dto: CreateHabitLogDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.habitLogsService.create(dto, user.id);
  }

  @Get()
  findAll(
    @CurrentUser() user: { id: string },
    @Query() query: QueryHabitLogDto,
  ) {
    return this.habitLogsService.findAll(user.id, query);
  }

  @Get('today')
  findToday(@CurrentUser() user: { id: string }) {
    return this.habitLogsService.findToday(user.id);
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.habitLogsService.findOne(id, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHabitLogDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.habitLogsService.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.habitLogsService.remove(id, user.id);
  }
}
