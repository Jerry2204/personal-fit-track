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

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, ExercisesModule, WorkoutsModule, RunsModule, BodyProgressModule, GoalsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
