import { IUsersType } from "@/shared/interfaces/user";

export interface ISignInForm{
    email: string;
    password: string;
}

export interface ISignInRespSuccess{
    access_token:   string;
    expires_at:     Date;
    type:           string;
    user:           {
        type: keyof IUsersType
    }
}