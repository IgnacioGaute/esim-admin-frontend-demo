import * as Yup from 'yup';

export const SignUpSchema = Yup.object().shape({
    email: Yup.string()
    .email()
    .required(),
    password: Yup.string()
    .required(),
    repeatPassword: Yup.string()
    .required()
    .oneOf([Yup.ref('password'), 'Repetir contraseña debe coincidir con la contraseña']),
    name: Yup.string()
    .required(),
    termsAndConditions: Yup.bool()
    .oneOf([true], 'You need to accept the terms and conditions')
});