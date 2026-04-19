import * as Yup from 'yup';

export const FormNotificationPushShema = Yup.object().shape({
    title: Yup.string()
    .max(80)
    .required(),
    description: Yup.string()
    .max(120)
    .required(),
    channel:Yup.string()
    .required()
});