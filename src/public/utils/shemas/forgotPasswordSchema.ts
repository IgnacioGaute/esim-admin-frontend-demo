import * as Yup from 'yup';

export type Step = 0 | 1 | 2

export const schemaByStep = (step: Step) => {
  if (step === 0) {
    return Yup.object({
      email: Yup.string().email("Email inválido").required("Este campo es obligatorio"),
    })
  }

  if (step === 1) {
    return Yup.object({
      otpCode: Yup.string()
        .required("Este campo es obligatorio")
        .matches(/^\d{6}$/, "Debe tener 6 dígitos"),
    })
  }

  return Yup.object({
    newPassword: Yup.string()
      .required("Este campo es obligatorio")
      .min(8, "Mínimo 8 caracteres")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, "Debe tener mayúscula, minúscula y número"),
    confirmPassword: Yup.string()
      .required("Este campo es obligatorio")
      .oneOf([Yup.ref("newPassword")], "Las contraseñas no coinciden"),
  })
}