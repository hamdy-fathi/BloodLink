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

export class CreateDonorDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  phone!: string;

  @IsString()
  bloodType!: string;

  @IsInt()
  @Min(18)
  @Max(65)
  age!: number;

  @IsString()
  city!: string;

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
