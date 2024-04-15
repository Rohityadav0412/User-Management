import { Body, Controller,HttpException,HttpStatus,Post, Headers, Query, Get, Req, Delete, Put, Patch, BadRequestException, NotFoundException, HttpCode } from '@nestjs/common';
import { UserService } from './user.service';
import { SignUpDTO } from 'src/dto/signup.dto';
import { LoginDTO } from 'src/dto/login.dto';
import { UpdateDTO } from 'src/dto/update.dto';
import { ChangePasswordDTO } from 'src/dto/changePassword.dto';
//import { Throttle, ThrottlerGuard,} from '@nestjs/throttler'; // another method to put rate limiter 
import { RateLimit } from 'nestjs-rate-limiter'
import { codes } from 'src/common/error.codes';
import { HelperFunctions } from 'src/common/helperFunctions';
import { JsonWebTokenError } from 'jsonwebtoken';
import { allowedFields } from 'src/common/constants';


@Controller('user')
export class UserController {
    constructor(private userService: UserService,private helperFunctions:HelperFunctions){}


    @Post("/signup")
   // @Throttle({ default: { limit: 10, ttl: 60000 } })
   @RateLimit({ keyPrefix: 'signup', points: 10, duration: 3600, errorMessage: 'Accounts cannot be created more than 10 in a hour' })
    async signUp(@Body() signUpDto: SignUpDTO,@Headers('X-Secret') headers:any): Promise<any>{
        try {
          const allowedField=allowedFields['signUp'];
          // Checking the correct body of the request
            await this.helperFunctions.validateDTO(SignUpDTO,signUpDto,allowedField);
            const user = await this.userService.signUp(signUpDto,headers);
            return { statusCode: HttpStatus.CREATED, message: 'User created successfully', data: {}};
          } catch (error) {
            if (codes[error['code']] && codes [Object.keys(error['keyValue'])[0]]){
                throw new HttpException({ httpCode: HttpStatus.BAD_REQUEST, message: codes[error['code']][Object.keys(error['keyValue'])[0]] ,data: {} }, HttpStatus.BAD_REQUEST);
            }
            else{
            throw new HttpException({ httpCode: HttpStatus.BAD_REQUEST, message: error.message, data: {} }, HttpStatus.BAD_REQUEST);
            }
          }
        }


    @Post("/login")
    @HttpCode(200)
   // @Throttle({ default: { limit: 3, ttl: 60000 } })
   @RateLimit({ keyPrefix: 'login', points: 5, duration: 60, errorMessage: 'Accounts cannot be login more than once in per minute' })
    async login(@Body() logindto: LoginDTO): Promise<any>{
        try {
          const allowedField=allowedFields['login'];
          // Checking the correct body of the request
          await this.helperFunctions.validateDTO(LoginDTO,logindto,allowedField);
          const user=await this.userService.login(logindto);
          return { statusCode: HttpStatus.OK, message: 'User login successfully', data: user };
        } catch (error) {
          throw new HttpException({ statusCode: HttpStatus.UNAUTHORIZED, message: error.message, data: {} }, HttpStatus.UNAUTHORIZED);
        }

    }

    @Get("/getDetails")
    @HttpCode(200)
    //@Throttle({ default: { limit: 4, ttl: 60000 } })
    @RateLimit({ keyPrefix: 'getDetails', points: 2, duration: 120, errorMessage: 'Details cannot be accessed more than twice in 2 minute' })
    async getUser(@Req() req,@Query('users') users: string, @Query('mobileNumber') mobileNumber: string): Promise<any>{
        try {
          //getting user details
          console.log("users",users);
          const user=await this.userService.getUser(req,users,mobileNumber);
          return { httpCode: HttpStatus.OK, message: 'User details fetched successfully', data: user };
        } catch (error) {
          if(error instanceof NotFoundException){
            throw new HttpException({ statusCode: HttpStatus.NOT_FOUND, message: error.message, data: {} }, HttpStatus.NOT_FOUND);
          }
          else if(error instanceof JsonWebTokenError){
            throw new HttpException({ statusCode: HttpStatus.UNAUTHORIZED, message: "Invalid Access Token", data: {} }, HttpStatus.UNAUTHORIZED);
          }
          else{
            throw new HttpException({ statusCode: HttpStatus.UNAUTHORIZED, message: error.message, data: {} }, HttpStatus.UNAUTHORIZED);
          }
        }

    }


    @Delete("/deleteUser")
    @HttpCode(200)
    //@Throttle({ default: { limit: 1, ttl: 60000 } })
    @RateLimit({ keyPrefix: 'deleteUser', points: 5, duration: 86400, errorMessage: 'User cannot be deleted more than once per day' })
    async deleteUser(@Req() req,@Query('mobileNumber') mobileNumber: string): Promise<any>{
        try {
          // deleting a user
          await this.userService.deleteUser(req,mobileNumber);
          return { statusCode: HttpStatus.OK, message: 'User deleted successfully', data: {} };
          
        } catch (error) {
          if(error instanceof NotFoundException){
            throw new HttpException({ statusCode: HttpStatus.NOT_FOUND, message: error.message, data: {} }, HttpStatus.NOT_FOUND);
          }
          else if(error instanceof JsonWebTokenError){
            throw new HttpException({ statusCode: HttpStatus.UNAUTHORIZED, message: "Invalid Access Token", data: {} }, HttpStatus.UNAUTHORIZED);
          }
          else{
          throw new HttpException({ statusCode: HttpStatus.UNAUTHORIZED, message: error.message, data: {} }, HttpStatus.UNAUTHORIZED);
          }
        }

    }

