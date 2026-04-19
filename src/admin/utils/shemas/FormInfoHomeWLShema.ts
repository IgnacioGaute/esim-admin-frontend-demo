import * as Yup from 'yup';

export const FormInfoHomeWLShema = Yup.object().shape({
    main_heading: Yup.string()
    .required(),
    main_description: Yup.string()
    .required(),
    main_get_esim: Yup.string()
    .required(),
});