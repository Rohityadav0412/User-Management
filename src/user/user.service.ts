import {HttpException, HttpStatus, Injectable } from '@nestjs/common';
//import { readFileSync } from 'fs';
import { UserMongoService } from 'src/Database/Mongodb/mongodbOperations/user.mongo';
import { ROLE, TokenType } from 'src/common/constants';
import { HelperFunctions } from 'src/common/helperFunctions';
import { config } from 'src/config';
import { LoginDTO } from 'src/dto/login.dto';
import { SignUpDTO } from 'src/dto/signup.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
    constructor(private userMongoOperations: UserMongoService,private helperFunctions:HelperFunctions){}
        async signUp(signUpDto: SignUpDTO,secretkey: string): Promise<any>{
            try{
                //hashing the request body password
                const hashedPassword = await this.helperFunctions.hashPassword(signUpDto.password);
                let role;
                let scope = signUpDto.scope;
                const uuid = uuidv4();
                if(secretkey===config.X_Secret_Key){
                    role=ROLE.admin;
                    if(!scope){
                    scope=["GET","UPDATE","POST","DELETE"];
                    }
                }
                else{
                    role=ROLE.user;
                    if(!scope){
                    scope=["GET","UPDATE","POST"];
                    }
                    else{
                        scope=signUpDto.scope;
                    }
                }
                //creating the user
                const user = await this.userMongoOperations.createUser(signUpDto,hashedPassword,uuid,role,scope);
                return user;

            }
            catch(error){
                throw error;
            }
        }


        async login(loginDto: LoginDTO): Promise<any>{
            try {
                const {email,password}=loginDto;
                let revoke=false;
                //Checking user present with the requested credentials or not 
                const user=await this.userMongoOperations.checkingUser(email,password);
               // const keys=this.helperFunctions.generateKeys();
               const accessPayload={
                sub: user.uuid,
                tokenType: TokenType.access,
                role: user.role,
                scope: user.scope,
               }

               const refreshPayload={
                sub: user.uuid,
                tokenType: TokenType.refresh,
                role: user.role,
                scope: user.scope,
               }

               const accessSignInOptions={
                expiresIn:"1h",
                algorithm:'RS256'
               }

               const refreshSignInOptions={
                expiresIn:"1d",
                algorithm:'RS256'
               }
               const accessToken=this.helperFunctions.generateToken(accessPayload,config.access_token.private_key,accessSignInOptions);
               const refreshToken=this.helperFunctions.generateToken(refreshPayload,config.refresh_token.private_key,refreshSignInOptions);
               // Saving the tokens of the users in different collection
               await this.userMongoOperations.saveToken(user.uuid,user.role,accessToken,refreshToken,revoke);

               return {
                "accessToken":accessToken,
                "refreshToken":refreshToken,
            };

                
            } catch (error) {
                throw error;
                
            }
        }


        async getUser(req,users,mobileNo): Promise<any>{
            try {
                const accessTokenBearer=req.headers['authorization'];
                // getting access token without bearer
                const accessToken =this.helperFunctions.fromAuthHeaderAsBearerToken(accessTokenBearer);
                //verifying the token
                const payload=this.helperFunctions.verifyToken(accessToken,config.access_token.public_key);
                // verifying if the token is revoked or not
                await this.userMongoOperations.verifyRevokeToken({accessToken},payload['role']);
                const uuid=payload['sub'];
                const role=payload["role"];
                const scope=payload["scope"];
                let mobileNumber;
                if(mobileNo!=undefined){
                mobileNumber=mobileNo.toString();
                mobileNumber=mobileNumber.replace(/\D/g, '');
                if(mobileNumber.length===10){
                mobileNumber="+91"+mobileNumber;
                }
            }
                let user;
                if(role===ROLE.admin){
                    if(scope.includes("GET")){
                        if(mobileNumber!=undefined){
                        user=await this.userMongoOperations.getDetail({mobileNumber});
                        }
                        else {
                            if(users!=undefined && users.includes("all")){
                                user=await this.userMongoOperations.getDetail({});
                            }
                            else{
                                user=await this.userMongoOperations.getDetail({uuid});
                            }
                        }
                        
                } 
                else{
                    throw new HttpException({httpCode: HttpStatus.UNAUTHORIZED, message: "No Access to get Details", data: {} }, HttpStatus.UNAUTHORIZED)
                }  
                }
                else if(role===ROLE.user){
                        if(scope.includes("GET")){
                            user=await this.userMongoOperations.getDetail({uuid});
                        }
                        else{
                            throw new HttpException({httpCode: HttpStatus.UNAUTHORIZED, message: "No Access to get Details", data: {} }, HttpStatus.UNAUTHORIZED)
                        } 
                }
                return user;
                

            }
            catch(error){
                console.log(error)
                throw error;
            }
        }


        async deleteUser(req,mobileNo): Promise<void>{
            try {
                const accessTokenBearer=req.headers['authorization'];
                const accessToken =this.helperFunctions.fromAuthHeaderAsBearerToken(accessTokenBearer);
                const payload=this.helperFunctions.verifyToken(accessToken,config.access_token.public_key);
                // verifying if the token is revoked or not
                await this.userMongoOperations.verifyRevokeToken({accessToken},payload['role']);
                const uuid=payload['sub'];
                const role=payload["role"];
                const scope=payload["scope"];
                let revokeToken=true;
                let mobileNumber;
                if(mobileNo!=undefined){
                mobileNumber=mobileNo.toString();
                mobileNumber=mobileNumber.replace(/\D/g, '');
                if(mobileNumber.length===10){
                mobileNumber="+91"+mobileNumber;
                }
            }
                let user;
                if(role===ROLE.admin){
                    if(scope.includes("DELETE")){
                    if(mobileNumber!=undefined){
                       await this.userMongoOperations.deleteDetails({mobileNumber});
                       await this.userMongoOperations.revokeAllToken('mobileNumber',uuid,ROLE.user,'revoked',revokeToken);
                    }
                    else{
                        await this.userMongoOperations.deleteDetails({uuid});
                        await this.userMongoOperations.revokeAllToken('uuid',uuid,role,'revoked',revokeToken);
                    }
                } 
                else{
                    throw new HttpException({httpCode: HttpStatus.UNAUTHORIZED, message: "No Access to delete Details", data: {} }, HttpStatus.UNAUTHORIZED);
                }  
                }
                else if(role===ROLE.user){
                    if(scope.includes("DELETE")){
                            await this.userMongoOperations.deleteDetails({uuid});
                            await this.userMongoOperations.revokeAllToken('uuid',uuid,role,'revoked',revokeToken);
                    }else{
                        throw new HttpException({httpCode: HttpStatus.UNAUTHORIZED, message: "No Access to delete Details", data: {} }, HttpStatus.UNAUTHORIZED);
                    }
                }
            }
            catch(error){
                throw error;
            }
        }


        async updateUser(updateDto,req,mobileNo): Promise<void>{
            try {
                const accessTokenBearer=req.headers['authorization'];
                const accessToken =this.helperFunctions.fromAuthHeaderAsBearerToken(accessTokenBearer);
                // verifying the access token is correct or not
                const payload=this.helperFunctions.verifyToken(accessToken,config.access_token.public_key);
                // verifying if the token is revoked or not
                await this.userMongoOperations.verifyRevokeToken({accessToken},payload['role']);
                const uuid=payload['sub'];
                const role=payload["role"];
                const scope=payload["scope"];
                let passwordCheck=updateDto.password;
                console.log("passcheck",passwordCheck);
                let mobileNumber;
                console.log("mob",mobileNo);
                if(mobileNo!=undefined){
                    mobileNumber=mobileNo.toString();
                    mobileNumber=mobileNumber.replace(/\D/g, '');
                    if(mobileNumber.length===10){
                    mobileNumber="+91"+mobileNumber;
                    }
                }
                let phoneNumber=updateDto.mobileNumber;
                let email=updateDto.email;
                if(phoneNumber!=undefined || email!=undefined ){
                    await this.userMongoOperations.checkingUserPassword(uuid,passwordCheck);
                }
                    if(role===ROLE.admin){
                        if(scope.includes("UPDATE")){
                            if(mobileNumber!=undefined){
                                console.log("mobbb",mobileNumber);
                                 if(phoneNumber || email){
                                    throw new HttpException({statusCode: HttpStatus.UNAUTHORIZED, message: "No Access to update Email or phone No", data: {} }, HttpStatus.UNAUTHORIZED);
                                }
                                await this.userMongoOperations.alreadyExistingUser(email,phoneNumber);
                                await this.userMongoOperations.updateDetails({mobileNumber},updateDto);
                            }
                            else{
                                await this.userMongoOperations.alreadyExistingUser(email,phoneNumber);
                                await this.userMongoOperations.updateDetails({uuid},updateDto);
                            }
                        } 
                        else{
                            throw new HttpException({statusCode: HttpStatus.UNAUTHORIZED, message: "No Access to update Details", data: {} }, HttpStatus.UNAUTHORIZED);
                        }  
                    }
                    else if(role===ROLE.user){
                        if(scope.includes("UPDATE")){
                            await this.userMongoOperations.alreadyExistingUser(email,phoneNumber);
                            await this.userMongoOperations.updateDetails({uuid},updateDto);
                        }
                        else{
                            throw new HttpException({statusCode: HttpStatus.UNAUTHORIZED, message: "No Access to update Details", data: {} }, HttpStatus.UNAUTHORIZED);
                        }
                    }
                
            }
            catch(error){
                throw error;
            }
        }


        async changePassword(changePasswordDto,req): Promise<void>{
            try {
                const accessTokenBearer=req.headers['authorization'];
                const accessToken =this.helperFunctions.fromAuthHeaderAsBearerToken(accessTokenBearer);
                //verifying the access token is correct or not
                const payload=this.helperFunctions.verifyToken(accessToken,config.access_token.public_key);
                // verifying if the token is revoked or not
                await this.userMongoOperations.verifyRevokeToken({accessToken},payload['role']);
                const uuid=payload['sub'];
                const scope=payload["scope"];
                const passwordCheck=changePasswordDto.oldPassword;
                // Checking the current password of user
                await this.userMongoOperations.checkingUserPassword(uuid,passwordCheck);
                // hashing the new password
                const hashedPassword = await this.helperFunctions.hashPassword(changePasswordDto.newPassword);
                        if(scope.includes("UPDATE")){
                            
                                  await this.userMongoOperations.updatePassword({uuid},hashedPassword);
                        } 
                        else{
                            throw new HttpException({statusCode: HttpStatus.UNAUTHORIZED, message: "No Access to change password", data: {} }, HttpStatus.UNAUTHORIZED);
                        }  
                
            }
            catch(error){
                throw error;
            }
        }



        async generateAccessToken(req): Promise<any>{
            try {
                const refreshTokenBearer=req.headers['authorization'];
                const refreshToken =this.helperFunctions.fromAuthHeaderAsBearerToken(refreshTokenBearer);
                // verifying the refresh token is correct or not
                const payload=this.helperFunctions.verifyToken(refreshToken,config.refresh_token.public_key);
                // verifying the refresh token is revoked or not
                await this.userMongoOperations.verifyRevokeToken({refreshToken},payload['role']);
                const uuid=payload['sub'];
                const role=payload['role'];
                const scope=payload['scope'];
                let revokeToken=false;
               const accessPayload={
                sub: uuid,
                tokenType: TokenType.access,
                role: role,
                scope: scope,
               }

               const accessSignInOptions={
                expiresIn:"1h",
                algorithm:'RS256'
               }

               const accessToken=this.helperFunctions.generateToken(accessPayload,config.access_token.private_key,accessSignInOptions);
               // changing the expired access token with the new access token
               await this.userMongoOperations.changeAccessToken(role,accessToken,{refreshToken});
               return {
                "accessToken":accessToken,
               // "refreshToken":refreshToken,
            };  
            } catch (error) {
                throw error;
                
            }
        }


        async revoke(req): Promise<any>{
            try {
                let revokeToken=true;
                let key='revoked';
                const refreshTokenBearer=req.headers['authorization'];
                const refreshToken =this.helperFunctions.fromAuthHeaderAsBearerToken(refreshTokenBearer);
                const payload=this.helperFunctions.verifyToken(refreshToken,config.refresh_token.public_key);
                // verifying the token is revoked or not
                await this.userMongoOperations.verifyRevokeToken({refreshToken},payload['role']);
                const uuid=payload['sub'];
                const role=payload['role'];
                await this.userMongoOperations.revokeToken({refreshToken},role,key,revokeToken);
               return {};
                
            } catch (error) {
                throw error;
                
            }
        }



        async revokeAll(req): Promise<any>{
            try {
                let revokeToken=true;
                let key1='uuid';
                let key2='revoked';
                const refreshTokenBearer=req.headers['authorization'];
                const refreshToken =this.helperFunctions.fromAuthHeaderAsBearerToken(refreshTokenBearer);
                const payload=this.helperFunctions.verifyToken(refreshToken,config.refresh_token.public_key);
                await this.userMongoOperations.verifyRevokeToken({refreshToken},payload['role']);
                const uuid=payload['sub'];
                const role=payload['role'];
                await this.userMongoOperations.revokeAllToken(key1,uuid,role,key2,revokeToken);
               return {}; 
            } catch (error) {
                throw error;
                
            }
        }
}
