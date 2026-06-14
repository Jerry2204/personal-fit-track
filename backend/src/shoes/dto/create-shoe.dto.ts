import { IsString, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShoeDto {
  @IsString()
  brand!: string;

  @IsString()
  model!: string;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  maxMileageKm?: number;
}
