
import { IsArray, IsEmail, IsNumber, IsOptional,IsString, Length, Matches, MinLength } from "class-validator";

export class UpdateDTO{
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    @Matches(/^\+91[789]\d{9}$/)
    mobileNumber?: string;

    @IsOptional()
    @IsEmail({},{message: "Please enter correct Email"})
    email?:string;


    @IsOptional()
    @IsString()
    age?: string;

    @IsOptional()
    @IsString()
    country?: string;

    @IsArray()
    @IsOptional()
    scope?: string[];

    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;


}