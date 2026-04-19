export interface ICodeReferral {
    id:                 string;
    referer_code:       string;
    commission_percent: number;
    is_whitelabel:      boolean;
    created_at:         Date;
    updated_at:         Date;
}

export interface IFormCodeReferral extends Omit<ICodeReferral, 'id' | 'created_at' | 'updated_at'>{

}

export interface IDataCodeReferral extends IFormCodeReferral{
    user_id: string;
}
