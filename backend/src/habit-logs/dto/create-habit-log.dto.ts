import { IsString, IsOptional, IsNumber, IsDateString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Mood } from '@prisma/client';

export class CreateHabitLogDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  waterIntakeMl?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  @Max(24)
  sleepHours?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  steps?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  caloriesIntake?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  proteinG?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  bodyWeightKg?: number;

  @IsOptional()
  @IsEnum(Mood)
  mood?: Mood;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10)
  energyLevel?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
