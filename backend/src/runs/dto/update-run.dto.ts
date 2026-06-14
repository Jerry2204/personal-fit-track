import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RunType } from '@prisma/client';

export class UpdateRunDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  distanceKm?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationMinutes?: number;

  @IsOptional()
  @IsEnum(RunType)
  type?: RunType;

  @IsOptional()
  @IsString()
  shoeId?: string;

  @IsOptional()
  @IsInt()
  heartRateAvg?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  caloriesEstimate?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
