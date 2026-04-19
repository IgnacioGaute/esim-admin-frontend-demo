import { IUsersType } from "@/shared/interfaces/user";

export interface ITransactionData {
    id:           string;
    walletId:     string;
    type:         keyof ITransactionType;
    amount:       string;
    balanceAfter: string;
    status:       keyof ITransactionStatus;
    description:  null;
    metadata:     IMetadataTransaction | null;
    createdAt:    Date;
    updatedAt:    Date;
}

export interface IMetadataTransaction {
    orderId: string;
}


export interface ITransactionDetailWalletData {
    id:         string;
    resellerId: string;
    walletTransactionId:   string;
    createdAt:  Date;
    updatedAt:  Date;
    reseller:   ResellerTransaction;
    wallet:     WalletTransaction;
}

export interface ResellerTransaction {
    id:             string;
    name:           string;
    email:          string;
    password:       string;
    type:           keyof IUsersType;
    created_at:     Date;
    updated_at:     Date;
    coupons:        any[];
    referral_codes: any[];
}

export interface WalletTransaction {
    id:                string;
    balance:           string;
    isActive:          boolean;
    createdAt:         Date;
    updatedAt:         Date;
    lastTransactionAt: Date;
}


export interface ITransactionStatus {
    PENDING: string;
    COMPLETED: string;
    FAILED: string;
    CANCELLED: string;
}

export interface ITransactionType {
    ADD_BALANCE:    string;
    BUY_ESIM:       string;
    SUBTRACT_BALANCE: string;
}

export interface ITransactionParamExport{
    status?:        keyof ITransactionStatus;
    resellerId?:    string;
    type?:          keyof ITransactionType
    from?:          string;
    to?:            string;
}