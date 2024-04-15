import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserMongoService } from 'src/Database/Mongodb/mongodbOperations/user.mongo';
import { HelperFunctions } from 'src/common/helperFunctions';
import { MongooseModule } from '@nestjs/mongoose';
import { USERS_MODEL, UsersSchema } from 'src/Database/Mongodb/Schemas/user.schema';
import { ADMINTOKEN_MODEL, AdminTokenSchema } from 'src/Database/Mongodb/Schemas/admin.token.schema';
import { USERTOKEN_MODEL, UserTokenSchema } from 'src/Database/Mongodb/Schemas/user.token.schema';


@Module({
  imports:[ MongooseModule.forFeature([{name:USERS_MODEL,schema: UsersSchema, collection: 'Users'},]),
  MongooseModule.forFeature([{name:USERTOKEN_MODEL,schema: UserTokenSchema, collection: 'UserToken'},]),
  MongooseModule.forFeature([{name:ADMINTOKEN_MODEL,schema: AdminTokenSchema, collection: 'AdminToken'},]),

],
  controllers: [UserController],
  providers: [UserService,UserMongoService,HelperFunctions],
  exports :[MongooseModule]
})
export class UserModule {}
