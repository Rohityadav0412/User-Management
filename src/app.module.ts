import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from './config';
import { UserService } from './user/user.service';
import { UserMongoService } from './Database/Mongodb/mongodbOperations/user.mongo';
import { HelperFunctions } from './common/helperFunctions';
//import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { RateLimiterModule,RateLimiterGuard } from 'nestjs-rate-limiter'
import { APP_GUARD } from '@nestjs/core';


@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}), UserModule,
    MongooseModule.forRoot(config.MONGODB_CONNECTION_STRING),
    RateLimiterModule,
    //  ThrottlerModule.forRoot([
    //   {
    //     ttl: 60000,
    //     limit: 5,
    //   },
    // ]),
       
  ],
  controllers: [AppController],
  providers: [AppService,UserService,UserMongoService,HelperFunctions,
{
  provide: APP_GUARD,
  useClass: RateLimiterGuard
}
],
  exports: [MongooseModule]
})
export class AppModule {}
