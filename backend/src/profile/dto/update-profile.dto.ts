import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, FitnessGoal, ActivityLevel } from '@prisma/client';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(150)
  age?: number;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @Type(() => Number)
  @Min(50)
  @Max(300)
  heightCm?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(20)
  @Max(500)
  currentWeightKg?: number;

  @IsOptional()
  @IsEnum(FitnessGoal)
  fitnessGoal?: FitnessGoal;

  @IsOptional()
  @IsEnum(ActivityLevel)
  activityLevel?: ActivityLevel;

  @IsOptional()
  @Type(() => Number)
  @Min(20)
  @Max(500)
  targetWeightKg?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(14)
  weeklyWorkoutTarget?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(500)
  weeklyRunningTargetKm?: number;
}
