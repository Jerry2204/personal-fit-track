import { IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryCalendarDto {
  @Type(() => Number)
  @IsInt()
  year: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  month: number;
}
