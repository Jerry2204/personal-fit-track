import { IsString, IsOptional, IsEnum, IsInt, IsNumber, IsDateString, Min, Max, IsArray, ValidateNested, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { WorkoutType, RunType, ActivityType } from '@prisma/client';

class CreatePlanActivityDto {
  @IsEnum(ActivityType)
  activityType: ActivityType;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(WorkoutType)
  workoutType?: WorkoutType;

  @IsOptional()
  @IsEnum(RunType)
  runType?: RunType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetDistanceKm?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  targetDurationMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  targetPace?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

class CreatePlanDayDto {
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanActivityDto)
  activities?: CreatePlanActivityDto[];
}

export class CreateWorkoutPlanDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanDayDto)
  days?: CreatePlanDayDto[];
}
