import * as Yup from 'yup';

export const FormUserShema = Yup.object().shape({
  name: Yup.string().required("Este campo es obligatorio"),
  email: Yup.string().email("Email inválido").required("Este campo es obligatorio"),
  type: Yup.mixed<"ADMIN" | "SELLER" | "SUPER_ADMIN">()
    .oneOf(["ADMIN", "SELLER", "SUPER_ADMIN"], "Tipo inválido")
    .required("Este campo es obligatorio"),

  password: Yup.string()
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .when("id", {
      is: (id: any) => !id,
      then: (s) =>
        s
          .required("Este campo es obligatorio")
          .min(6, "Mínimo 6 caracteres")
          .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, "Debe tener mayúscula, minúscula y número"),
      otherwise: (s) =>
        s.notRequired().test("min-if-present", "Mínimo 6 caracteres", (val) => !val || val.length >= 6),
    }),

  phone: Yup.string()
    .transform((v) => {
      const t = String(v ?? "").trim()
      if (!t) return ""
      if (t === "+54" || t === "+54 " || t === "+54-") return ""
      if (/^\+\d{1,3}$/.test(t)) return ""
      return t
    })
    .when("id", {
      is: (id: any) => !id, // creando
      then: (s) => s.required("Este campo es obligatorio"),
      otherwise: (s) => s.notRequired(),
    }),
  companyId: Yup.string(),
  photoUrl: Yup.string().nullable(),
})

export const FormUserShemaEdit = Yup.object().shape({
  name: Yup.string().required("Este campo es obligatorio"),
  email: Yup.string().email("Email inválido").required("Este campo es obligatorio"),
  type: Yup.mixed<"ADMIN" | "SELLER" | 'SUPER_ADMIN'>()
    .oneOf(["ADMIN", "SELLER", 'SUPER_ADMIN'], "Tipo inválido")
    .required("Este campo es obligatorio"),
  password: Yup.string()
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .when("id", {
      is: (id: any) => !id,
      then: (s) => s.required("Este campo es obligatorio").min(6, "Mínimo 6 caracteres"),
      otherwise: (s) =>
        s.notRequired().test("min-if-present", "Mínimo 6 caracteres", (val) => !val || val.length >= 6),
    }),
phone: Yup.string()
  .transform((v) => {
    const t = String(v ?? "").trim()
    if (!t) return ""
    if (t === "+54" || t === "+54 " || t === "+54-") return ""
    if (/^\+\d{1,3}$/.test(t)) return ""
    return t
  })
  .required("Este campo es obligatorio"),
  photoUrl: Yup.string().nullable(),
});