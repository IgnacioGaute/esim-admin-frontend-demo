import { useMemo, useState } from "react"
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  Chip,
  Fade,
  alpha,
} from "@mui/material"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import PaymentsIcon from "@mui/icons-material/Payments"
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined"
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined"
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined"
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined"
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined"
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined"
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined"
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined"
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined"
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined"

import useCreateCompanyTopupCheckout from "@/admin/hooks/useCreateCompanyTopupCheckout"
import { useNavigate } from "react-router-dom"
import { useFetch } from "@/shared/hooks"
import { ICompanyData } from "@/admin/utils/interfaces/company-data.interface"

interface Props {
  companyId: string
  onBack: () => void
}

const PRESET_AMOUNTS = [20, 50, 80, 100, 150, 200]

const currencyPreview = (value: number) =>
  Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

const paymentLabel = (v: ICompanyData["paymentType"]) => {
  if (!v) return "-"
  if (v === "PRE_PAYMENT") return "Prepago"
  if (v === "POST_PAYMENT") return "Postpago"
  return String(v)
}

const PreviewRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value?: string | number | null
}) => (
  <Box
    display="flex"
    gap={1.5}
    alignItems="flex-start"
    sx={{
      p: 1.25,
      borderRadius: 2,
      transition: "all 0.2s ease",
      "&:hover": {
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
      },
    }}
  >
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: 2,
        display: "grid",
        placeItems: "center",
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
        color: "primary.main",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>

    <Box minWidth={0}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 600, letterSpacing: 0.3, textTransform: "uppercase", fontSize: 10 }}
      >
        {label}
      </Typography>
      <Typography fontWeight={700} sx={{ wordBreak: "break-word" }}>
        {value ?? "-"}
      </Typography>
    </Box>
  </Box>
)

