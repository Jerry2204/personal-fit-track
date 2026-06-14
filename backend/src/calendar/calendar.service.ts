import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryCalendarDto } from './dto/query-calendar.dto';

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async getMonth(userId: string, query: QueryCalendarDto) {
    const { year, month } = query;

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const [workouts, runs, bodyProgress, habitLogs] = await Promise.all([
      this.prisma.workout.findMany({
        where: { userId, date: { gte: start, lte: end } },
        select: {
          id: true,
          date: true,
          type: true,
          durationMinutes: true,
        },
        orderBy: { date: 'asc' },
      }),
      this.prisma.runActivity.findMany({
        where: { userId, date: { gte: start, lte: end } },
        select: {
          id: true,
          date: true,
          distanceKm: true,
          durationMinutes: true,
          type: true,
        },
        orderBy: { date: 'asc' },
      }),
      this.prisma.bodyProgress.findMany({
        where: { userId, date: { gte: start, lte: end } },
        select: {
          id: true,
          date: true,
          weightKg: true,
          bodyFatPercent: true,
        },
        orderBy: { date: 'asc' },
      }),
      this.prisma.habitLog.findMany({
        where: { userId, date: { gte: start, lte: end } },
        select: {
          id: true,
          date: true,
          workoutDone: true,
          runningDone: true,
          steps: true,
          mood: true,
        },
        orderBy: { date: 'asc' },
      }),
    ]);

    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayOfWeek = new Date(year, month - 1, 1).getDay();

    const days: Record<string, unknown>[] = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const date = new Date(year, month - 1, d);

      const dayWorkouts = workouts.filter(
        (w) => w.date.getDate() === d && w.date.getMonth() === month - 1,
      );
      const dayRuns = runs.filter(
        (r) => r.date.getDate() === d && r.date.getMonth() === month - 1,
      );
      const dayBodyProgress = bodyProgress.filter(
        (b) => b.date.getDate() === d && b.date.getMonth() === month - 1,
      );
      const dayHabitLogs = habitLogs.filter(
        (h) => h.date.getDate() === d && h.date.getMonth() === month - 1,
      );

      days.push({
        date: dateStr,
        dayOfWeek: date.getDay(),
        workouts: dayWorkouts,
        runs: dayRuns,
        bodyProgress: dayBodyProgress,
        habitLogs: dayHabitLogs,
        hasWorkout: dayWorkouts.length > 0,
        hasRun: dayRuns.length > 0,
        hasBodyProgress: dayBodyProgress.length > 0,
        hasHabitLog: dayHabitLogs.length > 0,
        totalActivities: dayWorkouts.length + dayRuns.length + dayBodyProgress.length + dayHabitLogs.length,
      });
    }

    return {
      year,
      month,
      daysInMonth,
      firstDayOfWeek,
      days,
    };
  }
}
