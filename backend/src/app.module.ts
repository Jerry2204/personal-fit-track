import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ExercisesModule } from './exercises/exercises.module';
import { WorkoutsModule } from './workouts/workouts.module';
import { RunsModule } from './runs/runs.module';
import { BodyProgressModule } from './body-progress/body-progress.module';
import { GoalsModule } from './goals/goals.module';
import { CalendarModule } from './calendar/calendar.module';
import { HabitLogsModule } from './habit-logs/habit-logs.module';
import { PersonalRecordsModule } from './personal-records/personal-records.module';
import { ShoesModule } from './shoes/shoes.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { ProfileModule } from './profile/profile.module';
import { AchievementsModule } from './achievements/achievements.module';
import { ExportModule } from './export/export.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ProgressiveOverloadModule } from './progressive-overload/progressive-overload.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, ExercisesModule, WorkoutsModule, RunsModule, BodyProgressModule, GoalsModule, CalendarModule, HabitLogsModule, PersonalRecordsModule, ShoesModule, DashboardModule, ReportsModule, ProfileModule, AchievementsModule, ExportModule, NotificationsModule, ProgressiveOverloadModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
