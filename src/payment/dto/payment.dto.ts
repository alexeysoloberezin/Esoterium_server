import { IsString, IsOptional, IsEmail, IsNotEmpty, IsPhoneNumber } from "class-validator";

export class getPaymentLinkDto {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber()
  readonly phone: string;

  @IsNotEmpty()
  @IsString()
  readonly typeProduct: string;
}
