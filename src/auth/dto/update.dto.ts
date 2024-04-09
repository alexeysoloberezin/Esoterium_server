import { IsString, IsOptional } from 'class-validator';

export class UpdateProfileDTO {
  @IsOptional()
  @IsString()
  readonly telegram?: string;

  @IsOptional()
  @IsString()
  readonly paymentNumber?: string;

  @IsOptional()
  @IsString()
  readonly paymentType?: string;
}
