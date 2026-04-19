import { IUsersType } from "@/shared/interfaces/user";
import { ICouponData } from "./coupon-data.interface";
import { ICompanyData } from "./company-data.interface";
import { ICodeReferral } from "./referral.interface";

export interface IUserData{
    id: string;
    name:             string;
    email:            string;
    password:         string;
    phone:            string;
    type:             keyof Omit<IUsersType, 'SUPER_ADMIN'>;
    created_at:       Date;
    updated_at:       Date;
    coupons:          ICouponData[];
    companyId?:        string;
    companyName?:      string;
    company:          ICompanyData;
    referral_codes?:  ICodeReferral[] | null
    photoUrl?:        string | null
}

export interface IFormUser extends Omit<IUserData, 'id' | 'created_at' | 'updated_at' | 'coupons' | 'company'>{
    
}