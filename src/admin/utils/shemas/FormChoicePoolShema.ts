import * as Yup from 'yup';
export const FormChoicePoolShema = Yup.object().shape({
    name: Yup.string()
    .required(),
    provider: Yup.string()
    .required(),
    idPool: Yup.string()
    .required(),
    imsiFrom: Yup.string()
    .required(),
    imsiTo: Yup.string()
    .required()
})