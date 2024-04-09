import { IsString, IsUUID, IsEmail } from 'class-validator';

export class CreateFormListDto {
    @IsString()
    name: string;

    @IsString()
    phone: string;

    @IsEmail()
    email: string;

    @IsString()
    passportSeries: string;

    @IsString()
    passportNumber: string;

    @IsString()
    dateOfIssue: string;

    @IsString()
    departmentCode: string;

    @IsString()
    whoIssuedPassport: string;

    @IsString()
    dob: string;

    @IsString()
    placeOfBirth: string;

    @IsString()
    registrationRegion: string;

    @IsString()
    SizeSP: string;

    @IsString()
    linkOnAlfa: string;
}
