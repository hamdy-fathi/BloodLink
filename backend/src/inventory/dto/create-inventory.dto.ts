import { IsString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateInventoryDto {
  @IsString()
  type!: string;

  @IsInt()
  @Min(0)
  units!: number;

  @IsOptional()
  @IsString()
  trend?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  expiringIn48h?: number;
}