const StepItem = ({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) => (
  <Box display="flex" gap={1.5} alignItems="flex-start">
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        background: (theme) =>
          `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: "primary.contrastText",
        fontSize: 13,
        fontWeight: 800,
        flexShrink: 0,
        boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
      }}
    >
      {number}
    </Box>

    <Box>
      <Typography fontWeight={800} fontSize={14}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Box>
  </Box>
)

export const CompanyTopupForm = ({ companyId, onBack }: Props) => {
  const navigate = useNavigate()
  const [amount, setAmount] = useState<string>("")
  const [errorMsg, setErrorMsg] = useState<string>("")

  const { createCheckout, loadingCheckout } = useCreateCompanyTopupCheckout()

  const { data: company, loading: loadingCompany } = useFetch<ICompanyData>(
    `companies/${companyId}`,
    "GET",
    {
      init: Boolean(companyId),
      cache: { enabled: false },
    }
  )

  const parsedAmount = useMemo(() => Number(amount), [amount])
  const isValidAmount = PRESET_AMOUNTS.includes(parsedAmount)

  const handleSelectAmount = (value: number) => {
    setAmount(String(value))
    setErrorMsg("")
  }

  const handleSubmit = async () => {
    setErrorMsg("")

    if (!companyId) {
      setErrorMsg("No se encontro la compania.")
      return
    }
    try {
      const resp = await createCheckout({
        companyId,
        amount: parsedAmount,
      })

      const responseData = (resp as any)?.data ?? resp

      const urlAccess =
        responseData?.data?.url_access ??
        responseData?.url_access

      if (!urlAccess) {
        throw new Error("No se pudo generar el checkout.")
      }

      if (/^https?:\/\//i.test(urlAccess)) {
        window.location.href = urlAccess
      } else {
        navigate(urlAccess)
      }
    } catch (error: any) {
      setErrorMsg(error?.message || "Ocurrio un error al iniciar el checkout.")
    }
  }

  return (
    <Fade in timeout={400}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={7.5}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 4,
              height: "100%",
              position: "relative",
              overflow: "hidden",
              border: "1px solid",
              borderColor: (theme) => alpha(theme.palette.divider, 0.6),
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${theme.palette.background.paper} 40%)`
                  : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${theme.palette.background.paper} 40%)`,
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                boxShadow: (theme) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.08)}`,
              },
            }}
          >
            {/* Decorative background circle */}
            <Box
              sx={{
                position: "absolute",
                top: -60,
                right: -60,
                width: 200,
                height: 200,
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
                      Agregar balance
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                      Define el monto que queres acreditar a la empresa y continua al checkout.
                    </Typography>
                  </Box>
                </Box>

                <Chip
                  icon={<BoltOutlinedIcon sx={{ fontSize: 16 }} />}
                  label="Acreditacion simple"
                  sx={{
                    borderRadius: 999,
                    fontWeight: 700,
                    bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                    color: "warning.dark",
                    border: "none",
                    px: 0.5,
                  }}
                />
              </Stack>

                            {/* Process steps */}
              <Box
                mt={2.5}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: "1px dashed",
                  borderColor: (theme) => alpha(theme.palette.divider, 0.8),
                  bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
                }}
              >
                <Typography fontWeight={800} mb={2}>
                  Como sigue el proceso
                </Typography>

                <Stack spacing={2}>
                  <StepItem
                    number="1"
                    title="Elegí el monto"
                    description="Seleccioná uno de los montos disponibles en USD."
                  />
                  <StepItem
                    number="2"
                    title="Elegi la pasarela"
                    description="En el siguiente paso selecciona Khipu, Webpay o transferencia bancaria."
                  />
                  <StepItem
                    number="3"
                    title="Se acredita el balance"
                    description="La empresa recibe el saldo cuando el pago quede confirmado."
                  />
                </Stack>
              </Box>
                            {/* Feature cards */}
              <Grid container spacing={2} mt={0.5}>
                {[
                  {
                    icon: <SecurityOutlinedIcon />,
                    title: "Pago seguro",
                    desc: "Vas a poder elegir la pasarela antes de confirmar.",
                    color: "success",
                  },
                  {
                    icon: <TrendingUpOutlinedIcon />,
                    title: "Balance usable",
                    desc: "El saldo acreditado queda disponible para operar en la cuenta.",
                    color: "info",
                  },
                  {
                    icon: <AttachMoneyOutlinedIcon />,
                    title: "Montos fijos",
                    desc: "Elegí entre los montos disponibles para la recarga.",
                    color: "warning",
                  },
                ].map((item) => (
                  <Grid item xs={12} sm={4} key={item.title}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        height: "100%",
                        border: "1px solid",
                        borderColor: "divider",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: (theme) =>
                            alpha((theme.palette as any)[item.color].main, 0.4),
                          bgcolor: (theme) =>
                            alpha((theme.palette as any)[item.color].main, 0.04),
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" mb={0.75}>
                        <Box
                          sx={{
                            color: `${item.color}.main`,
                            display: "flex",
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Typography fontWeight={800} fontSize={14}>
                          {item.title}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {item.desc}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ mb: 3, opacity: 0.6 }} />
              

              {/* Amount selection */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: (theme) => alpha(theme.palette.background.default, 0.6),
                  border: "1px solid",
                  borderColor: isValidAmount
                    ? (theme) => alpha(theme.palette.primary.main, 0.35)
                    : "divider",
                  transition: "all 0.2s ease",
                }}
              >
                <Typography variant="body2" color="text.secondary" fontWeight={600} mb={2}>
                  Seleccioná el monto a cargar (USD)
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {PRESET_AMOUNTS.map((value) => {
                    const selected = parsedAmount === value
                    return (
                      <Button
                        key={value}
                        variant={selected ? "contained" : "outlined"}
                        onClick={() => handleSelectAmount(value)}
                        sx={{
                          textTransform: "none",
                          borderRadius: 999,
                          px: 2.5,
                          py: 1.1,
                          fontWeight: 800,
                          fontSize: "0.95rem",
                          transition: "all 0.2s ease",
                          ...(selected
                            ? {
                                boxShadow: (theme) =>
                                  `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                              }
                            : {
                                "&:hover": {
                                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                  borderColor: "primary.main",
                                },
                              }),
                        }}
                      >
                        USD {currencyPreview(value)}
                      </Button>
                    )
                  })}
                </Stack>
              </Box>

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

              <Box
                mt={3}
                display="flex"
                justifyContent="space-between"
                gap={1.5}
                flexWrap="wrap"
              >
                <Button
                  variant="outlined"
                  onClick={onBack}
                  startIcon={<ArrowBackIcon />}
                  disabled={loadingCheckout}
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
                  Volver
                </Button>

                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  endIcon={
                    loadingCheckout ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <ArrowForwardIcon />
                    )
                  }
                  disabled={loadingCheckout || !isValidAmount}
                  sx={{
                    textTransform: "none",
                    borderRadius: 3,
                    px: 3,
                    py: 1.25,
                    fontWeight: 800,
                    boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: (theme) => `0 6px 20px ${alpha(theme.palette.primary.main, 0.45)}`,
                    },
                  }}
                >
                  {loadingCheckout ? "Creando checkout..." : "Continuar al checkout"}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Preview panel */}
        <Grid item xs={12} md={4.5}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 3 },
              borderRadius: 4,
              height: "100%",
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
            {/* Decorative circle */}
            <Box
              sx={{
                position: "absolute",
                top: -70,
                right: -70,
                width: 220,
                height: 220,
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
                Vista previa
              </Typography>

              <Box
                mt={2}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: (theme) =>
                    alpha(theme.palette.background.paper, 0.85),
                  backdropFilter: "blur(8px)",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: 3,
                      display: "grid",
                      placeItems: "center",
                      background: (theme) =>
                        `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                      color: "success.contrastText",
                      boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.success.main, 0.35)}`,
                    }}
                  >
                    <AccountBalanceWalletOutlinedIcon />
                  </Box>

                  <Box minWidth={0}>
                    <Typography fontWeight={900}>Datos de la empresa</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Confirma la informacion antes de continuar.
                    </Typography>
                  </Box>
                </Stack>

                <Chip
                  size="small"
                  label={
                    loadingCompany
                      ? "Cargando empresa..."
                      : company?.name || "Empresa"
                  }
                  sx={{
                    borderRadius: 999,
                    fontWeight: 700,
                    mb: 2,
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main",
                  }}
                />

                <Stack spacing={0.5}>
                  <PreviewRow
                    icon={<BusinessOutlinedIcon sx={{ fontSize: 18 }} />}
                    label="Empresa"
                    value={loadingCompany ? "Cargando..." : company?.name || "-"}
                  />

                  <PreviewRow
                    icon={<BadgeOutlinedIcon sx={{ fontSize: 18 }} />}
                    label="RUT"
                    value={loadingCompany ? "Cargando..." : company?.rut ?? "-"}
                  />

                  <PreviewRow
                    icon={<LocationOnOutlinedIcon sx={{ fontSize: 18 }} />}
                    label="Direccion"
                    value={loadingCompany ? "Cargando..." : company?.address || "-"}
                  />

                  <PreviewRow
                    icon={<LocationOnOutlinedIcon sx={{ fontSize: 18 }} />}
                    label="Ciudad / Pais"
                    value={
                      loadingCompany
                        ? "Cargando..."
                        : [company?.city, company?.country].filter(Boolean).join(", ") || "-"
                    }
                  />

                  <PreviewRow
                    icon={<CreditCardOutlinedIcon sx={{ fontSize: 18 }} />}
                    label="Tipo de pago"
                    value={
                      loadingCompany
                        ? "Cargando..."
                        : paymentLabel(company?.paymentType ?? null)
                    }
                  />

                  <PreviewRow
                    icon={<LanguageOutlinedIcon sx={{ fontSize: 18 }} />}
                    label="Website"
                    value={loadingCompany ? "Cargando..." : company?.website || "-"}
                  />
                </Stack>

                {/* Amount preview */}
                <Box
                  mt={2.5}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: "background.default",
                    border: "1px dashed",
                    borderColor: (theme) => alpha(theme.palette.success.main, 0.3),
                  }}
                >
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    Balance a acreditar
                  </Typography>

                  <Box display="flex" alignItems="baseline" gap={1} mt={0.75}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 950,
                        lineHeight: 1,
                        wordBreak: "break-word",
                        background: (theme) =>
                          `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: isValidAmount ? "transparent" : "inherit",
                        color: isValidAmount ? "transparent" : "text.disabled",
                      }}
                    >
                      {currencyPreview(isValidAmount ? parsedAmount : 0)}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ fontWeight: 800 }}
                    >
                      USD
                    </Typography>
                  </Box>
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
                El saldo se acreditara a la empresa una vez que la pasarela confirme el pago.
              </Alert>

              <Paper
                elevation={0}
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 3,
                  bgcolor: "background.default",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography fontWeight={800} mb={1.25}>
                  Antes de continuar
                </Typography>

                <Stack spacing={1}>
                  {[
                    "Revisa que el monto este correcto.",
                    "Valida que los datos de la empresa sean correctos.",
                    "En el siguiente paso elegis el medio de pago.",
                  ].map((text, i) => (
                    <Typography key={i} variant="body2" color="text.secondary">
                      • {text}
                    </Typography>
                  ))}
                </Stack>
              </Paper>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Fade>
  )
}

export default CompanyTopupForm
