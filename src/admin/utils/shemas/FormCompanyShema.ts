import * as Yup from "yup";
import { SocialPlatform } from "../interfaces";

const emptyToNull = (v: any, ov: any) => (ov === "" ? null : v);

export const FormCompanyUserSchema = Yup.object().shape({
  id: Yup.string().nullable(),

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
          .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, "Debe tener al menos una mayúscula, minúscula y número"),
      otherwise: (s) =>
        s.notRequired().test("min-if-present", "Mínimo 6 caracteres", (val) => !val || val.length >= 6),
    }),
  amount: Yup.number().transform(emptyToNull).nullable(),
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
});

const SocialLinkSchema = Yup.object({
  platform: Yup.mixed<SocialPlatform>()
    .oneOf(Object.values(SocialPlatform) as SocialPlatform[], "Plataforma inválida"),
  url: Yup.string()
    .url("Debe ser una URL válida"),
});

export const FormCompanyShema = Yup.object().shape({
  name: Yup.string().required("Este campo es obligatorio"),

  rut: Yup.number()
    .transform(emptyToNull)
    .typeError("El numero de identificaion debe ser un número")
    .integer("El numero de identificaion  debe ser un número entero")
    .required("Este campo es obligatorio"),

  address: Yup.string().transform(emptyToNull).required("Este campo es obligatorio"),
  city: Yup.string().transform(emptyToNull).required("Este campo es obligatorio"),
  country: Yup.string().transform(emptyToNull).required("Este campo es obligatorio"),
  commercialTour: Yup.string().transform(emptyToNull).required("Este campo es obligatorio"),

  paymentType: Yup.mixed<"PRE_PAYMENT" | "POST_PAYMENT">()
    .oneOf(["PRE_PAYMENT", "POST_PAYMENT"], "Tipo de pago inválido")
    .required("Este campo es obligatorio"),

  website: Yup.string().transform(emptyToNull).nullable().url("Debe ser una URL válida"),
  photoUrl: Yup.string().nullable(),

  // ✅ ahora es array jsonb
  socialMedia: Yup.array()
    .of(SocialLinkSchema)
    .transform((value, originalValue) => {
      // si viene null o array vacío => null (para DB)
      if (!originalValue || (Array.isArray(originalValue) && originalValue.length === 0)) return null;
      return value;
    })
    .nullable(),

  users: Yup.array().of(FormCompanyUserSchema).default([]),
});
