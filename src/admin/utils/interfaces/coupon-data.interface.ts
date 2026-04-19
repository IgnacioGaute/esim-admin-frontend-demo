export interface ICouponData {
    id:               string;
    code:             string;
    discount_percent: number;
    count:            number;
    used_count:       number;
    enabled:          boolean;
    created_at:       Date;
    updated_at:       Date;
}


export interface IFormCoupon extends Omit<ICouponData, 'id' | 'created_at' | 'updated_at' | 'used_count'>{}