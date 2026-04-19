import React, { useState } from "react"
import {
  alpha,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import Fade from "@mui/material/Fade"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import HighlightOffIcon from "@mui/icons-material/HighlightOff"
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"
import { useNotiAlert } from "@/shared/hooks"
import useCompanyTopupActions from "@/admin/hooks/useCompanyTopupBankTransferActions"
import {
  CompanyTopupProvider,
  CompanyTopupStatus,
  ICompanyTopup,
} from "@/admin/utils/interfaces/company-topup.interface"
import { formatterDateDDMMYYYY } from "@/shared/helpers/handligDateHelper"

interface Props {
  open: boolean
  payment: ICompanyTopup | null
  onClose: () => void
  onRefresh: () => void
  getProviderLabel: (provider?: CompanyTopupProvider | null) => string
  getStatusLabel: (status?: CompanyTopupStatus | null) => string
  getStatusChipProps: (status?: CompanyTopupStatus | null) => {
    label: string
    color: "success" | "warning" | "error" | "default"
    variant: "filled" | "outlined"
  }
}

const modernButtonSx = {
  borderRadius: 2,
  textTransform: "none",
  fontWeight: 500,
  px: 2,
  py: 0.9,
  boxShadow: "none",
  "&:hover": {
    boxShadow: "none",
  },
}

const InfoRow = ({ label, value }: { label: string; value?: React.ReactNode }) => {
  return (
    <Box
      sx={{
        py: 1.25,
        px: 1.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.4px",
          fontSize: "0.68rem",
        }}
      >
        {label}
      </Typography>

      <Box mt={0.5}>
        {typeof value === "string" || typeof value === "number" ? (
          <Typography variant="body2" fontWeight={500}>
            {value || "-"}
          </Typography>
        ) : (
          value || <Typography variant="body2">-</Typography>
        )}
      </Box>
    </Box>
  )
}

export const CompanyTopupDetailDialog = ({
  open,
  payment,
  onClose,
  onRefresh,
  getProviderLabel,
  getStatusLabel,
  getStatusChipProps,
}: Props) => {
  const { snackBarAlert } = useNotiAlert()
  const { confirmBankTransfer, rejectBankTransfer, loadingAction } = useCompanyTopupActions()

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  const handleConfirm = async () => {
    if (!payment) return

    const resp = await confirmBankTransfer(payment.id)
    if (!resp?.ok) return

    snackBarAlert("Transferencia confirmada correctamente", { variant: "success" })
    setConfirmOpen(false)
    onClose()
    onRefresh()
  }

  const handleReject = async () => {
    if (!payment) return
    if (!rejectReason.trim()) {
      snackBarAlert("Debes ingresar un motivo de rechazo", { variant: "warning" })
      return
    }

    const resp = await rejectBankTransfer(payment.id, rejectReason.trim())
    if (!resp?.ok) return

    snackBarAlert("Transferencia rechazada correctamente", { variant: "success" })
    setRejectOpen(false)
    setRejectReason("")
    onClose()
    onRefresh()
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="md"
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "none",
            border: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "background.paper",
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.10),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "primary.main",
              }}
            >
              <ReceiptLongIcon />
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={700}>
                Detalle del pago
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Información completa de la transacción
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          {payment && (
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                  Información general
                </Typography>

                <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={1.5}>
                  <InfoRow label="Empresa" value={payment.company?.name ?? payment.companyId} />
                  <InfoRow label="Creado por" value={payment.createdByUser?.email ?? payment.createdByUserId ?? "-"} />
                  <InfoRow label="Proveedor" value={getProviderLabel(payment.provider)} />
                  <InfoRow
                    label="Estado"
                    value={
                      <Chip
                        label={getStatusLabel(payment.status)}
                        color={getStatusChipProps(payment.status).color}
                        variant={getStatusChipProps(payment.status).variant}
                        size="small"
                        sx={{ borderRadius: 2, fontWeight: 500 }}
                      />
                    }
                  />
                  <InfoRow label="Monto USD" value={`${Number(payment.amountUsd ?? 0).toFixed(2)} USD`} />
                  <InfoRow label="Monto CLP" value={`${Number(payment.amountClp ?? 0).toLocaleString("es-CL")} CLP`} />
                  <InfoRow label="Fecha creación" value={formatterDateDDMMYYYY(payment.createdAt)} />
                  <InfoRow label="Buy Order" value={payment.buyOrder ?? "No disponible"} />
                  <InfoRow label="Transaction ID" value={payment.transactionId ?? "No disponible"} />
                  <InfoRow label="Balance aplicado" value={payment.balanceApplied ? "Sí" : "No"} />
                  <InfoRow label="Paid At" value={payment.paidAt ? formatterDateDDMMYYYY(payment.paidAt) : "No disponible"} />
                  <InfoRow label="Rejected At" value={payment.rejectedAt ? formatterDateDDMMYYYY(payment.rejectedAt) : "No disponible"} />
                </Box>
              </Box>

              {payment.provider === CompanyTopupProvider.BANK_TRANSFER && (
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                    Transferencia bancaria
                  </Typography>

                  <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }} gap={1.5}>
                    <InfoRow label="Referencia" value={payment.bankTransferReference ?? "No disponible"} />
                    <InfoRow label="Nota" value={payment.bankTransferNote ?? "No disponible"} />
                    <InfoRow
                      label="Comprobante"
                      value={
                        payment.bankTransferReceiptUrl ? (
                          <Button
                            variant="outlined"
                            href={payment.bankTransferReceiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            size="small"
                            sx={modernButtonSx}
                          >
                            Ver comprobante
                          </Button>
                        ) : (
                          "-"
                        )
                      }
                    />
                    <InfoRow label="Motivo de rechazo" value={payment.rejectionReason ?? "No disponible"} />
                  </Box>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          {payment?.provider === CompanyTopupProvider.BANK_TRANSFER &&
            payment?.status === CompanyTopupStatus.PENDING_BANK_TRANSFER && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleOutlineIcon />}
                  onClick={() => setConfirmOpen(true)}
                  sx={modernButtonSx}
                >
                  Confirmar
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  startIcon={<HighlightOffIcon />}
                  onClick={() => {
                    setRejectReason("")
                    setRejectOpen(true)
                  }}
                  sx={modernButtonSx}
                >
                  Rechazar
                </Button>
              </>
            )}

          <Button onClick={onClose} sx={{ ...modernButtonSx, ml: "auto" }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Confirmar transferencia</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            ¿Estás seguro de que querés confirmar esta transferencia bancaria?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} sx={modernButtonSx}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirm}
            disabled={loadingAction}
            sx={modernButtonSx}
          >
            {loadingAction ? "Procesando..." : "Sí, confirmar"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Rechazar transferencia</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body2">
              ¿Estás seguro de que querés rechazar esta transferencia bancaria?
            </Typography>

            <TextField
              label="Motivo del rechazo"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              multiline
              minRows={4}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)} sx={modernButtonSx}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleReject}
            disabled={loadingAction || !rejectReason.trim()}
            sx={modernButtonSx}
          >
            {loadingAction ? "Procesando..." : "Sí, rechazar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default CompanyTopupDetailDialog