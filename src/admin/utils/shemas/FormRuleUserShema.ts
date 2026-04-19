import * as Yup from 'yup';

export const FormRuleUserShema = Yup.object().shape({
    reseller_id: Yup.string()
    .optional(),
    profit_margin: Yup.number()
    .positive()
    .required(),
    reseller_margin: Yup.number()
    .positive()
    .optional(),
    scope_type: Yup.string()
    .required(),
    scope_value: Yup.string()
    .required(),
    type: Yup.string()
    .required(),
    is_active: Yup.boolean()
    .required(),
});