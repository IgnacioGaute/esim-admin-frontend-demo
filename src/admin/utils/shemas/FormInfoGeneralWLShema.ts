import * as Yup from 'yup';

export const FormInfoGeneralWLShema = Yup.object().shape({
    name: Yup.string()
    .required(),
    primary_color: Yup.string()
    .required(),
    secondary_color: Yup.string()
    .required(),
    contact_url: Yup.string()
    .required(),
    is_login_enabled: Yup.boolean()
    .required(),
});