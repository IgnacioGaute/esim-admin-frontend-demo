import * as Yup from 'yup';

export const FormCouponShema = Yup.object().shape({
    code: Yup.string()
    .required(),
    discount_percent: Yup.number()
    .positive()
    .min(1)
    .max(100)
    .required(),
    count: Yup.number()
    .positive()
    .min(1)
    .required(),
    enabled: Yup.bool()
    .required()
});