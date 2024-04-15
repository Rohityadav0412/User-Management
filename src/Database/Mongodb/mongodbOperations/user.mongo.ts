import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { USERS_MODEL, Users } from '../Schemas/user.schema';
import { SignUpDTO } from 'src/dto/signup.dto';
import { HelperFunctions } from 'src/common/helperFunctions';
import { USERTOKEN_MODEL, UserToken } from '../Schemas/user.token.schema';
import { ADMINTOKEN_MODEL, AdminToken } from '../Schemas/admin.token.schema';
import {  ROLE } from 'src/common/constants';



@Injectable()
export class UserMongoService {
    constructor(@InjectModel(USERS_MODEL) private readonly userModel:Model<Users>,
    @InjectModel(USERTOKEN_MODEL) private readonly userTokenModel:Model<UserToken>,
    @InjectModel(ADMINTOKEN_MODEL) private readonly adminTokenModel:Model<AdminToken>,
    private helperFunctions: HelperFunctions){}


    async createUser(signUpDto: SignUpDTO,hashedPassword,uuid,role,scope): Promise<any>{
        try{
            const {name,mobileNumber,email,age,country}=signUpDto;
            const user=await this.userModel.create({
                name,
                uuid,
                mobileNumber,
                email,
                password: hashedPassword,
                age,
                country,
                role,
                scope: scope,
            });
        return user;
        }
        catch(error){
            throw error;
        }
    }


    async verifyRevokeToken(query,role){
        try {
            let user;
            if(role==ROLE.admin){
                user= await this.adminTokenModel.findOne(query).lean();
            }
            else if(role==ROLE.user){
                user= await this.userTokenModel.findOne(query).lean();
            }
                if(user.length==0){
                    throw new NotFoundException(" Invalid Token");
                }
                if(user.revoked===true){
                    throw new NotFoundException(" Invalid Token - token is revoked");
                }
                return user;
        } catch (error) {
            throw error;
        }
    }

    async checkingUser(email,password){
        try {
            const user=await this.userModel.findOne({email});
            if(!user){
                throw new HttpException({ statusCode: HttpStatus.UNAUTHORIZED, message: "Email or password is incorrect", data: {} }, HttpStatus.UNAUTHORIZED);
            }
            //verifying the request body password
            let passwordMatch=await this.helperFunctions.verifyPassword(password,user.password);
            if(passwordMatch===false){
                throw new HttpException({ statusCode: HttpStatus.UNAUTHORIZED, message: "Email or password is incorrect", data: {} }, HttpStatus.UNAUTHORIZED);
            }
            return {
                uuid:user['uuid'],
                role:user['role'],
                scope: user.scope,
            };
        } catch (error) {
            throw error;
        }
    }

    async checkingUserPassword(uuid,password){
        try {
            const user=await this.userModel.findOne({uuid});
            console.log("userpass",user.password);
            if(password!=undefined){
                let a=await this.helperFunctions.verifyPassword(password,user.password);
            if(a===false){
                throw new HttpException({ statusCode: HttpStatus.UNAUTHORIZED, message: "Invalid password check password", data: {} }, HttpStatus.UNAUTHORIZED);
            }
            }
            else{
                throw new HttpException({ statusCode: HttpStatus.UNAUTHORIZED, message: "Please provide password", data: {} }, HttpStatus.UNAUTHORIZED);
            }
        } catch (error) {
            // console.log(error);
            throw error;
        }
    }

    async alreadyExistingUser(email,mobileNumber){
            const phoneCheck=await this.userModel.findOne({mobileNumber}).lean();
            if(phoneCheck){
                throw new UnauthorizedException("Phone Number already exists");
            }
            const emailCheck=await this.userModel.findOne({email}).lean();
            if(emailCheck){
                throw new UnauthorizedException( "Email already exists");
            }   
            
    }

    async saveToken(uuid,role,accessToken,refreshToken,revoked){
        
        try {
            if(role==ROLE.user){
            await this.userTokenModel.create({
                uuid,
                accessToken,
                refreshToken,
                revoked,
            });
        }
        else{
            await this.adminTokenModel.create({
                uuid,
                accessToken,
                refreshToken,
                revoked,
            });
            
        }
        } catch (error) {
            throw error;
        }
    }

    async changeAccessToken(role,AccessToken,query){
        
        try {
            let updatedUser;
            if(role==ROLE.admin){
                updatedUser= await this.adminTokenModel.findOneAndUpdate(query,{$set:{AccessToken: AccessToken} },{new: true}).lean();
            }
            else if(role==ROLE.user){
                updatedUser= await this.userTokenModel.findOneAndUpdate(query,{$set:{AccessToken: AccessToken} },{new: true}).lean();
            }   
                if(updatedUser==null){
                    throw new NotFoundException("User Not Found");
                }
                return {};
        } catch (error) {
            throw error;
        }
    }


    async getDetail(query){
        
        try {
            const filter={_id:0,password:0}
                const user= await this.userModel.find(query,filter).lean();
                if(user.length==0){
                    throw new NotFoundException("User Not Found");
                }
                console.log(user);
                return user;
        } catch (error) {
            throw error;
        }
    }

    async deleteDetails(query){
        
        try {
            let deletedUser;
                deletedUser= await this.userModel.findOneAndDelete(query).lean();
                console.log(deletedUser);
                if(deletedUser==null){
                    throw new NotFoundException("User Not Found");
                }
                return {};
            } catch (error) {
                throw error;
            }
        }
    
                

    async updateDetails(query,updateDto){
        
        try {
            let updatedUser;
                updatedUser= await this.userModel.findOneAndUpdate(query,updateDto,{new: true}).lean();
                console.log("updateuser",updatedUser);
                if(updatedUser==null){
                    throw new NotFoundException("User Not Found");
                }
                return {};
        } catch (error) {
            throw error;
        }
    }


    async updatePassword(query,password){
        
        try {
            let updatedUser;
                updatedUser= await this.userModel.findOneAndUpdate(query,{$set:{"password": password} },{new: true}).lean();
                console.log(updatedUser);
                if(updatedUser==null){
                    throw new NotFoundException("User Not Found");
                }
                return {};
        } catch (error) {
            throw error;
        }
    }


    async revokeToken(query,role,key,revoke){
        
        try {
            let deletedUser;
            if(role==ROLE.user){
                deletedUser= await this.userTokenModel.findOneAndUpdate(query,{$set:{[key]: revoke} },{new: true}).lean();
            }else if(role==ROLE.admin){
                deletedUser= await this.adminTokenModel.findOneAndUpdate(query,{$set:{[key]: revoke} },{new: true}).lean();
            }
                if(deletedUser==null){
                    throw new NotFoundException("User Not Found");
                }
                return {};
            } catch (error) {
                throw error;
            }
        }


        async revokeAllToken(key1,query,role,key2,revoke){
            try {
                let deletedUser;
                if(role==ROLE.user){
                    deletedUser= await this.userTokenModel.updateMany({ [key1]: query },{$set:{[key2]: revoke} },{new: true}).lean();
                }else if(role==ROLE.admin){
                    deletedUser= await this.adminTokenModel.updateMany({ [key1]: query },{$set:{[key2]: revoke} },{new: true}).lean();
                }
                    if(deletedUser==null){
                        throw new NotFoundException("User Not Found");
                    }
                    return {};
                } catch (error) {
                    throw error;
                }
            }


    
}
