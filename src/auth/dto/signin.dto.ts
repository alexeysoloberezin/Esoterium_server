import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsStrongPassword, IsNotEmpty } from 'class-validator';
export class SignInDTO {
  @ApiProperty({ description: 'Your desired email' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Your desired strong password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
