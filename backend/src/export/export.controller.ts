import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('export')
@UseGuards(JwtAuthGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Get('workouts/csv')
  async workoutsCsv(
    @CurrentUser() user: { id: string },
    @Res() res: Response,
  ) {
    const csv = await this.exportService.workoutsCsv(user.id);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="workouts.csv"');
    res.send(csv);
  }

  @Get('runs/csv')
  async runsCsv(
    @CurrentUser() user: { id: string },
    @Res() res: Response,
  ) {
    const csv = await this.exportService.runsCsv(user.id);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="runs.csv"');
    res.send(csv);
  }

  @Get('body-progress/csv')
  async bodyProgressCsv(
    @CurrentUser() user: { id: string },
    @Res() res: Response,
  ) {
    const csv = await this.exportService.bodyProgressCsv(user.id);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="body-progress.csv"');
    res.send(csv);
  }

  @Get('reports/monthly/csv')
  async monthlyReportCsv(
    @CurrentUser() user: { id: string },
    @Res() res: Response,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const csv = await this.exportService.monthlyReportCsv(
      user.id,
      year ? parseInt(year, 10) : undefined,
      month ? parseInt(month, 10) : undefined,
    );
    const y = year ?? String(new Date().getFullYear());
    const m = month ?? String(new Date().getMonth() + 1);
    const filename = `monthly-report-${y}-${String(parseInt(m, 10)).padStart(2, '0')}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Get('reports/yearly/csv')
  async yearlyReportCsv(
    @CurrentUser() user: { id: string },
    @Res() res: Response,
    @Query('year') year?: string,
  ) {
    const csv = await this.exportService.yearlyReportCsv(
      user.id,
      year ? parseInt(year, 10) : undefined,
    );
    const y = year ?? String(new Date().getFullYear());
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="yearly-report-${y}.csv"`);
    res.send(csv);
  }
}
