import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
@Schema({
    timestamps: true,
    versionKey:false
})
export class Users extends Document{
    @Prop()
    name: string;

    @Prop()
    uuid: string;

    @Prop({unique: [true,'Duplicate Mobile Number entered']})
    mobileNumber: string;


    @Prop({unique: [true,'Duplicate email entered']})
    email: string;

    @Prop()
    password: string;

    @Prop()
    age: string;

    @Prop()
    country: string;

    @Prop()
    role: string;

    @Prop()
    scope: string[];
}

const schema = SchemaFactory.createForClass(Users);
export const UsersSchema= schema;
export const USERS_MODEL=Users.name;