import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsArray,
  IsDateString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WorkoutType } from '@prisma/client';

class CreateSetDto {
  @IsInt()
  @Min(1)
  setNumber: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  reps?: number;

  @IsOptional()
  @Type(() => Number)
  weightKg?: number;

  @IsOptional()
  @Type(() => Number)
  rpe?: number;
}

class CreateWorkoutExerciseDto {
  @IsString()
  exerciseId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSetDto)
  sets?: CreateSetDto[];
}

export class CreateWorkoutDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsEnum(WorkoutType)
  type: WorkoutType;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkoutExerciseDto)
  exercises?: CreateWorkoutExerciseDto[];
}
