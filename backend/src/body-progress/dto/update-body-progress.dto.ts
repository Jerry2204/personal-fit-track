import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateBodyProgressDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  weightKg?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  bodyFatPercent?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  waistCm?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  chestCm?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  armCm?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  thighCm?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
