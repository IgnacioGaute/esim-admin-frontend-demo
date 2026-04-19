import { useEffect, useMemo, useState } from "react"
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  alpha,
} from "@mui/material"
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined"
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined"
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined"
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined"
import { useNavigate } from "react-router-dom"
import useCompanyTopupPaymentActions from "@/admin/hooks/useCompanyTopupPaymentActions"

interface Props {
  open: boolean
  onClose: () => void
  topupId: string
  companyId: string
}

type DialogStep = "form" | "processing" | "redirecting"

export const CompanyTopupBankTransferDialog = ({
  open,
  onClose,
  topupId,
  companyId,
}: Props) => {
  const navigate = useNavigate()
  const { uploadBankReceipt, loadingPaymentAction } = useCompanyTopupPaymentActions()

  const [step, setStep] = useState<DialogStep>("form")
  const [note, setNote] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [errorMsg, setErrorMsg] = useState("")
  const [acceptedManualValidation, setAcceptedManualValidation] = useState(false)

  useEffect(() => {
    if (!open) {
      setStep("form")
      setNote("")
      setFile(null)
      setErrorMsg("")
      setAcceptedManualValidation(false)
    }
  }, [open])

  useEffect(() => {
    if (step !== "processing") return
    const t1 = window.setTimeout(() => setStep("redirecting"), 4500)
    return () => window.clearTimeout(t1)
  }, [step])

  useEffect(() => {
    if (step !== "redirecting") return
    if (!companyId) return
    const t2 = window.setTimeout(() => {
      onClose()
      navigate(`/admin/companies/edit/${companyId}?walletHistory=open`, { replace: true })
    }, 2500)
    return () => window.clearTimeout(t2)
  }, [step, companyId, navigate, onClose])

  const fileLabel = useMemo(() => {
    if (!file) return "Seleccionar comprobante"
    return file.name
  }, [file])

  const handleUpload = async () => {
    setErrorMsg("")
    if (!file) {
      setErrorMsg("Tenés que adjuntar un comprobante.")
      return
    }
    if (!acceptedManualValidation) {
      setErrorMsg(
        "Tenés que confirmar que entendés que la acreditación no es automática y que un Super Administrador debe validar el comprobante."
      )
      return
    }
    try {
      await uploadBankReceipt(topupId, file, note)
      setStep("processing")
    } catch (error: any) {
      setErrorMsg(error?.message || "No se pudo subir el comprobante.")
    }
  }

  return (
    <Dialog
      open={open}
      onClose={step === "form" ? onClose : undefined}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ pb: 1.5 }}>
        {step === "form" && "Transferencia bancaria"}
        {step === "processing" && "Pendiente de validación"}
        {step === "redirecting" && "Comprobante enviado"}
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2.5 }}>
        {step === "form" && (
          <Stack spacing={2.5}>
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              <b>Importante:</b> la acreditación del saldo <b>no es automática</b>. Después de subir
              el comprobante, un <b>Super Administrador</b> debe verificar manualmente y confirmar el
              ingreso del dinero.
            </Alert>

            {/* Botón de descarga de instrucciones */}
            <Box
              sx={{
                p: 3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.25),
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AccountBalanceOutlinedIcon sx={{ fontSize: 32, color: "primary.main" }} />
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Datos bancarios para transferencia
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Descargá el PDF con toda la información necesaria para realizar la transferencia:
                  cuentas en <b>USD</b> y <b>CLP</b>, datos bancarios y referencia obligatoria.
                </Typography>
              </Box>

              <Button
                component="a"
                href="/bank-in-esim-demo.pdf"
                download="bank-in-esim-demo.pdf"
                variant="contained"
                size="large"
                startIcon={<FileDownloadOutlinedIcon />}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2.5,
                  px: 3.5,
                  py: 1.25,
                  boxShadow: (theme) => `0 4px 16px ${alpha(theme.palette.primary.main, 0.35)}`,
                  "&:hover": {
                    boxShadow: (theme) => `0 6px 20px ${alpha(theme.palette.primary.main, 0.45)}`,
                  },
                }}
              >
                Descargar instrucciones de pago
              </Button>
            </Box>

            <Divider />

            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <ReceiptLongOutlinedIcon color="action" fontSize="small" />
                <Typography variant="subtitle2" fontWeight={800}>
                  Envío del comprobante
                </Typography>
              </Stack>

              <TextField
                label="Nota (opcional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                multiline
                minRows={3}
                fullWidth
                size="small"
                placeholder="Ej: Transferencia realizada desde cuenta empresa..."
              />

              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadOutlinedIcon />}
                sx={{ textTransform: "none", justifyContent: "flex-start" }}
              >
                {fileLabel}
                <input
                  hidden
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </Button>

              <FormControlLabel
                sx={{ alignItems: "flex-start", m: 0 }}
                control={
                  <Checkbox
                    checked={acceptedManualValidation}
                    onChange={(e) => setAcceptedManualValidation(e.target.checked)}
                    sx={{ pt: 0.3 }}
                  />
                }
                label={
                  <Typography variant="body2">
                    Entiendo que el saldo <b>no se acreditará automáticamente</b> y que un{" "}
                    <b>Super Administrador</b> debe validar manualmente el comprobante y la
                    recepción del dinero.
                  </Typography>
                }
              />

              {errorMsg && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {errorMsg}
                </Alert>
              )}
            </Stack>
          </Stack>
        )}

        {step === "processing" && (
          <Stack spacing={2} alignItems="center" py={3}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(25,118,210,0.08)",
              }}
            >
              <AccessTimeOutlinedIcon color="primary" sx={{ fontSize: 36 }} />
            </Box>
            <Typography variant="h6" fontWeight={900} textAlign="center">
              Comprobante enviado
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Tu comprobante fue cargado correctamente. La recarga quedó
              <b> pendiente de validación manual</b>.
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Un <b>Super Administrador</b> debe revisar el comprobante y confirmar la recepción
              del dinero antes de acreditar el saldo.
            </Typography>
            <CircularProgress />
          </Stack>
        )}

        {step === "redirecting" && (
          <Stack spacing={2} alignItems="center" py={3}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(46,125,50,0.10)",
              }}
            >
              <CheckCircleOutlineIcon color="success" sx={{ fontSize: 38 }} />
            </Box>
            <Typography variant="h6" fontWeight={900} textAlign="center">
              Solicitud enviada correctamente
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Redirigiendo al historial de balances de la empresa...
            </Typography>
            <CircularProgress size={22} />
          </Stack>
        )}
      </DialogContent>

      {step === "form" && (
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} sx={{ textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={loadingPaymentAction || !file || !acceptedManualValidation}
            sx={{ textTransform: "none" }}
          >
            {loadingPaymentAction ? "Enviando..." : "Enviar comprobante"}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  )
}

export default CompanyTopupBankTransferDialog
