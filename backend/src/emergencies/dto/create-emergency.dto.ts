import { IsString, IsInt, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateEmergencyDto {
  @IsString()
  hospital!: string;

  @IsString()
  department!: string;

  @IsString()
  requiredType!: string;

  @IsInt()
  @Min(1)
  unitsNeeded!: number;

  @IsString()
  urgency!: string;

  @IsOptional()
  @IsNumber()
  distance?: number;
}
