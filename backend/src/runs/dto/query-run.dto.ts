import { IsOptional, IsEnum, IsInt, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { RunType } from '@prisma/client';

export class QueryRunDto {
  @IsOptional()
  @IsEnum(RunType)
  type?: RunType;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
