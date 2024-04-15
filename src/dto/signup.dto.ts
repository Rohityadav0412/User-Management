
import { Transform } from "class-transformer";
import { IsAlpha, IsArray, IsEmail, IsInt, IsNotEmpty, IsNumber, IsOptional,IsPhoneNumber,IsString, Length, Matches, Max, MaxLength, Min, MinLength } from "class-validator";

export class SignUpDTO{

    
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^\+91[789]\d{9}$/)
    mobileNumber: string;

    @IsNotEmpty()
    @IsEmail({},{message: "Please enter correct Email"})
    email:string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{}|;:,.<>?]).{8,}$/,{message: 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character.',})
    password: string;

    @IsNotEmpty()
    @Transform(({ value }) => parseInt(value))
    @Min(10)
    @Max(150)
    @IsInt()
    age: string;

    @IsNotEmpty()
    @IsString()
    @IsAlpha()
    country: string;

    @IsArray()
    @IsOptional()
    scope?: string[];


}