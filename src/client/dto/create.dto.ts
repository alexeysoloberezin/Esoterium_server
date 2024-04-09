import { IsString, IsOptional, IsEmail, IsNotEmpty } from "class-validator";

export class CreateClientDTO {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsNotEmpty()
  @IsString()
  readonly phone: string;
}
