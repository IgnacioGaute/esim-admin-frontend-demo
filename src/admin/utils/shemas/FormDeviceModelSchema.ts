import * as Yup from "yup";

export const FormDeviceModelSchema = Yup.object().shape({
  brandId: Yup.string().required("Seleccione una marca"),
  name: Yup.string().trim().min(2, "Muy corto").max(120, "Muy largo").required("Ingrese el modelo"),
  maxEsims: Yup.number()
    .typeError("Debe ser un número")
    .min(1, "Mínimo 1")
    .max(100, "Máximo 100")
    .required("Ingrese máx eSIMs"),
  isActive: Yup.boolean().required(),
  sortOrder: Yup.number()
    .typeError("Debe ser un número")
    .min(0, "Mínimo 0")
    .max(9999, "Máximo 9999")
    .required("Ingrese el orden"),
});

export const FormDeviceModelSchemaEdit = FormDeviceModelSchema;
