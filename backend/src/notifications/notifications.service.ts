import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({ where: { userId, read: false } });
  }

  async markRead(userId: string, id: string) {
    const existing = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!existing) return null;
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async checkAndGenerate(userId: string) {
    const created: string[] = [];

    const [goalReminders, workoutReminder, habitReminder, achievementNotifs] =
      await Promise.all([
        this.generateGoalReminders(userId),
        this.generateWorkoutReminder(userId),
        this.generateHabitReminder(userId),
        this.generateAchievementNotifications(userId),
      ]);

    for (const n of [
      ...goalReminders,
      ...workoutReminder,
      ...habitReminder,
      ...achievementNotifs,
    ]) {
      const existing = await this.prisma.notification.findFirst({
        where: { userId, title: n.title, createdAt: { gte: new Date(Date.now() - 86400000) } },
      });
      if (!existing) {
        await this.prisma.notification.create({ data: { userId, ...n } });
        created.push(n.title);
      }
    }

    return { created: created.length };
  }

  private async generateGoalReminders(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId, status: 'Active', deadline: { not: null } },
      select: { id: true, name: true, deadline: true },
    });

    const now = new Date();
    const notifications: Array<{ type: string; title: string; message: string; severity: string; link: string }> = [];

    for (const g of goals) {
      if (!g.deadline) continue;
      const daysLeft = Math.ceil((g.deadline.getTime() - now.getTime()) / 86400000);

      if (daysLeft < 0) {
        notifications.push({
          type: 'goal_reminder',
          title: 'Goal Overdue',
          message: `"${g.name}" is overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''}.`,
          severity: 'warning',
          link: `/goals`,
        });
      } else if (daysLeft <= 7) {
        notifications.push({
          type: 'goal_reminder',
          title: 'Goal Deadline Approaching',
          message: `"${g.name}" is due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}.`,
          severity: daysLeft <= 2 ? 'warning' : 'info',
          link: `/goals`,
        });
      }
    }

    return notifications;
  }

  private async generateWorkoutReminder(userId: string) {
    const recent = await this.prisma.workout.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
      select: { date: true },
    });

    if (!recent) {
      return [{
        type: 'workout_reminder' as const,
        title: 'First Workout',
        message: 'You haven\'t logged any workouts yet. Start your fitness journey today!',
        severity: 'info' as const,
        link: '/workouts/new',
      }];
    }

    const daysSince = (Date.now() - recent.date.getTime()) / 86400000;
    if (daysSince >= 3) {
      return [{
        type: 'workout_reminder' as const,
        title: 'Time to Train',
        message: `It's been ${Math.floor(daysSince)} day${Math.floor(daysSince) !== 1 ? 's' : ''} since your last workout.`,
        severity: 'info' as const,
        link: '/workouts/new',
      }];
    }

    return [];
  }

  private async generateHabitReminder(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLog = await this.prisma.habitLog.findFirst({
      where: { userId, date: { gte: today } },
    });

    if (!todayLog) {
      return [{
        type: 'habit_reminder' as const,
        title: 'Daily Check-in',
        message: 'Don\'t forget to log your habits for today.',
        severity: 'info' as const,
        link: '/habits',
      }];
    }

    return [];
  }

  private async generateAchievementNotifications(userId: string) {
    const [workoutCount, totalRunDistance, runCount, habitDays, goalsCompleted] =
      await Promise.all([
        this.prisma.workout.count({ where: { userId } }),
        this.getTotalRunDistance(userId),
        this.prisma.runActivity.count({ where: { userId } }),
        this.getHabitDays(userId),
        this.prisma.goal.count({ where: { userId, status: 'Completed' } }),
      ]);

    const milestones: Array<{ title: string; message: string; link: string }> = [];

    if (workoutCount === 1) milestones.push({ title: 'First Session', message: 'You completed your first workout!', link: '/workouts' });
    if (workoutCount === 10) milestones.push({ title: 'Getting Started', message: '10 workouts completed! Keep the momentum.', link: '/workouts' });
    if (workoutCount === 25) milestones.push({ title: 'Dedicated', message: '25 workouts — you\'re building a routine!', link: '/workouts' });
    if (workoutCount === 50) milestones.push({ title: 'Iron Warrior', message: '50 workouts! That\'s serious dedication.', link: '/workouts' });
    if (workoutCount === 100) milestones.push({ title: 'Gym Legend', message: '100 workouts — incredible milestone!', link: '/workouts' });

    if (runCount === 1) milestones.push({ title: 'First Run', message: 'You logged your first run!', link: '/running' });
    if (totalRunDistance >= 5 && totalRunDistance < 10) milestones.push({ title: '5K Runner', message: 'You\'ve run 5 km total!', link: '/running' });
    if (totalRunDistance >= 10 && totalRunDistance < 21.1) milestones.push({ title: '10K Runner', message: '10 km total running distance!', link: '/running' });
    if (totalRunDistance >= 21.1 && totalRunDistance < 100) milestones.push({ title: 'Half Marathoner', message: '21.1 km total — half marathon distance!', link: '/running' });
    if (totalRunDistance >= 100) milestones.push({ title: 'Century Runner', message: '100 km total running distance!', link: '/running' });

    if (goalsCompleted === 1) milestones.push({ title: 'First Goal', message: 'You completed your first goal!', link: '/goals' });
    if (goalsCompleted === 5) milestones.push({ title: 'Goal Getter', message: '5 goals completed!', link: '/goals' });
    if (goalsCompleted === 10) milestones.push({ title: 'Achiever', message: '10 goals completed!', link: '/goals' });

    if (habitDays === 1) milestones.push({ title: 'First Step', message: 'You logged your first daily check-in!', link: '/habits' });
    if (habitDays === 7) milestones.push({ title: 'Week Warrior', message: '7 days of habit tracking!', link: '/habits' });
    if (habitDays === 30) milestones.push({ title: 'Monthly Master', message: '30 days of habit tracking!', link: '/habits' });

    return milestones.map((m) => ({
      type: 'achievement' as const,
      title: m.title,
      message: m.message,
      severity: 'success' as const,
      link: m.link,
    }));
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
}
