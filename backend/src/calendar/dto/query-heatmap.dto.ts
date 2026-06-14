import { IsOptional, IsDateString } from 'class-validator';

export class QueryHeatmapDto {
  @IsOptional()
  @IsDateString()
  to?: string;
}
