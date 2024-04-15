
import {IsNotEmpty,IsString, Matches, MinLength } from "class-validator";

export class ChangePasswordDTO{

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{}|;:,.<>?]).{8,}$/,{message: 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character.',})
    newPassword: string;
}