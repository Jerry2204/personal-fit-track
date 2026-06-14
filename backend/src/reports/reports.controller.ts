import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { QueryMonthlyDto } from './dto/query-monthly.dto';
import { QueryYearlyDto } from './dto/query-yearly.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('monthly')
  getMonthly(
    @CurrentUser() user: { id: string },
    @Query() query: QueryMonthlyDto,
  ) {
    return this.reportsService.getMonthly(user.id, query.year, query.month);
  }

  @Get('yearly')
  getYearly(
    @CurrentUser() user: { id: string },
    @Query() query: QueryYearlyDto,
  ) {
    return this.reportsService.getYearly(user.id, query.year);
  }
}
