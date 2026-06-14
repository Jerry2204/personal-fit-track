import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QueryCalendarDto } from './dto/query-calendar.dto';
import { QueryHeatmapDto } from './dto/query-heatmap.dto';

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

  async getHeatmap(userId: string, query: QueryHeatmapDto) {
    const rawTo = query.to ? new Date(query.to) : new Date();
    const rawFrom = new Date(rawTo);
    rawFrom.setMonth(rawFrom.getMonth() - 11);
    rawFrom.setDate(1);

    const start = new Date(rawFrom);
    start.setHours(0, 0, 0, 0);
    const end = new Date(rawTo);
    end.setHours(23, 59, 59, 999);

    const [workouts, runs, bodyProgress, habitLogs] = await Promise.all([
      this.prisma.workout.findMany({
        where: { userId, date: { gte: start, lte: end } },
        select: { id: true, date: true },
      }),
      this.prisma.runActivity.findMany({
        where: { userId, date: { gte: start, lte: end } },
        select: { id: true, date: true },
      }),
      this.prisma.bodyProgress.findMany({
        where: { userId, date: { gte: start, lte: end } },
        select: { id: true, date: true },
      }),
      this.prisma.habitLog.findMany({
        where: { userId, date: { gte: start, lte: end } },
        select: { id: true, date: true },
      }),
    ]);

    const dayKey = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const countMap = new Map<string, { count: number; workoutCount: number; runCount: number; bodyProgressCount: number; habitCount: number }>();

    for (const w of workouts) {
      const key = dayKey(w.date);
      const entry = countMap.get(key) || { count: 0, workoutCount: 0, runCount: 0, bodyProgressCount: 0, habitCount: 0 };
      entry.count++;
      entry.workoutCount++;
      countMap.set(key, entry);
    }
    for (const r of runs) {
      const key = dayKey(r.date);
      const entry = countMap.get(key) || { count: 0, workoutCount: 0, runCount: 0, bodyProgressCount: 0, habitCount: 0 };
      entry.count++;
      entry.runCount++;
      countMap.set(key, entry);
    }
    for (const b of bodyProgress) {
      const key = dayKey(b.date);
      const entry = countMap.get(key) || { count: 0, workoutCount: 0, runCount: 0, bodyProgressCount: 0, habitCount: 0 };
      entry.count++;
      entry.bodyProgressCount++;
      countMap.set(key, entry);
    }
    for (const h of habitLogs) {
      const key = dayKey(h.date);
      const entry = countMap.get(key) || { count: 0, workoutCount: 0, runCount: 0, bodyProgressCount: 0, habitCount: 0 };
      entry.count++;
      entry.habitCount++;
      countMap.set(key, entry);
    }

    const gridStart = new Date(start);
    gridStart.setDate(start.getDate() - start.getDay());

    const gridEnd = new Date(end);
    gridEnd.setDate(end.getDate() + (6 - end.getDay()));

    const weeks: Array<Array<{ date: string; count: number; workoutCount: number; runCount: number; bodyProgressCount: number; habitCount: number }>> = [];
    let cursor = new Date(gridStart);

    while (cursor <= gridEnd) {
      const week: Array<{ date: string; count: number; workoutCount: number; runCount: number; bodyProgressCount: number; habitCount: number }> = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(cursor);
        const key = dayKey(date);
        const dayCounts = countMap.get(key) || { count: 0, workoutCount: 0, runCount: 0, bodyProgressCount: 0, habitCount: 0 };
        week.push({
          date: key,
          ...dayCounts,
        });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
    }

    const monthLabels: Array<{ label: string; weekIndex: number }> = [];
    let seenMonths = new Set<string>();
    for (let wi = 0; wi < weeks.length; wi++) {
      const midDay = new Date(weeks[wi][3]?.date + 'T00:00:00');
      const monthKey = `${midDay.getFullYear()}-${midDay.getMonth()}`;
      if (!seenMonths.has(monthKey)) {
        seenMonths.add(monthKey);
        const label = midDay.toLocaleDateString('en-US', { month: 'short' });
        monthLabels.push({ label, weekIndex: wi });
      }
    }

    const totalDays = weeks.reduce((s, w) => s + w.length, 0);

    return {
      from: dayKey(start),
      to: dayKey(end),
      weeks,
      monthLabels,
      totalDays,
    };
  }
}
