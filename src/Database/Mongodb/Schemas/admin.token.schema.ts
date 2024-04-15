import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
@Schema({
    timestamps: true,
    versionKey:false
})
export class AdminToken extends Document{

    @Prop()
    uuid: string;

    @Prop()
    accessToken: string;

    @Prop()
    refreshToken: string;

    @Prop()
    revoked: boolean;

}

const schema = SchemaFactory.createForClass(AdminToken);
export const AdminTokenSchema= schema;
export const ADMINTOKEN_MODEL=AdminToken.name;