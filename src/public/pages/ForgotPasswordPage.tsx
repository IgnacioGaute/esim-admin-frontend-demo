import { useMemo, useState } from "react"
import { Formik } from "formik"
import { Box, Button, TextField, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { useFetch, useNotiAlert } from "@/shared/hooks"
import { schemaByStep, Step } from "../utils/shemas/forgotPasswordSchema"

type Values = {
  email: string
  otpCode: string
  newPassword: string
  confirmPassword: string
}


export const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const { snackBarAlert } = useNotiAlert()
  const [step, setStep] = useState<Step>(0)

  // ⬇️ los 3 hooks SOLO para usar onFetch (init:false)
  const { onFetch: sendEmailFetch, isFetching: sendingEmail } = useFetch(
    "recovery-password",
    "POST",
    { init: false, cache: { enabled: false } }
  )

  const { onFetch: verifyCodeFetch, isFetching: verifyingCode } = useFetch(
    "recovery-password/verify",
    "POST",
    { init: false, cache: { enabled: false } }
  )

  const { onFetch: completeFetch, isFetching: completing } = useFetch(
    "recovery-password/complete",
    "POST",
    { init: false, cache: { enabled: false } }
  )

  const loading = sendingEmail || verifyingCode || completing

  const validationSchema = useMemo(() => schemaByStep(step), [step])

  const initialValues: Values = {
    email: "",
    otpCode: "",
    newPassword: "",
    confirmPassword: "",
  }

  return (
    <Box sx={{ maxWidth: 460, mx: "auto", py: 4 }}>
      <Typography variant="h5" fontWeight={900} mb={1}>
        Recuperar contraseña
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={3}>
        {step === 0 && "Ingresá tu email para recibir un código."}
        {step === 1 && "Ingresá el código de 6 dígitos que te llegó por email."}
        {step === 2 && "Elegí tu nueva contraseña."}
      </Typography>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, helpers) => {
          // ✅ marca touched para que se pongan rojos si falta algo
          const errs = await helpers.validateForm()
          if (Object.keys(errs).length > 0) {
            helpers.setTouched(
              Object.keys(errs).reduce((acc: any, k) => ({ ...acc, [k]: true }), {}),
              true
            )
            return
          }

          if (step === 0) {
            const resp = await sendEmailFetch("recovery-password", "POST", {
              data: { email: values.email },
              headers: { "Content-Type": "application/json" },
            })

            if (resp.ok) {
              snackBarAlert("Te enviamos un código al email.", { variant: "success", showClose: true })
              setStep(1)
            }
            return
          }

          if (step === 1) {
            const resp = await verifyCodeFetch("recovery-password/verify", "POST", {
              data: { email: values.email, code: Number(values.otpCode) },
              headers: { "Content-Type": "application/json" },
            })

            if (resp.ok) {
              snackBarAlert("Código verificado.", { variant: "success", showClose: true })
              setStep(2)
            }
            return
          }

          // step === 2
          const resp = await completeFetch("recovery-password/complete", "POST", {
            data: {
              email: values.email,
              code: Number(values.otpCode),
              password: values.newPassword,
              confirm_password: values.confirmPassword,
            },
            headers: { "Content-Type": "application/json" },
          })

          if (resp.ok) {
            snackBarAlert("Contraseña actualizada.", { variant: "success", showClose: true })
            helpers.resetForm()
            setStep(0)
            navigate("/sign-in") // o donde quieras
            return
          }

          // ✅ si backend manda message, lo pintamos en el input
          const msg = (resp as any)?.message || (resp as any)?.error?.toMessage?.() || ""
          if (msg) {
            helpers.setFieldError("newPassword", msg)
            helpers.setTouched({ newPassword: true, confirmPassword: true } as any, true)
          }
        }}
      >
        {({ handleSubmit, handleChange, values, errors, touched }) => (
          <Box component="form" onSubmit={handleSubmit}>
            {/* Email (bloqueado después del step 0) */}
            <TextField
              label="Correo electrónico"
              value={values.email}
              onChange={handleChange("email")}
              fullWidth
              size="small"
              disabled={step !== 0 || loading}
              error={Boolean(touched.email && errors.email)}
              helperText={touched.email ? errors.email : ""}
              sx={{ mb: 2 }}
            />

            {step >= 1 && (
              <TextField
                label="Código (6 dígitos)"
                value={values.otpCode}
                onChange={handleChange("otpCode")}
                fullWidth
                size="small"
                disabled={loading}
                error={Boolean(touched.otpCode && errors.otpCode)}
                helperText={touched.otpCode ? errors.otpCode : ""}
                sx={{ mb: 2 }}
              />
            )}

            {step === 2 && (
              <>
                <TextField
                  label="Nueva contraseña"
                  value={values.newPassword}
                  onChange={handleChange("newPassword")}
                  fullWidth
                  size="small"
                  type="password"
                  disabled={loading}
                  error={Boolean(touched.newPassword && errors.newPassword)}
                  helperText={touched.newPassword ? errors.newPassword : ""}
                  sx={{ mb: 2 }}
                />

                <TextField
                  label="Confirmar contraseña"
                  value={values.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  fullWidth
                  size="small"
                  type="password"
                  disabled={loading}
                  error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                  helperText={touched.confirmPassword ? errors.confirmPassword : ""}
                  sx={{ mb: 2 }}
                />
              </>
            )}

            <Box display="flex" gap={1} mt={1}>
              {step > 0 && (
                <Button
                  type="button"
                  variant="outlined"
                  disabled={loading}
                  fullWidth
                  onClick={() => setStep((s) => (s === 2 ? 1 : 0))}
                >
                  Atrás
                </Button>
              )}

              <Button variant="contained" type="submit" disabled={loading} fullWidth>
                {step === 0 && "Enviar código"}
                {step === 1 && "Verificar código"}
                {step === 2 && "Actualizar contraseña"}
              </Button>
            </Box>
          </Box>
        )}
      </Formik>
    </Box>
  )
}