import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import {  Response } from 'express';
 
@Catch(HttpException)
export class  HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const errorResponse = exception.getResponse() as any;
    let respond;
    console.log(errorResponse);
    if (status === 400 && Array.isArray(errorResponse.message) && errorResponse.message.length>15) {
      respond = 'Object should not be empty';
    }
    else if (Array.isArray(errorResponse.message) && errorResponse.length>1) {
      respond = errorResponse.message[0];
    }
    else if(errorResponse.message){
      respond=""+errorResponse.message;
    }
    else{
      respond=""+errorResponse;
    }
 
    response
      .status(status)
      .json({
        statusCode: status,
        message:respond,
        data:{}
      });
  }
}