import {
  IsString,
  IsEmail,
  IsInt,
  IsBoolean,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class UpdateDonorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  bloodType?: string;

  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(65)
  age?: number;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  lastDonation?: string;

  @IsOptional()
  @IsInt()
  totalDonations?: number;

  @IsOptional()
  @IsNumber()
  reliability?: number;

  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @IsOptional()
  @IsBoolean()
  eligible?: boolean;
}
