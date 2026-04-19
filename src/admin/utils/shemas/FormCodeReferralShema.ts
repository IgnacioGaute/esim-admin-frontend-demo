import * as Yup from 'yup';

export const FormCodeReferralShema = Yup.object().shape({
    referer_code: Yup.string()
    .required()
    .min(4)
    .max(100),
    commission_percent: Yup.number()
    .positive()
    .min(1)
    .max(100)
    .required(),
    is_whitelabel: Yup.bool()
    .required()
});