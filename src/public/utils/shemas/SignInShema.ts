import * as Yup from 'yup';

export const SignInSchema = Yup.object().shape({
    email: Yup.string()
    .email()
    .required("Este campo es requerido"),
    password: Yup.string()
    .required("Este campo es requerido")
});