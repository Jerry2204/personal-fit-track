import { IsString, IsOptional, IsEnum, IsInt, IsNumber, IsDateString, Min, Max, IsArray, ValidateNested, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { WorkoutType, RunType, ActivityType } from '@prisma/client';

class UpdatePlanActivityDto {
  @IsOptional()
  @IsEnum(ActivityType)
  activityType?: ActivityType;

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

class UpdatePlanDayDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek?: number;

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
  @Type(() => UpdatePlanActivityDto)
  activities?: UpdatePlanActivityDto[];
}

export class UpdateWorkoutPlanDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdatePlanDayDto)
  days?: UpdatePlanDayDto[];
}
