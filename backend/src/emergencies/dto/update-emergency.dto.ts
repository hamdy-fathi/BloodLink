import { IsString, IsInt, IsOptional, IsNumber, Min } from 'class-validator';

export class UpdateEmergencyDto {
  @IsOptional()
  @IsString()
  hospital?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  requiredType?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  unitsNeeded?: number;

  @IsOptional()
  @IsString()
  urgency?: string;

  @IsOptional()
  @IsNumber()
  distance?: number;
}
