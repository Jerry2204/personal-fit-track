import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  category: 'streak' | 'workout' | 'running' | 'consistency' | 'goals';
  icon: string;
  target: number;
}

export interface AchievementResult extends AchievementDef {
  unlocked: boolean;
  progress: number;
  current: number;
}

export interface AchievementsResponse {
  achievements: AchievementResult[];
  summary: {
    total: number;
    unlocked: number;
    rank: string;
    streak: number;
  };
}

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: 'first-step', title: 'First Step', description: 'Log your first activity', category: 'streak', icon: 'Flame', target: 1 },
  { id: 'on-a-roll', title: 'On a Roll', description: 'Maintain a 7-day streak', category: 'streak', icon: 'Flame', target: 7 },
  { id: 'unstoppable', title: 'Unstoppable', description: 'Reach a 14-day streak', category: 'streak', icon: 'Flame', target: 14 },
  { id: 'consistency-king', title: 'Consistency King', description: 'Achieve a 30-day streak', category: 'streak', icon: 'Flame', target: 30 },
  { id: 'first-session', title: 'First Session', description: 'Complete your first workout', category: 'workout', icon: 'Dumbbell', target: 1 },
  { id: 'getting-started', title: 'Getting Started', description: 'Complete 10 workouts', category: 'workout', icon: 'Dumbbell', target: 10 },
  { id: 'dedicated', title: 'Dedicated', description: 'Complete 25 workouts', category: 'workout', icon: 'Dumbbell', target: 25 },
  { id: 'iron-warrior', title: 'Iron Warrior', description: 'Complete 50 workouts', category: 'workout', icon: 'Dumbbell', target: 50 },
  { id: 'gym-legend', title: 'Gym Legend', description: 'Complete 100 workouts', category: 'workout', icon: 'Dumbbell', target: 100 },
  { id: 'first-run', title: 'First Run', description: 'Log your first run', category: 'running', icon: 'Footprints', target: 1 },
  { id: 'five-k-runner', title: '5K Runner', description: 'Run a total of 5 km', category: 'running', icon: 'Footprints', target: 5 },
  { id: 'ten-k-runner', title: '10K Runner', description: 'Run a total of 10 km', category: 'running', icon: 'Footprints', target: 10 },
  { id: 'half-marathoner', title: 'Half Marathoner', description: 'Run a total of 21.1 km', category: 'running', icon: 'Footprints', target: 21.1 },
  { id: 'century-runner', title: 'Century Runner', description: 'Run a total of 100 km', category: 'running', icon: 'Footprints', target: 100 },
  { id: 'week-warrior', title: 'Week Warrior', description: 'Log habits for 7 days total', category: 'consistency', icon: 'CalendarCheck', target: 7 },
  { id: 'monthly-master', title: 'Monthly Master', description: 'Log habits for 20 days in a single month', category: 'consistency', icon: 'CalendarCheck', target: 20 },
  { id: 'year-warrior', title: 'Year Warrior', description: 'Log habits for 200 days total', category: 'consistency', icon: 'CalendarCheck', target: 200 },
  { id: 'first-goal', title: 'First Goal', description: 'Complete your first goal', category: 'goals', icon: 'Target', target: 1 },
  { id: 'goal-getter', title: 'Goal Getter', description: 'Complete 5 goals', category: 'goals', icon: 'Target', target: 5 },
  { id: 'achiever', title: 'Achiever', description: 'Complete 10 goals', category: 'goals', icon: 'Target', target: 10 },
  { id: 'overachiever', title: 'Overachiever', description: 'Complete 20 goals', category: 'goals', icon: 'Target', target: 20 },
];

@Injectable()
export class AchievementsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const [workoutCount, totalRunDistance, runCount, habitDays, monthlyHabitDays, goalsCompleted, streakDays] =
      await Promise.all([
        this.prisma.workout.count({ where: { userId } }),
        this.getTotalRunDistance(userId),
        this.prisma.runActivity.count({ where: { userId } }),
        this.getHabitDays(userId),
        this.getMonthlyHabitDays(userId),
        this.prisma.goal.count({ where: { userId, status: 'Completed' } }),
        this.getCurrentStreak(userId),
      ]);

    const raw: Record<string, number> = {
      'first-step': streakDays,
      'on-a-roll': streakDays,
      'unstoppable': streakDays,
      'consistency-king': streakDays,
      'first-session': workoutCount,
      'getting-started': workoutCount,
      'dedicated': workoutCount,
      'iron-warrior': workoutCount,
      'gym-legend': workoutCount,
      'first-run': runCount,
      'five-k-runner': totalRunDistance,
      'ten-k-runner': totalRunDistance,
      'half-marathoner': totalRunDistance,
      'century-runner': totalRunDistance,
      'week-warrior': habitDays,
      'monthly-master': monthlyHabitDays,
      'year-warrior': habitDays,
      'first-goal': goalsCompleted,
      'goal-getter': goalsCompleted,
      'achiever': goalsCompleted,
      'overachiever': goalsCompleted,
    };

    const achievements: AchievementResult[] = ACHIEVEMENT_DEFS.map((def) => {
      const current = raw[def.id] ?? 0;
      const progress = Math.min(100, Math.round((current / def.target) * 100));
      return {
        ...def,
        current,
        progress,
        unlocked: current >= def.target,
      };
    });

    const unlocked = achievements.filter((a) => a.unlocked).length;
    const total = achievements.length;

    let rank = 'Beginner';
    if (unlocked >= total * 0.8) rank = 'Elite';
    else if (unlocked >= total * 0.5) rank = 'Veteran';
    else if (unlocked >= total * 0.25) rank = 'Intermediate';
    else if (unlocked >= 2) rank = 'Rookie';

    return {
      achievements,
      summary: {
        total,
        unlocked,
        rank,
        streak: streakDays,
      },
    };
  }

  private async getTotalRunDistance(userId: string) {
    const result = await this.prisma.runActivity.aggregate({
      where: { userId },
      _sum: { distanceKm: true },
    });
    return result._sum.distanceKm ?? 0;
  }

  private async getHabitDays(userId: string) {
    const result = await this.prisma.habitLog.findMany({
      where: { userId },
      select: { date: true },
      distinct: ['date'],
    });
    return result.length;
  }

  private async getCurrentStreak(userId: string) {
    const logs = await this.prisma.habitLog.findMany({
      where: { userId },
      select: { date: true },
      distinct: ['date'],
      orderBy: { date: 'desc' },
    });

    if (logs.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dates = logs.map((l) => {
      const d = new Date(l.date);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    });

    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(today.getTime() - i * 86400000).getTime();
      if (dates.includes(expected)) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private async getMonthlyHabitDays(userId: string) {
    const logs = await this.prisma.habitLog.findMany({
      where: { userId },
      select: { date: true },
      distinct: ['date'],
    });

    const monthMap = new Map<string, number>();
    for (const l of logs) {
      const d = new Date(l.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
    }

    return Math.max(0, ...monthMap.values());
  }
}
