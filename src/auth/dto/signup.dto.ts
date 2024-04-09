import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
    IsNotEmpty,
  IsOptional,
  IsEmail,
  MinLength,
} from 'class-validator';
export class SignUpDTO {
  @ApiProperty({ description: 'Strong password', required: true })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Your email', required: false })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
