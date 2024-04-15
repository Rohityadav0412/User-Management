import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
@Schema({
    timestamps: true,
    versionKey:false
})
export class UserToken extends Document{

    @Prop()
    uuid: string;

    @Prop()
    accessToken: string;

    @Prop()
    refreshToken: string;

    @Prop()
    revoked: boolean;
}

const schema = SchemaFactory.createForClass(UserToken);
export const UserTokenSchema= schema;
export const USERTOKEN_MODEL=UserToken.name;