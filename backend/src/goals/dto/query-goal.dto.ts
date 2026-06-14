import { IsOptional, IsEnum } from 'class-validator';
import { GoalType, GoalStatus } from '@prisma/client';

export class QueryGoalDto {
  @IsOptional()
  @IsEnum(GoalType)
  type?: GoalType;

  @IsOptional()
  @IsEnum(GoalStatus)
  status?: GoalStatus;
}
