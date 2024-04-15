import { BadRequestException, Injectable } from '@nestjs/common';
//import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { codes } from './error.codes';


const scryptAsync = promisify(scrypt);
@Injectable()
export class HelperFunctions {
  // generateKeys() {
  //   try {
  //     const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  //       modulusLength: 2048,
  //       publicKeyEncoding: { type: 'spki', format: 'pem' },
  //       privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  //     });

  //     fs.writeFileSync("/home/rohit/Documents/jwttoken-demo/src/keys/private.key", privateKey, 'utf8');
  //   fs.writeFileSync("/home/rohit/Documents/jwttoken-demo/src/keys/public.key", publicKey, 'utf8');

  //   return { privateKey, publicKey };

  //   } catch (error) {
  //     throw error
  //   }
  // }

  async validateDTO(DTO, Dto, allowedFields) {
    try {
      const requestBody = plainToClass(DTO, Dto); // 
      const receivedFields = Object.keys(Dto);
      const invalidFields = receivedFields.find(
        (field) => !allowedFields.includes(field),
      );
      if (invalidFields) {
        throw new BadRequestException(
          'Invalid request body: Unexpected fields present',
        );
      }

      if (receivedFields.length == 0) {
        throw new BadRequestException('Object should not be empty');
      }
      const errors = await validate(requestBody);
      if (errors.length > 0) {
        if (codes[errors[0]['property']]) {
          throw new BadRequestException(codes[errors[0]['property']]);
        }
      }
    } catch (error) {
        throw error;
    }
  }

  generateToken(payload, privateKey, SignInOptions) {
    const token = jwt.sign(payload, privateKey, SignInOptions);
    return token;
  }

  verifyToken(Token, publicKey) {
    const payload = jwt.verify(Token, publicKey);
    return payload;
  }

  fromAuthHeaderAsBearerToken(accessTokenBearer) {
    if (accessTokenBearer?.startsWith('bearer ')) {
      return accessTokenBearer.substring(7);
    }
    return null;
  }

  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(8).toString('hex');
    const hashBuffer = (await scryptAsync(password, salt, 64)) as Buffer;
    const hash = hashBuffer.toString('hex');
    return `${hash}.${salt}`;
  }

  async verifyPassword(
    enteredPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const [hash, salt] = hashedPassword.split('.');
    if (!hash || !salt) {
      throw new Error('Invalid hashed password format');
    }
  
    const hashedEnteredPassword = (await scryptAsync(
      enteredPassword,
      salt,
      64,
    )) as Buffer;
  
    const isPasswordCorrect = hash === hashedEnteredPassword.toString('hex');
    return isPasswordCorrect;
  }
}
