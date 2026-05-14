import { IsString, IsEmail, IsInt, MinLength, Min, Max } from 'class-validator';

export class RegisterDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  phone!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  bloodType!: string;

  @IsInt()
  @Min(18)
  @Max(65)
  age!: number;

  @IsString()
  city!: string;
}
