import * as Yup from 'yup';

export const FormBundleShema = Yup.object().shape({
    name: Yup.string()
    .matches(/^\S*$/, 'No se permiten espacios')
    .required(),
    description: Yup.string()
    .required(),
    dataAmount: Yup.number()
    .positive()
    .integer()
    .min(1),
    duration: Yup.number()
    .positive()
    .integer()
    .min(1),
    iso: Yup.string()
    .required(),
    serving_mcc_mnc: Yup.array()
    .of(Yup.string())
    .min(1)
    .required(),
    choicePoolId: Yup.string()
    .required(),
})

export const FormBundlePoolShema = Yup.object().shape({
    choicePoolId: Yup.string()
    .required(),
})