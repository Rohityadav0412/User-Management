export enum ROLE {
    admin="ADMIN",
    user="USER",

}
export enum TokenType{
    access="ACCESS",
    refresh="REFRESH",
}

export const messageList={
    USER_NOT_FOUND:"User Not Found",

}

export const allowedFields ={
    signUp:['name', 'mobileNumber',"email","password","age","country","scope"],
    login:['email','password'],
    update:['name', 'mobileNumber',"email","age","country","scope","password"],
    password:["oldPassword","newPassword"],
};
