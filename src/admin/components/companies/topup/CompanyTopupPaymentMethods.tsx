import { useState } from "react"
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography,
  Chip,
  Fade,
  alpha,
} from "@mui/material"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined"
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined"
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined"
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined"
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"
import { useNavigate } from "react-router-dom"
import useCompanyTopupPaymentActions from "@/admin/hooks/useCompanyTopupPaymentActions"
import { redirectToWebpay } from "@/admin/hooks/redirectToWebpay"
import CompanyTopupBankTransferDialog from "./CompanyTopupBankTransferDialog"

interface Props {
  sessionId: string
  topupId: string
  amountUsd: number
  amountClp: number
  companyName?: string
  companyId: string
}

const money = (value: number, currency: "USD" | "CLP") =>
  Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ` ${currency}`

type PaymentCardTone = "violet" | "orange" | "green"

const paymentToneMap: Record<
  PaymentCardTone,
  {
    main: string
    dark: string
    lightBg: string
    border: string
    shadow: string
    text: string
  }
> = {
  violet: {
    main: "#7C3AED",
    dark: "#5B21B6",
    lightBg: "#F3E8FF",
    border: "#C4B5FD",
    shadow: "124, 58, 237",
    text: "#5B21B6",
  },
  orange: {
    main: "#F97316",
    dark: "#C2410C",
    lightBg: "#FFF7ED",
    border: "#FDBA74",
    shadow: "249, 115, 22",
    text: "#C2410C",
  },
  green: {
    main: "#16A34A",
    dark: "#166534",
    lightBg: "#F0FDF4",
    border: "#86EFAC",
    shadow: "22, 163, 74",
    text: "#166534",
  },
}

const PaymentOptionCard = ({
  title,
  subtitle,
  icon,
  onClick,
  disabled,
  highlighted,
  tone = "violet",
}: {
  title: string
  subtitle: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
  highlighted?: boolean
  tone?: PaymentCardTone
}) => {
  const colors = paymentToneMap[tone]

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: "1px solid",
        borderColor: highlighted ? alpha(colors.main, 0.35) : "divider",
        bgcolor: highlighted ? alpha(colors.main, 0.08) : "background.paper",
        background: highlighted
          ? `linear-gradient(180deg, ${alpha(colors.main, 0.1)} 0%, ${alpha(colors.main, 0.035)} 100%)`
          : "background.paper",
        transition: "all 0.25s ease",
        cursor: disabled ? "default" : "pointer",
        "&:hover": disabled
          ? {}
          : {
              borderColor: colors.main,
              bgcolor: alpha(colors.main, 0.06),
              transform: "translateY(-2px)",
              boxShadow: `0 8px 24px rgba(${colors.shadow}, 0.15)`,
            },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
      >
        <Box display="flex" gap={2} alignItems="center">
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              background: highlighted
                ? `linear-gradient(135deg, ${colors.main} 0%, ${colors.dark} 100%)`
                : alpha(colors.main, 0.12),
              color: highlighted ? "#fff" : colors.main,
              flexShrink: 0,
              boxShadow: highlighted
                ? `0 4px 14px rgba(${colors.shadow}, 0.35)`
                : `0 2px 10px rgba(${colors.shadow}, 0.12)`,
              transition: "all 0.25s ease",
            }}
          >
            {icon}
          </Box>

          <Box>
            <Typography fontWeight={900} fontSize={17}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {subtitle}
            </Typography>
          </Box>
        </Box>

        <Button
          variant={highlighted ? "contained" : "outlined"}
          onClick={onClick}
          disabled={disabled}
          sx={{
            textTransform: "none",
            borderRadius: 999,
            minWidth: 160,
            fontWeight: 800,
            py: 1.25,
            transition: "all 0.2s ease",
            color: highlighted ? "#fff" : colors.main,
            borderColor: colors.main,
            bgcolor: highlighted ? colors.main : "transparent",
            "&:hover": {
              borderColor: colors.dark,
              bgcolor: highlighted ? colors.dark : alpha(colors.main, 0.08),
              boxShadow: highlighted
                ? `0 6px 20px rgba(${colors.shadow}, 0.35)`
                : "none",
            },
            "&.Mui-disabled": {
              borderColor: alpha(colors.main, 0.25),
            },
          }}
        >
          Seleccionar
        </Button>
      </Stack>
    </Paper>
  )
}

