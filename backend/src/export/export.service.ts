import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  escape(val: unknown): string {
    const str = val === null || val === undefined ? '' : String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  async workoutsCsv(userId: string): Promise<string> {
    const workouts = await this.prisma.workout.findMany({
      where: { userId },
      include: {
        workoutExercises: {
          include: {
            exercise: true,
            sets: { orderBy: { setNumber: 'asc' } },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { date: 'desc' },
    });

    const header = 'Date,Type,Duration (min),Exercise,Muscle Group,Set#,Weight (kg),Reps,RPE,Notes';
    const rows = workouts.flatMap((w) => {
      const date = w.date.toISOString().split('T')[0];
      const type = w.type;
      const dur = w.durationMinutes ?? '';
      if (w.workoutExercises.length === 0) {
        return [[date, type, dur, '', '', '', '', '', '', this.escape(w.notes ?? '')].join(',')];
      }
      return w.workoutExercises.flatMap((we) => {
        if (we.sets.length === 0) {
          return [[date, type, dur, this.escape(we.exercise.name), we.exercise.muscleGroup, '', '', '', '', this.escape(we.notes ?? '')].join(',')];
        }
        return we.sets.map((s) =>
          [date, type, dur, this.escape(we.exercise.name), we.exercise.muscleGroup, s.setNumber, s.weightKg ?? '', s.reps ?? '', s.rpe ?? '', this.escape(we.notes ?? '')].join(','),
        );
      });
    });

    return [header, ...rows].join('\r\n');
  }

  async runsCsv(userId: string): Promise<string> {
    const runs = await this.prisma.runActivity.findMany({
      where: { userId },
      include: { shoe: { select: { brand: true, model: true } } },
      orderBy: { date: 'desc' },
    });

    const header = 'Date,Type,Distance (km),Duration (min),Avg Pace (/km),Avg HR,Calories,Shoe,Notes';
    const rows = runs.map((r) => {
      const pace =
        r.averagePace !== null
          ? `${Math.floor(r.averagePace)}:${String(Math.round((r.averagePace - Math.floor(r.averagePace)) * 60)).padStart(2, '0')}`
          : '';
      const shoe = r.shoe ? `${r.shoe.brand} ${r.shoe.model}` : '';
      return [
        r.date.toISOString().split('T')[0],
        r.type,
        r.distanceKm,
        r.durationMinutes,
        pace,
        r.heartRateAvg ?? '',
        r.caloriesEstimate ?? '',
        shoe,
        this.escape(r.notes ?? ''),
      ].join(',');
    });

    return [header, ...rows].join('\r\n');
  }

  async bodyProgressCsv(userId: string): Promise<string> {
    const entries = await this.prisma.bodyProgress.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    const header = 'Date,Weight (kg),Body Fat %,Waist (cm),Chest (cm),Arm (cm),Thigh (cm),Notes';
    const rows = entries.map((e) =>
      [
        e.date.toISOString().split('T')[0],
        e.weightKg ?? '',
        e.bodyFatPercent ?? '',
        e.waistCm ?? '',
        e.chestCm ?? '',
        e.armCm ?? '',
        e.thighCm ?? '',
        this.escape(e.notes ?? ''),
      ].join(','),
    );

    return [header, ...rows].join('\r\n');
  }

  async monthlyReportCsv(userId: string, year?: number, month?: number): Promise<string> {
    const now = new Date();
    const y = year ?? now.getFullYear();
    const m = month ?? now.getMonth() + 1;

    const monthStart = new Date(y, m - 1, 1);
    const monthEnd = new Date(y, m, 1);

    const [workouts, runs, bodyProgress] = await Promise.all([
      this.prisma.workout.findMany({
        where: { userId, date: { gte: monthStart, lt: monthEnd } },
        select: { date: true },
      }),
      this.prisma.runActivity.findMany({
        where: { userId, date: { gte: monthStart, lt: monthEnd } },
        select: { date: true },
      }),
      this.prisma.bodyProgress.findMany({
        where: { userId, date: { gte: monthStart, lt: monthEnd } },
        select: { date: true, weightKg: true },
      }),
    ]);

    const workoutDates = new Set(workouts.map((w) => w.date.toISOString().split('T')[0]));
    const runDates = new Set(runs.map((r) => r.date.toISOString().split('T')[0]));
    const weightByDate = new Map(bodyProgress.map((b) => [b.date.toISOString().split('T')[0], b.weightKg]));

    const daysInMonth = new Date(y, m, 0).getDate();
    const header = 'Day,Workouts,Run,Weight (kg)';
    const rows = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return [
        dateStr,
        workoutDates.has(dateStr) ? '1' : '0',
        runDates.has(dateStr) ? 'Yes' : 'No',
        weightByDate.get(dateStr) ?? '',
      ].join(',');
    });

    return [header, ...rows].join('\r\n');
  }

  async yearlyReportCsv(userId: string, year?: number): Promise<string> {
    const now = new Date();
    const y = year ?? now.getFullYear();

    const yearStart = new Date(y, 0, 1);
    const yearEnd = new Date(y + 1, 0, 1);

    const [workouts, runs] = await Promise.all([
      this.prisma.workout.findMany({
        where: { userId, date: { gte: yearStart, lt: yearEnd } },
        include: {
          workoutExercises: {
            include: {
              sets: { select: { weightKg: true, reps: true } },
            },
          },
        },
      }),
      this.prisma.runActivity.findMany({
        where: { userId, date: { gte: yearStart, lt: yearEnd } },
        select: { date: true, distanceKm: true, durationMinutes: true },
      }),
    ]);

    const monthlyData: Record<string, { workouts: number; volume: number; runningDistance: number; runningDuration: number; runDays: Set<string> }> = {};

    for (const w of workouts) {
      const key = `${y}-${String(w.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[key]) monthlyData[key] = { workouts: 0, volume: 0, runningDistance: 0, runningDuration: 0, runDays: new Set() };
      monthlyData[key].workouts++;
      let vol = 0;
      for (const we of w.workoutExercises) {
        for (const s of we.sets) {
          vol += (s.weightKg ?? 0) * (s.reps ?? 0);
        }
      }
      monthlyData[key].volume += vol;
    }

    for (const r of runs) {
      const key = `${y}-${String(r.date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[key]) monthlyData[key] = { workouts: 0, volume: 0, runningDistance: 0, runningDuration: 0, runDays: new Set() };
      monthlyData[key].runningDistance += r.distanceKm;
      monthlyData[key].runningDuration += r.durationMinutes;
      monthlyData[key].runDays.add(r.date.toISOString().split('T')[0]);
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const header = 'Month,Workouts,Volume (kg),Running Distance (km),Running Duration (min),Run Days';

    const rows = monthNames.map((name, i) => {
      const key = `${y}-${String(i + 1).padStart(2, '0')}`;
      const d = monthlyData[key] || { workouts: 0, volume: 0, runningDistance: 0, runningDuration: 0, runDays: new Set() };
      return [name, d.workouts, Math.round(d.volume), d.runningDistance.toFixed(1), d.runningDuration, d.runDays.size].join(',');
    });

    return [header, ...rows].join('\r\n');
  }
}
