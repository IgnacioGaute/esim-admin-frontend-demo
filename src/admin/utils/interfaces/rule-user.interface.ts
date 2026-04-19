export interface IRuleUser {
    id: string;
    reseller_id: string;
    profit_margin: number;
    reseller_margin: number;
    scope_type: RuleScopeType;
    scope_value: string;
    type: RuleType;
    is_reseller_rule: boolean;
    is_active: boolean;
    created_by_id: string;
    created_at: Date;
    updated_at: Date;
}
  
export type RuleScopeType = 'COUNTRY' | 'BUNDLE';
export type RuleType = 'INCLUSION' | 'EXCLUSION';

export interface IRuleUserRegister{
    reseller_id?: string;
    profit_margin: number;
    scope_type: RuleScopeType;
    scope_value: string;
    type: RuleType;
    is_reseller_rule?: boolean;
    is_active: boolean;
}

export interface IFormDataRuleUser extends Omit<IRuleUserRegister, 'profit_margin' | 'reseller_margin' | 'scope_value'>{
    profit_margin:              string;
    reseller_margin?:           string;
    multiple_scope_values:      string[];
    scope_value?: string;
}