import { IsOptional, IsEnum, IsDateString, IsString, IsInt, Min } from 'class-validator';
import { PlanDayStatus } from '@prisma/client';

export class UpdateActivityStatusDto {
  @IsOptional()
  @IsEnum(PlanDayStatus)
  status?: PlanDayStatus;

  @IsOptional()
  @IsDateString()
  completedDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  workoutId?: string;

  @IsOptional()
  @IsString()
  runId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  targetDistanceKm?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  targetDurationMinutes?: number;
}
