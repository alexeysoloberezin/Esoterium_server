import { IsString, IsOptional, IsEmail, IsNotEmpty } from "class-validator";

export class CreateClientDTO {
  @IsNotEmpty()
  readonly id: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly phone: string;
}