    @Patch("/updateUser")
    @HttpCode(200)
   // @Throttle({ default: { limit: 2, ttl: 60000 } })
   @RateLimit({ keyPrefix: 'updateUser', points: 5, duration: 120, errorMessage: 'Details cannot be updated more than 5times in 2minute' })
    async updateUser(@Body() updateDto: UpdateDTO,@Req() req,@Query('mobileNumber') mobileNumber: string): Promise<any>{
        try {
          const allowedField=allowedFields['update'];
          // Checking the correct body of the request
          await this.helperFunctions.validateDTO(UpdateDTO,updateDto,allowedField);
          await this.userService.updateUser(updateDto,req,mobileNumber);
          return { statusCode: HttpStatus.OK, message: 'User updated successfully', data: {} };
        } catch (error) {
          if(error instanceof NotFoundException){
            throw new HttpException({ statusCode: HttpStatus.NOT_FOUND, message: error.message, data: {} }, HttpStatus.NOT_FOUND);
          }
          else if(error instanceof JsonWebTokenError){
            throw new HttpException({ statusCode: HttpStatus.UNAUTHORIZED, message: "Invalid Access Token", data: {} }, HttpStatus.UNAUTHORIZED);
          }
          else{
          throw new HttpException({ statusCode: HttpStatus.UNAUTHORIZED, message: error.message, data: {} }, HttpStatus.UNAUTHORIZED);
          }
        }

    }

    @Patch("/changePassword")
    @HttpCode(200)
   // @Throttle({ default: { limit: 1, ttl: 86400 } })
   @RateLimit({ keyPrefix: 'changePassword', points: 2, duration: 86400, errorMessage: 'User cannot change password more than once in a day' })
    async changePassword(@Body() changePasswordDto: ChangePasswordDTO,@Req() req): Promise<any>{
        try {
          const allowedField=allowedFields['password'];
          // Checking the correct body of the request
          await this.helperFunctions.validateDTO(ChangePasswordDTO,changePasswordDto,allowedField);
          // changing the password
          await this.userService.changePassword(changePasswordDto,req);
          return { statusCode: HttpStatus.OK, message: 'Password changed successfully', data: {} };
        } catch (error) {
          if(error instanceof NotFoundException){
            throw new HttpException({ statusCode: HttpStatus.NOT_FOUND, message: error.message, data: {} }, HttpStatus.NOT_FOUND);
          }
          else if(error instanceof JsonWebTokenError){
            throw new HttpException({ statusCode: HttpStatus.UNAUTHORIZED, message: "Invalid Access Token", data: {} }, HttpStatus.UNAUTHORIZED);
          }
          else{
          throw new HttpException({ statusCode: HttpStatus.UNAUTHORIZED, message: error.message, data: {} }, HttpStatus.UNAUTHORIZED);
          }
        }

    }


    @Post("/generateAccessToken")
    @HttpCode(200)
    async generateAccessToken(@Req() req): Promise<any>{
        try {
          const user=await this.userService.generateAccessToken(req);
          return { statusCode: HttpStatus.OK, message: 'Access Token generated successfully', data: user }; 
        } catch (error) {
          if(error instanceof NotFoundException){
            throw new HttpException({ statusCode: HttpStatus.NOT_FOUND, message: error.message, data: {} }, HttpStatus.NOT_FOUND);
          }
          else if(error instanceof JsonWebTokenError){
            throw new HttpException({ statusCode: HttpStatus.UNAUTHORIZED, message: "Invalid Refresh Token", data: {} }, HttpStatus.UNAUTHORIZED);
          }
          else{
          throw new HttpException({ statusCode: HttpStatus.UNAUTHORIZED, message: error.message, data: {} }, HttpStatus.UNAUTHORIZED);
          }
        }

    }


    @Post("/revoke")
    @HttpCode(200)
    async revoke(@Req() req): Promise<any>{
        try {
          const user=await this.userService.revoke(req);
          return { statusCode: HttpStatus.OK, message: 'Token revoked successfully', data: user };
        } catch (error) {
          if(error instanceof NotFoundException){
            throw new HttpException({ statusCode: HttpStatus.NOT_FOUND, message: error.message, data: {} }, HttpStatus.NOT_FOUND);
          }
          else if(error instanceof JsonWebTokenError){
            throw new HttpException({ statusCode: HttpStatus.UNAUTHORIZED, message: "Invalid Access Token", data: {} }, HttpStatus.UNAUTHORIZED);
          }
          else{
          throw new HttpException({ statusCode: HttpStatus.UNAUTHORIZED, message: error.message, data: {} }, HttpStatus.UNAUTHORIZED);
          }
        }

    }


    @Post("/revokeAll")
    @HttpCode(200)
    async revokeAll(@Req() req): Promise<any>{
        try {
          const user=await this.userService.revokeAll(req);
          return { statusCode: HttpStatus.OK, message: 'Tokens revoked successfully', data: user };
        } catch (error) {
          if(error instanceof NotFoundException){
            throw new HttpException({ statusCode: HttpStatus.NOT_FOUND, message: error.message, data: {} }, HttpStatus.NOT_FOUND);
          }
          else if(error instanceof JsonWebTokenError){
            throw new HttpException({ statusCode: HttpStatus.UNAUTHORIZED, message: "Invalid Access Token", data: {} }, HttpStatus.UNAUTHORIZED);
          }
          else{
          throw new HttpException({ statusCode: HttpStatus.UNAUTHORIZED, message: error.message, data: {} }, HttpStatus.UNAUTHORIZED);
          }
        }

    }
}
