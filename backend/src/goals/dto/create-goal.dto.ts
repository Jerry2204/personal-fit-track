import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GoalType, GoalStatus } from '@prisma/client';

export class CreateGoalDto {
  @IsString()
  name: string;

  @IsEnum(GoalType)
  type: GoalType;

  @Type(() => Number)
  @Min(0)
  targetValue: number;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  currentValue?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;
}
