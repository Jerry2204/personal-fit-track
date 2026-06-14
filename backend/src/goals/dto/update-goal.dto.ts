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

export class UpdateGoalDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(GoalType)
  type?: GoalType;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  targetValue?: number;

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

  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;
}
