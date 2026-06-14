import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { QueryCalendarDto } from './dto/query-calendar.dto';
import { QueryHeatmapDto } from './dto/query-heatmap.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get()
  getMonth(
    @CurrentUser() user: { id: string },
    @Query() query: QueryCalendarDto,
  ) {
    return this.calendarService.getMonth(user.id, query);
  }

  @Get('heatmap')
  getHeatmap(
    @CurrentUser() user: { id: string },
    @Query() query: QueryHeatmapDto,
  ) {
    return this.calendarService.getHeatmap(user.id, query);
  }
}
