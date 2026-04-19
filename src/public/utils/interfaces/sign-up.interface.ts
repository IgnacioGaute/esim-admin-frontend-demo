import { IUsersType } from "@/shared/interfaces/user";
import { ISignInForm } from "./sign-in.interface";

export interface ISignUpForm extends ISignInForm {
    name: string;
    type: keyof IUsersType;
    termsAndConditions:  boolean;
    repeatPassword: string;
}

export type TypeSignUpData = Omit<ISignUpForm, 'termsAndConditions' | 'repeatPassword'>; 