export const CompanyTopupPaymentMethods = ({
  sessionId,
  topupId,
  amountUsd,
  amountClp,
  companyName,
  companyId,
}: Props) => {
  const navigate = useNavigate()
  const [errorMsg, setErrorMsg] = useState("")
  const [openBankTransferDialog, setOpenBankTransferDialog] = useState(false)

  const { startWebpay, startKhipu, startBankTransfer, loadingPaymentAction } =
    useCompanyTopupPaymentActions()

  const onPayWithWebpay = async () => {
    setErrorMsg("")

    try {
      const resp = await startWebpay(sessionId, topupId)
      const responseData = (resp as any)?.data ?? resp

      const url = responseData?.data?.url ?? responseData?.url
      const token = responseData?.data?.token ?? responseData?.token

      if (!url || !token) {
        throw new Error("Webpay no devolvio url o token.")
      }

      redirectToWebpay(url, token)
    } catch (error: any) {
      setErrorMsg(error?.message || "No se pudo iniciar Webpay.")
    }
  }

  const onPayWithKhipu = async () => {
    setErrorMsg("")

    try {
      const resp = await startKhipu(sessionId, topupId)
      const responseData = (resp as any)?.data ?? resp

      const paymentUrl = responseData?.data?.paymentUrl ?? responseData?.paymentUrl

      if (!paymentUrl) {
        throw new Error("Khipu no devolvio URL de pago.")
      }

      window.location.href = paymentUrl
    } catch (error: any) {
      setErrorMsg(error?.message || "No se pudo iniciar Khipu.")
    }
  }

  const onPayWithBankTransfer = async () => {
    setErrorMsg("")

    try {
      const resp = await startBankTransfer(sessionId, topupId)
      const responseData = (resp as any)?.data ?? resp
      const data = responseData?.data ?? responseData

      if (!data) {
        throw new Error("No se pudo iniciar la transferencia bancaria.")
      }

      setOpenBankTransferDialog(true)
    } catch (error: any) {
      setErrorMsg(error?.message || "No se pudo iniciar la transferencia bancaria.")
    }
  }

  return (
    <>
      <Fade in timeout={400}>
        <Stack direction={{ xs: "column", lg: "row" }} spacing={3}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 4,
              flex: 1.2,
              border: "1px solid",
              borderColor: (theme) => alpha(theme.palette.divider, 0.6),
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${theme.palette.background.paper} 40%)`
                  : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${theme.palette.background.paper} 40%)`,
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -80,
                right: -80,
                width: 250,
                height: 250,
                borderRadius: "50%",
                background: (theme) =>
                  `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />

            <Box position="relative">
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                mb={2.5}
              >
                <Box display="flex" gap={1.5} alignItems="center">

                  <Box>
                    <Typography variant="h5" fontWeight={900} lineHeight={1.1}>
                      Elegi como pagar
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      Selecciona el medio para completar la acreditacion del balance.
                    </Typography>
                  </Box>
                </Box>

                <Chip
                  icon={<BoltOutlinedIcon sx={{ fontSize: 16 }} />}
                  label="Paso final"
                  sx={{
                    borderRadius: 999,
                    fontWeight: 700,
                    bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                    color: "success.dark",
                    border: "none",
                    px: 0.5,
                  }}
                />
              </Stack>

              <Divider sx={{ mb: 3, opacity: 0.6 }} />

              <Stack spacing={2}>
                <PaymentOptionCard
                  title="Pagar con Khipu"
                  subtitle="Transferencia o pago bancario con confirmacion de pasarela."
                  icon={<AccountBalanceWalletOutlinedIcon />}
                  onClick={onPayWithKhipu}
                  disabled={loadingPaymentAction}
                  highlighted
                  tone="violet"
                />

                <PaymentOptionCard
                  title="Pagar con Webpay"
                  subtitle="Pago con tarjeta o billetera virtual a traves de Webpay."
                  icon={<AccountBalanceWalletOutlinedIcon />}
                  onClick={onPayWithWebpay}
                  disabled={loadingPaymentAction}
                  tone="orange"
                />

                <PaymentOptionCard
                  title="Transferencia bancaria"
                  subtitle="Subi el comprobante y quedara pendiente de validacion manual por un Super Admininstrador."
                  icon={<AccountBalanceIcon />}
                  onClick={onPayWithBankTransfer}
                  disabled={loadingPaymentAction}
                  tone="green"
                />
              </Stack>

              {errorMsg ? (
                <Alert
                  severity="error"
                  sx={{
                    mt: 2.5,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: (theme) => alpha(theme.palette.error.main, 0.3),
                  }}
                >
                  {errorMsg}
                </Alert>
              ) : null}

              <Paper
                elevation={0}
                sx={{
                  mt: 2.5,
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: (theme) => alpha(theme.palette.background.default, 0.6),
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography fontWeight={800} mb={1.5}>
                  Que sucede despues
                </Typography>

                <Stack spacing={1.5}>
                  {[
                    {
                      icon: <CheckCircleOutlineIcon color="success" />,
                      text: "Vas a ser redirigido a la pasarela elegida o se abrira el flujo de transferencia.",
                    },
                    {
                      icon: <CheckCircleOutlineIcon color="success" />,
                      text: "Cuando el pago quede confirmado, el balance se acreditara a la empresa.",
                    },
                    {
                      icon: <SecurityOutlinedIcon color="action" />,
                      text: (
                        <>
                          Si elegis transferencia bancaria, el saldo <b>no se acredita automaticamente</b>. Un{" "}
                          <b>Super Admininstrador</b> debe validar el comprobante y confirmar la recepcion del dinero.
                        </>
                      ),
                    },
                  ].map((item, i) => (
                    <Box key={i} display="flex" gap={1.25} alignItems="flex-start">
                      <Box sx={{ mt: "2px", display: "flex", flexShrink: 0 }}>
                        {item.icon}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {item.text}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>

              <Box mt={3}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate(-1)}
                  disabled={loadingPaymentAction}
                  sx={{
                    textTransform: "none",
                    borderRadius: 3,
                    px: 2.5,
                    py: 1.25,
                    fontWeight: 700,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateX(-2px)",
                    },
                  }}
                >
                  Atras
                </Button>
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 4,
              flex: 0.9,
              position: "relative",
              overflow: "hidden",
              border: "1px solid",
              borderColor: (theme) => alpha(theme.palette.divider, 0.6),
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? `linear-gradient(180deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${theme.palette.background.paper} 45%)`
                  : `linear-gradient(180deg, ${alpha(theme.palette.success.main, 0.06)} 0%, ${theme.palette.background.paper} 45%)`,
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: (theme) => alpha(theme.palette.success.main, 0.25),
              },
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: (theme) =>
                  `radial-gradient(circle, ${alpha(theme.palette.success.main, 0.12)} 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />

            <Box position="relative">
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 800, letterSpacing: 0.8, textTransform: "uppercase" }}
              >
                Confirmacion de recarga
              </Typography>

              <Box
                mt={2}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: (theme) => alpha(theme.palette.background.paper, 0.85),
                  backdropFilter: "blur(8px)",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 3,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: (theme) => alpha(theme.palette.success.main, 0.12),
                      color: "success.main",
                      border: "1px solid",
                      borderColor: (theme) => alpha(theme.palette.success.main, 0.22),
                      transition: "all 0.2s ease",
                      flexShrink: 0,
                    }}
                  >
                    <BusinessOutlinedIcon />
                  </Box>

                  <Box minWidth={0} flex={1}>
                    <Typography variant="body2" color="text.secondary">
                      Empresa
                    </Typography>
                    <Typography
                      fontWeight={900}
                      sx={{
                        lineHeight: 1.2,
                        wordBreak: "break-word",
                      }}
                    >
                      {companyName?.trim() || "Empresa no disponible"}
                    </Typography>
                  </Box>
                </Stack>

                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: "background.default",
                    border: "1px dashed",
                    borderColor: (theme) => alpha(theme.palette.success.main, 0.3),
                  }}
                >
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Monto a acreditar
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 950,
                      lineHeight: 1.05,
                      mt: 0.5,
                      background: (theme) =>
                        `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {money(amountUsd, "USD")}
                  </Typography>

                  <Divider sx={{ my: 2, opacity: 0.6 }} />

                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Monto estimado a cobrar
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>
                    {money(amountClp, "CLP")}
                  </Typography>
                </Box>
              </Box>

              <Alert
                severity="warning"
                sx={{
                  mt: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: (theme) => alpha(theme.palette.warning.main, 0.3),
                }}
              >
                El saldo se acreditara una vez que el pago quede confirmado o validado.
              </Alert>

              {loadingPaymentAction ? (
                <Box
                  mt={2}
                  display="flex"
                  alignItems="center"
                  gap={1.5}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                    border: "1px solid",
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                  }}
                >
                  <CircularProgress size={20} />
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Iniciando pago...
                  </Typography>
                </Box>
              ) : null}
            </Box>
          </Paper>
        </Stack>
      </Fade>

      <CompanyTopupBankTransferDialog
        open={openBankTransferDialog}
        onClose={() => setOpenBankTransferDialog(false)}
        topupId={topupId}
        companyId={companyId || ""}
      />
    </>
  )
}

export default CompanyTopupPaymentMethods