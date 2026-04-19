import { useMemo, useState } from "react"
import { Formik, FieldArray } from "formik"
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Grid,
  TextField,
  MenuItem,
  Typography,
  Divider,
  IconButton,
  Paper,
  InputAdornment,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ListItemIcon,
  ListItemText,
  Tooltip,
  alpha,
} from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Save from "@mui/icons-material/Save"
import Add from "@mui/icons-material/Add"
import DeleteOutline from "@mui/icons-material/DeleteOutline"
import RemoveIcon from "@mui/icons-material/Remove"
import AddIcon from "@mui/icons-material/Add"
import { VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material"
import CameraAltOutlined from "@mui/icons-material/CameraAltOutlined"

import LinkedInIcon from "@mui/icons-material/LinkedIn"
import InstagramIcon from "@mui/icons-material/Instagram"
import FacebookIcon from "@mui/icons-material/Facebook"
import YouTubeIcon from "@mui/icons-material/YouTube"
import TwitterIcon from "@mui/icons-material/Twitter"
import LinkIcon from "@mui/icons-material/Link"

import { LayerCardForm } from "../LayerCardForm"
import { FormCompanyShema } from "@/admin/utils/shemas/FormCompanyShema"
import { CompanyFormValues, CompanyUserForm } from "@/admin/utils/interfaces/company-user-data.interface"

import { Alert, Link as MuiLink } from "@mui/material"
import { useNavigate } from "react-router-dom"
import { PhoneField } from "./PhoneField"


export enum SocialPlatform {
  LINKEDIN = "LINKEDIN",
  INSTAGRAM = "INSTAGRAM",
  FACEBOOK = "FACEBOOK",
  X = "X",
  YOUTUBE = "YOUTUBE",
  OTHER = "OTHER",
}

const COUNTRY_OPTIONS: string[] = [
  "Argentina",
  "Chile",
  "Uruguay",
  "Paraguay",
  "Bolivia",
  "Brasil",
  "Peru",
  "Ecuador",
  "Colombia",
  "Venezuela",
  "Mexico",
  "USA",
  "Canada",
  "Espana",
  "Portugal",
  "Italia",
  "Francia",
  "Alemania",
  "Reino Unido",
]


export type SocialLink = {
  platform: SocialPlatform
  url: string
}

type ExistingUserOption = {
  id: string
  name: string
  email: string
  type: "ADMIN" | "SELLER" | "SUPER_ADMIN"
  amount?: number
  phone?: string
}

type UserRowMode = "CREATE" | "SELECT"

interface Props {
  dataForm?: Partial<CompanyFormValues> & { amount?: number; photoUrl?: string | null }
  title?: string
  onBack: () => void
  onSubmit: (values: CompanyFormValues & { amount?: number }, photoFile?: File | null) => void
  loading?: boolean
  showInputBalance?: boolean
  existingUsers?: ExistingUserOption[]
}

type CompanyUserFormRuntime = CompanyUserForm & { mode?: UserRowMode; phone?: string }

const emptyUser = (): CompanyUserFormRuntime =>
  ({
    id: "",
    mode: "CREATE",
    name: "",
    email: "",
    phone: "",
    password: "",
    type: "ADMIN",
    amount: 0,
  } as any)

const uiRoleLower = (t?: string) => {
  const r = String(t ?? "").toUpperCase()
  if (r === "SUPER_ADMIN") return "super_admin"
  if (r === "SELLER") return "user"
  return "admin"
}

const fromUiRoleLower = (ui: "Administrador" | "Usuario" | "Super Administrador") => {
  if (ui === "Super Administrador") return "SUPER_ADMIN"
  if (ui === "Usuario") return "SELLER"
  return "ADMIN"
}

const roleChipLabelLower = (t?: string) => {
  const r = String(t ?? "").toUpperCase()
  if (r === "SUPER_ADMIN") return "Super Administrador"
  if (r === "SELLER") return "Usuario"
  if (r === "ADMIN") return "Administrador"
  return (t ?? "-").toLowerCase()
}

const platformLabel: Record<SocialPlatform, string> = {
  [SocialPlatform.LINKEDIN]: "LinkedIn",
  [SocialPlatform.INSTAGRAM]: "Instagram",
  [SocialPlatform.FACEBOOK]: "Facebook",
  [SocialPlatform.X]: "X",
  [SocialPlatform.YOUTUBE]: "YouTube",
  [SocialPlatform.OTHER]: "Otra",
}

const platformIcon = (p: SocialPlatform) => {
  switch (p) {
    case SocialPlatform.LINKEDIN:
      return <LinkedInIcon fontSize="small" />
    case SocialPlatform.INSTAGRAM:
      return <InstagramIcon fontSize="small" />
    case SocialPlatform.FACEBOOK:
      return <FacebookIcon fontSize="small" />
    case SocialPlatform.YOUTUBE:
      return <YouTubeIcon fontSize="small" />
    case SocialPlatform.X:
      return <TwitterIcon fontSize="small" />
    default:
      return <LinkIcon fontSize="small" />
  }
}

// Estilos modernos reutilizables
const modernPaperSx = {
  p: 2.5,
  borderRadius: 3,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    borderColor: alpha("#1976d2", 0.3),
    boxShadow: `0 4px 20px ${alpha("#1976d2", 0.08)}`,
  },
}

const modernTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: alpha("#1976d2", 0.5),
      },
    },
    "&.Mui-focused": {
      boxShadow: `0 0 0 3px ${alpha("#1976d2", 0.12)}`,
    },
  },
}

const modernButtonSx = {
  textTransform: "none",
  borderRadius: 2,
  fontWeight: 600,
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-1px)",
  },
}

export const CompanyFormNewAndEdit = ({
  dataForm,
  title = "Agregar Empresa",
  loading = false,
  onBack,
  onSubmit,
  showInputBalance = true,
  existingUsers = [],
}: Props) => {
  const isCreate = !(dataForm as any)?.id

  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)
  const [showPassByIdx, setShowPassByIdx] = useState<Record<number, boolean>>({})

  const navigate = useNavigate()

  const goToUsers = () => navigate("/admin/users")

  const [amountDeltaByIdx, setAmountDeltaByIdx] = useState<Record<number, number>>({})

  const [openAddBalanceUser, setOpenAddBalanceUser] = useState(false)
  const [addAmountUser, setAddAmountUser] = useState<string>("0")
  const [balanceActionUser, setBalanceActionUser] = useState<"add" | "subtract">("add")
  const [activeIdx, setActiveIdx] = useState<number | null>(null)

  const [quickUser, setQuickUser] = useState<{ idx: number; label: string } | null>(null)
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  const existingUserById = useMemo(() => {
    const map = new Map<string, ExistingUserOption>()
    existingUsers.forEach((u) => map.set(u.id, u))
    return map
  }, [existingUsers])

  const formInit = useMemo<CompanyFormValues>(() => {
    return {
      name: "",
      rut: null,
      address: null,
      city: null,
      country: null,
      commercialTour: null,
      paymentType: "POST_PAYMENT",
      website: null,
      socialMedia:
        Array.isArray((dataForm as any)?.socialMedia) && (dataForm as any).socialMedia.length > 0
          ? ((dataForm as any).socialMedia as any)
          : [],
      users: Array.isArray((dataForm as any)?.users)
        ? (dataForm as any).users.map((u: any) => ({
            ...u,
            id: u.id ?? "",
            mode: "CREATE",
            password: u.password ?? "",
            phone: u.phone ?? null,
          }))
        : [],
      ...(dataForm as any),
    }
  }, [dataForm])

  const onHandleSubmit = (values: CompanyFormValues) => {
  const usersPrepared = (values.users ?? []).map((u: any, idx: number) => {
    const mode: UserRowMode = (u?.mode ?? "CREATE") as UserRowMode
    const id = String(u?.id ?? "").trim()
    const delta = Number(amountDeltaByIdx[idx] ?? 0)

    const phone = String(u?.phone ?? "").trim()
    const phoneOut = phone.length ? phone : null

    if (mode === "SELECT" && id) {
      return { id, amount: delta, phone: phoneOut }
    }

    const out: any = {
      id: id || undefined,
      name: u.name,
      email: u.email,
      phone: phoneOut,
      type: u.type,
      amount: delta,
    }

    if (u.password && String(u.password).trim() !== "") {
      out.password = u.password
    }

    return out
  })

    const submitValues: any = {
      ...values,
      amount: 0,
      users: usersPrepared as any,
    }
    if (photoPreviewUrl === '__remove__') {
      submitValues.photoUrl = null
    }

    onSubmit(submitValues, photoFile)

    setAmountDeltaByIdx({})
    setActiveIdx(null)
    setQuickUser(null)
    setExpandedIdx(null)
  }

  const normalizeWebsite = (input: string) => {
  const raw = String(input ?? "").trim();
  if (!raw) return "";

  if (raw === "http://" || raw === "https://") return "";

  if (/^https?:\/\//i.test(raw)) {
    return raw.replace(/^http:\/\//i, "https://");
  }

  if (/^\/\//.test(raw)) {
    return `https:${raw}`;
  }

  return `https://${raw}`;
};

const prettifyWebsiteExample = "Ej: midominio.cl";


  return (
    <LayerCardForm title={title} loading={loading} onBack={onBack}>
      <Formik initialValues={formInit} validationSchema={FormCompanyShema} onSubmit={onHandleSubmit} enableReinitialize>
        {({ handleChange, handleSubmit, values, errors, touched, setFieldValue }) => {
          const usersIndexed = (values.users ?? []).map((u: any, idx: number) => ({ u, idx }))

          const quickOptions = usersIndexed
            .map(({ u, idx }) => {
              const mode: UserRowMode = (u?.mode ?? "CREATE") as UserRowMode
              const id = String(u?.id ?? "").trim()
              const picked = id ? existingUserById.get(id) ?? null : null

              const label =
                mode === "SELECT"
                  ? picked
                    ? `${picked.name} (${picked.email})`
                    : `Usuario existente #${idx + 1} (sin seleccionar)`
                  : (String(u?.name ?? "").trim() || String(u?.email ?? "").trim())
                  ? `${String(u?.name ?? "").trim() || "Usuario"}${u?.email ? ` (${u.email})` : ""}`
                  : `Usuario #${idx + 1}`

              return { idx, label }
            })
            .filter((o) => Boolean(o.label))

          const openUserDeltaDialog = (idx: number, action: "add" | "subtract") => {
            setActiveIdx(idx)
            setBalanceActionUser(action)
            setAddAmountUser("0")
            setOpenAddBalanceUser(true)
            setExpandedIdx(idx)
          }

          const companyBalance = Number((dataForm as any)?.amount ?? 0)
          const companyBalancePretty = Number.isFinite(companyBalance)
            ? companyBalance.toLocaleString("en-US", { maximumFractionDigits: 2 })
            : "0.00"
          const labelWithRedStarIfEmpty = (label: string, value: any) => {
            const hasValue = String(value ?? "").trim().length > 0;

            return (
              <span>
                {label}
                {!hasValue && (
                  <span style={{ color: "#d32f2f", fontWeight: 700 }}> *</span>
                )}
              </span>
            );
          };



          return (
            <>
              <Box component="form" width="100%" onSubmit={handleSubmit} pt={3}>
                <Grid container spacing={3}>
                  {/* IZQUIERDA: EMPRESA */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={modernPaperSx}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Typography 
                          fontWeight={700} 
                          fontSize="1.1rem"
                          sx={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 1,
                            color: "text.primary",
                          }}
                        >
                          Datos de la empresa
                        </Typography>

                        <Button 
                          variant="outlined" 
                          size="small" 
                          onClick={onBack} 
                          sx={{ 
                            ...modernButtonSx,
                            borderColor: alpha("#1976d2", 0.3),
                            color: "text.secondary",
                            "&:hover": {
                              ...modernButtonSx["&:hover"],
                              borderColor: "#1976d2",
                              bgcolor: alpha("#1976d2", 0.04),
                            },
                          }}
                        >
                          Cancelar
                        </Button>
                      </Box>

                      <Divider sx={{ mb: 2.5, borderColor: alpha("#000", 0.06) }} />

                      <Grid container spacing={2.5}>
                        <Grid item xs={12}>
                          <TextField
                            label={labelWithRedStarIfEmpty("Nombre de empresa", (values as any).name)}
                            value={(values as any).name ?? ""}
                            onChange={handleChange("name")}
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            error={Boolean((touched as any).name && (errors as any).name)}
                            helperText={(touched as any).name ? (errors as any).name : ""}
                            sx={modernTextFieldSx}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            label={labelWithRedStarIfEmpty("Numero de Identificacion", (values as any).rut)}
                            value={(values as any).rut ?? ""}
                            onChange={(e) => {
                              const v = e.target.value
                              setFieldValue("rut", v === "" ? null : Number(v))
                            }}
                            size="small"
                            fullWidth
                            type="number"
                            InputLabelProps={{ shrink: true }}
                            error={Boolean((touched as any).rut && (errors as any).rut)}
                            helperText={(touched as any).rut ? (errors as any).rut : ""}
                            sx={modernTextFieldSx}
                            inputProps={{
                              inputMode: "numeric",
                              pattern: "[0-9]*",
                              sx: {
                                "&::-webkit-outer-spin-button, &::-webkit-inner-spin-button": {
                                  WebkitAppearance: "none",
                                  margin: 0,
                                },
                                "&[type=number]": {
                                  MozAppearance: "textfield",
                                },
                              },
                            }}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            select
                            label={labelWithRedStarIfEmpty("Tipo de Pago", (values as any).paymentType)}
                            value={(values as any).paymentType ?? ""}
                            onChange={handleChange("paymentType")}
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            error={Boolean((touched as any).paymentType && (errors as any).paymentType)}
                            helperText={(touched as any).paymentType ? (errors as any).paymentType : ""}
                            sx={modernTextFieldSx}
                          >
                            <MenuItem value="PRE_PAYMENT">Prepago</MenuItem>
                            <MenuItem value="POST_PAYMENT">Postpago</MenuItem>
                          </TextField>
                        </Grid>

                        {/* CREDITOS EMPRESA */}
                        {showInputBalance && (
                          <Grid item xs={12}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 2,
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: alpha("#1976d2", 0.15),
                                bgcolor: alpha("#1976d2", 0.02),
                                position: "relative",
                                overflow: "hidden",
                              }}
                            >
                              <Box
                                sx={{
                                  position: "absolute",
                                  inset: 0,
                                  background:
                                    `radial-gradient(800px circle at 0% 0%, ${alpha("#1976d2", 0.06)}, transparent 40%), radial-gradient(600px circle at 100% 0%, ${alpha("#2e7d32", 0.06)}, transparent 35%)`,
                                  pointerEvents: "none",
                                }}
                              />

                              <Box position="relative" display="flex" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
                                <Box flex={1} minWidth={180}>
                                  <Box display="flex" alignItems="center" gap={1.5}>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontWeight: 700,
                                        letterSpacing: 0.5,
                                        color: "text.secondary",
                                        textTransform: "uppercase",
                                        fontSize: "0.7rem",
                                      }}
                                    >
                                      Balance de la empresa
                                    </Typography>

                                    <Box
                                      sx={{
                                        px: 1.25,
                                        py: 0.35,
                                        borderRadius: 2,
                                        bgcolor: alpha("#1976d2", 0.08),
                                        color: "#1976d2",
                                      }}
                                    >
                                      <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1, fontSize: "0.65rem" }}>
                                        Solo lectura
                                      </Typography>
                                    </Box>
                                  </Box>

                                  <Box display="flex" alignItems="baseline" gap={1} mt={1}>
                                    <Typography
                                      variant="h4"
                                      sx={{
                                        fontWeight: 800,
                                        lineHeight: 1,
                                        background: `linear-gradient(135deg, #1976d2, #2e7d32)`,
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                      }}
                                    >
                                      {companyBalancePretty}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                                      USD
                                    </Typography>
                                  </Box>

                                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, fontSize: "0.78rem", lineHeight: 1.5 }}>
                                    Para recargar créditos usa el módulo de top-up.
                                  </Typography>
                                </Box>

                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={() => navigate("/admin/company-topup")}
                                  sx={{
                                    textTransform: "none",
                                    fontWeight: 700,
                                    borderRadius: 2,
                                    px: 2.5,
                                    py: 1,
                                    bgcolor: "#1976d2",
                                    boxShadow: `0 4px 14px ${alpha("#1976d2", 0.35)}`,
                                    whiteSpace: "nowrap",
                                    "&:hover": {
                                      bgcolor: "#1565c0",
                                      boxShadow: `0 6px 20px ${alpha("#1976d2", 0.45)}`,
                                    },
                                  }}
                                >
                                  + Agregar balance
                                </Button>
                              </Box>

                              <Box
                                mt={2}
                                sx={{
                                  p: 1.5,
                                  borderRadius: 2.5,
                                  border: "1px dashed",
                                  borderColor: alpha("#1976d2", 0.2),
                                  bgcolor: "background.paper",
                                }}
                              >
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, fontSize: "0.7rem" }} marginBottom={2}>
                                  Buscar - seleccionar - agregar/restar
                                </Typography>

                                <Autocomplete
                                  options={quickOptions}
                                  value={quickUser}
                                  isOptionEqualToValue={(o, v) => o.idx === v.idx}
                                  getOptionLabel={(o) => o.label}
                                  onChange={(_, newVal) => {
                                    setQuickUser(newVal)
                                    if (newVal) setExpandedIdx(newVal.idx)
                                  }}
                                  renderInput={(params) => (
                                    <TextField
                                      {...params}
                                      size="small"
                                      fullWidth
                                      label="Usuario"
                                      InputLabelProps={{ shrink: true }}
                                      placeholder="Nombre o email..."
                                      sx={modernTextFieldSx}
                                    />
                                  )}
                                />

                                <Box display="flex" justifyContent="flex-end" gap={1} mt={1.5}>
                                  <Tooltip
                                    title="Restar balance del saldo de la empresa y asignarlos a este usuario (se aplica al guardar)."
                                    arrow
                                    placement="top"
                                    disableInteractive
                                  >
                                    <span>
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<RemoveIcon fontSize="small" />}
                                        onClick={() => quickUser && openUserDeltaDialog(quickUser.idx, "subtract")}
                                        disabled={!quickUser}
                                        sx={{ 
                                          ...modernButtonSx, 
                                          px: 1.5,
                                          borderColor: alpha("#d32f2f", 0.3),
                                          color: "#d32f2f",
                                          "&:hover": {
                                            ...modernButtonSx["&:hover"],
                                            borderColor: "#d32f2f",
                                            bgcolor: alpha("#d32f2f", 0.04),
                                          },
                                          "&.Mui-disabled": {
                                            borderColor: alpha("#000", 0.1),
                                          },
                                        }}
                                      >
                                        Restar
                                      </Button>
                                    </span>
                                  </Tooltip>

                                  <Tooltip
                                    title="Agregar balance a este usuario descontandolos del saldo de la empresa (se aplica al guardar)."
                                    arrow
                                    placement="top"
                                    disableInteractive
                                  >
                                    <span>
                                      <Button
                                        variant="contained"
                                        size="small"
                                        disableElevation
                                        startIcon={<AddIcon fontSize="small" />}
                                        onClick={() => quickUser && openUserDeltaDialog(quickUser.idx, "add")}
                                        disabled={!quickUser}
                                        sx={{ 
                                          ...modernButtonSx, 
                                          px: 1.5,
                                          bgcolor: "#2e7d32",
                                          boxShadow: `0 4px 14px ${alpha("#2e7d32", 0.35)}`,
                                          "&:hover": {
                                            ...modernButtonSx["&:hover"],
                                            bgcolor: "#1b5e20",
                                            boxShadow: `0 6px 20px ${alpha("#2e7d32", 0.45)}`,
                                          },
                                        }}
                                      >
                                        Agregar
                                      </Button>
                                    </span>
                                  </Tooltip>
                                </Box>

                                <FormHelperText sx={{ mt: 1, fontSize: "0.7rem" }}>
                                  Al seleccionar un usuario, se abre su panel para revisar y confirmar el ajuste.
                                </FormHelperText>
                              </Box>
                            </Paper>
                          </Grid>
                        )}

                        <Grid item xs={12}>
                          <TextField
                            label={labelWithRedStarIfEmpty("Direccion", (values as any).address)}
                            value={(values as any).address ?? ""}
                            onChange={handleChange("address")}
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            error={Boolean((touched as any).address && (errors as any).address)}
                            helperText={(touched as any).address ? (errors as any).address : ""}
                            sx={modernTextFieldSx}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <TextField
                            label={labelWithRedStarIfEmpty("Ciudad", (values as any).city)}
                            value={(values as any).city ?? ""}
                            onChange={handleChange("city")}
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            error={Boolean((touched as any).city && (errors as any).city)}
                            helperText={(touched as any).city ? (errors as any).city : ""}
                            sx={modernTextFieldSx}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Autocomplete
                            options={COUNTRY_OPTIONS}
                            value={(values as any).country ?? ""}
                            onChange={(_, newVal) => {
                              setFieldValue("country", newVal ? String(newVal) : null)
                            }}
                            inputValue={(values as any).country ?? ""}
                            onInputChange={(_, newInputValue) => {
                              setFieldValue("country", newInputValue ? String(newInputValue) : null)
                            }}
                            freeSolo={false}
                            disableClearable={false}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label={labelWithRedStarIfEmpty("Pais", (values as any).country)}
                                size="small"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                error={Boolean((touched as any).country && (errors as any).country)}
                                helperText={(touched as any).country ? (errors as any).country : "Busca y selecciona un pais"}
                                sx={modernTextFieldSx}
                              />
                            )}
                          />
                        </Grid>


                        <Grid item xs={12}>
                          <TextField
                            label={labelWithRedStarIfEmpty("Giro Comercial", (values as any).commercialTour)}
                            value={(values as any).commercialTour ?? ""}
                            onChange={handleChange("commercialTour")}
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            error={Boolean((touched as any).commercialTour && (errors as any).commercialTour)}
                            helperText={(touched as any).commercialTour ? (errors as any).commercialTour : ""}
                            sx={modernTextFieldSx}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            label="Sitio Web"
                            value={(values as any).website ?? ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              setFieldValue("website", v === "" ? null : v);
                            }}
                            onBlur={(e) => {
                              const v = String(e.target.value ?? "").trim();
                              if (!v) {
                                setFieldValue("website", null);
                                return;
                              }

                              const normalized = normalizeWebsite(v);
                              setFieldValue("website", normalized || null);
                            }}
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            error={Boolean((touched as any).website && (errors as any).website)}
                            helperText={
                              (touched as any).website
                                ? (errors as any).website || prettifyWebsiteExample
                                : prettifyWebsiteExample
                            }
                            placeholder="midominio.cl"
                            sx={modernTextFieldSx}
                          />
                        </Grid>


                        {/* Redes sociales */}
                        <Grid item xs={12}>
                          <Box 
                            sx={{ 
                              p: 2, 
                              borderRadius: 2.5, 
                              bgcolor: alpha("#9c27b0", 0.02),
                              border: "1px solid",
                              borderColor: alpha("#9c27b0", 0.1),
                            }}
                          >
                            <Typography fontWeight={700} mb={1.5} fontSize="0.95rem" color="text.primary">
                              Redes sociales
                            </Typography>

                            <FieldArray name="socialMedia">
                              {({ push, remove }) => {
                                const socials: SocialLink[] = ((values as any).socialMedia ?? []) as any
                                const smTouched = (touched as any)?.socialMedia ?? []
                                const smErrors = (errors as any)?.socialMedia ?? []

                                return (
                                  <Box display="flex" flexDirection="column" gap={1.5}>
                                    {socials.map((s, i) => (
                                      <Paper 
                                        key={i} 
                                        elevation={0} 
                                        sx={{ 
                                          p: 2, 
                                          borderRadius: 2.5,
                                          border: "1px solid",
                                          borderColor: "divider",
                                          bgcolor: "background.paper",
                                          transition: "all 0.2s ease-in-out",
                                          "&:hover": {
                                            borderColor: alpha("#9c27b0", 0.3),
                                          },
                                        }}
                                      >
                                        <Grid container spacing={1.5} alignItems="center">
                                          <Grid item xs={12} md={5}>
                                            <TextField
                                              select
                                              label="Plataforma"
                                              value={s.platform ?? SocialPlatform.OTHER}
                                              onChange={(e) => setFieldValue(`socialMedia.${i}.platform`, e.target.value)}
                                              size="small"
                                              fullWidth
                                              InputLabelProps={{ shrink: true }}
                                              error={Boolean(smTouched?.[i]?.platform && smErrors?.[i]?.platform)}
                                              helperText={smTouched?.[i]?.platform ? smErrors?.[i]?.platform : ""}
                                              sx={modernTextFieldSx}
                                              SelectProps={{
                                                renderValue: (val) => (
                                                  <Box display="flex" alignItems="center" gap={1}>
                                                    {platformIcon(val as SocialPlatform)}
                                                    <Typography fontWeight={600} fontSize="0.875rem">
                                                      {platformLabel[val as SocialPlatform] ?? String(val)}
                                                    </Typography>
                                                  </Box>
                                                ),
                                              }}
                                            >
                                              {(
                                                [
                                                  SocialPlatform.LINKEDIN,
                                                  SocialPlatform.INSTAGRAM,
                                                  SocialPlatform.FACEBOOK,
                                                  SocialPlatform.X,
                                                  SocialPlatform.YOUTUBE,
                                                  SocialPlatform.OTHER,
                                                ] as SocialPlatform[]
                                              ).map((p) => (
                                                <MenuItem key={p} value={p}>
                                                  <ListItemIcon sx={{ minWidth: 34 }}>{platformIcon(p)}</ListItemIcon>
                                                  <ListItemText primary={platformLabel[p]} />
                                                </MenuItem>
                                              ))}
                                            </TextField>
                                          </Grid>

                                          <Grid item xs={12} md={7}>
                                            <TextField
                                              label="URL"
                                              value={s.url ?? ""}
                                              onChange={(e) => setFieldValue(`socialMedia.${i}.url`, e.target.value)}
                                              size="small"
                                              fullWidth
                                              InputLabelProps={{ shrink: true }}
                                              error={Boolean(smTouched?.[i]?.url && smErrors?.[i]?.url)}
                                              helperText={smTouched?.[i]?.url ? smErrors?.[i]?.url : ""}
                                              placeholder="https://..."
                                              sx={modernTextFieldSx}
                                              InputProps={{
                                                startAdornment: (
                                                  <InputAdornment position="start">
                                                    {platformIcon((s.platform ?? SocialPlatform.OTHER) as SocialPlatform)}
                                                  </InputAdornment>
                                                ),
                                                endAdornment: (
                                                  <InputAdornment position="end">
                                                    <IconButton 
                                                      size="small" 
                                                      onClick={() => remove(i)} 
                                                      aria-label="Eliminar red social"
                                                      sx={{
                                                        color: "text.secondary",
                                                        transition: "all 0.2s ease-in-out",
                                                        "&:hover": {
                                                          color: "#d32f2f",
                                                          bgcolor: alpha("#d32f2f", 0.08),
                                                        },
                                                      }}
                                                    >
                                                      <DeleteOutline fontSize="small" />
                                                    </IconButton>
                                                  </InputAdornment>
                                                ),
                                              }}
                                            />
                                          </Grid>
                                        </Grid>
                                      </Paper>
                                    ))}

                                    <Button
                                      variant="text"
                                      size="small"
                                      startIcon={<Add />}
                                      onClick={() => push({ platform: SocialPlatform.OTHER, url: "" })}
                                      sx={{ 
                                        ...modernButtonSx, 
                                        alignSelf: "flex-start",
                                        color: "#9c27b0",
                                        "&:hover": {
                                          ...modernButtonSx["&:hover"],
                                          bgcolor: alpha("#9c27b0", 0.08),
                                        },
                                      }}
                                    >
                                      Agregar red social
                                    </Button>
                                  </Box>
                                )
                              }}
                            </FieldArray>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>

                  {/* DERECHA: USERS */}
                  <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={modernPaperSx}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Typography 
                          fontWeight={700}
                          fontSize="1.1rem"
                          sx={{ color: "text.primary" }}
                        >
                          Usuarios de la empresa
                        </Typography>

                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Add />}
                          onClick={() => setFieldValue("users", [...(((values as any).users ?? []) as any), emptyUser()])}
                          sx={{ 
                            ...modernButtonSx,
                            borderColor: alpha("#1976d2", 0.3),
                            color: "#1976d2",
                            "&:hover": {
                              ...modernButtonSx["&:hover"],
                              borderColor: "#1976d2",
                              bgcolor: alpha("#1976d2", 0.04),
                            },
                          }}
                        >
                          Agregar usuario
                        </Button>
                      </Box>

                      <Divider sx={{ mb: 2.5, borderColor: alpha("#000", 0.06) }} />

                      <FieldArray name="users">
                        {({ remove, push }) => (
                          <Box display="flex" flexDirection="column" gap={1.5}>
                            {usersIndexed.map(({ u, idx }) => {
                              const uTouched = (touched as any)?.users?.[idx] ?? {}
                              const uErrors = (errors as any)?.users?.[idx] ?? {}

                              const mode: UserRowMode = (u?.mode ?? "CREATE") as UserRowMode
                              const isSelect = mode === "SELECT"

                              const id = String(u?.id ?? "").trim()
                              const picked = id ? existingUserById.get(id) ?? null : null

                              const hideActionSelect = Boolean(id)

                              const baseBalance = Number((isSelect ? (picked as any)?.amount : undefined) ?? u.amount ?? 0)
                              const delta = Number(amountDeltaByIdx[idx] ?? 0)
                              const afterPreview = baseBalance + delta

                              const headerName = isSelect
                                ? picked
                                  ? `${picked.name} (${picked.email})`
                                  : "Usuario existente (sin seleccionar)"
                                : (u.name ?? "").trim() || `Usuario #${idx + 1}`

                              const headerRole = roleChipLabelLower(u.type)

                              return (
                                <Accordion
                                  key={idx}
                                  expanded={expandedIdx === idx}
                                  onChange={(_, isExp) => setExpandedIdx(isExp ? idx : null)}
                                  disableGutters
                                  elevation={0}
                                  sx={{
                                    borderRadius: "12px !important",
                                    border: "1px solid",
                                    borderColor: expandedIdx === idx ? alpha("#1976d2", 0.3) : "divider",
                                    overflow: "hidden",
                                    transition: "all 0.2s ease-in-out",
                                    "&:before": { display: "none" },
                                    "&:hover": {
                                      borderColor: alpha("#1976d2", 0.3),
                                    },
                                    ...(expandedIdx === idx && {
                                      boxShadow: `0 4px 20px ${alpha("#1976d2", 0.1)}`,
                                    }),
                                  }}
                                >
                                  <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    sx={{
                                      px: 2,
                                      py: 1,
                                      bgcolor: expandedIdx === idx ? alpha("#1976d2", 0.02) : "transparent",
                                      transition: "all 0.2s ease-in-out",
                                      "& .MuiAccordionSummary-content": {
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 1,
                                      },
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        width: "100%",
                                        gap: 1,
                                      }}
                                    >
                                      <Typography fontWeight={600} noWrap sx={{ minWidth: 0, fontSize: "0.95rem" }}>
                                        {headerName}
                                      </Typography>

                                      <Box display="flex" alignItems="center" gap={1}>
                                        <Box
                                          sx={{
                                            px: 1.25,
                                            py: 0.35,
                                            borderRadius: 2,
                                            bgcolor: alpha("#1976d2", 0.08),
                                            color: "#1976d2",
                                          }}
                                        >
                                          <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1, fontSize: "0.7rem", textTransform: "lowercase" }}>
                                            {headerRole}
                                          </Typography>
                                        </Box>

                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            remove(idx)

                                            setAmountDeltaByIdx((prev) => {
                                              const copy = { ...prev }
                                              delete copy[idx]
                                              return copy
                                            })

                                            if (expandedIdx === idx) setExpandedIdx(null)
                                            if (quickUser?.idx === idx) setQuickUser(null)
                                          }}
                                          aria-label="Eliminar usuario"
                                          sx={{
                                            color: "text.secondary",
                                            transition: "all 0.2s ease-in-out",
                                            "&:hover": {
                                              color: "#d32f2f",
                                              bgcolor: alpha("#d32f2f", 0.08),
                                            },
                                          }}
                                        >
                                          <DeleteOutline fontSize="small" />
                                        </IconButton>
                                      </Box>
                                    </Box>
                                  </AccordionSummary>

                                  <AccordionDetails sx={{ p: 2.5, pt: 1, bgcolor: alpha("#1976d2", 0.01) }}>
                                    <Grid container spacing={2}>
                                      {/* ACCION: solo si NO esta creado (sin id) */}
                                      {!hideActionSelect && (
                                        <Grid item xs={12}>
                                          <TextField
                                            select
                                            label="Accion"
                                            value={mode}
                                            onChange={(e) => {
                                              const next = e.target.value as UserRowMode
                                              setFieldValue(`users.${idx}.mode`, next)

                                              setAmountDeltaByIdx((prev) => ({ ...prev, [idx]: 0 }))

                                              if (next === "SELECT") {
                                                setFieldValue(`users.${idx}.password`, "")
                                                setFieldValue(`users.${idx}.name`, "")
                                                setFieldValue(`users.${idx}.email`, "")
                                                setFieldValue(`users.${idx}.phone`, "")
                                                setFieldValue(`users.${idx}.id`, "")
                                              }

                                              if (next === "CREATE") {
                                                setFieldValue(`users.${idx}.id`, "")
                                                setFieldValue(`users.${idx}.password`, "")
                                                setFieldValue(`users.${idx}.name`, "")
                                                setFieldValue(`users.${idx}.email`, "")
                                                setFieldValue(`users.${idx}.phone`, "")
                                                setFieldValue(`users.${idx}.type`, "ADMIN")
                                              }
                                            }}
                                            size="small"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            sx={modernTextFieldSx}
                                          >
                                            <MenuItem value="CREATE">Crear nuevo</MenuItem>
                                            <MenuItem value="SELECT">Seleccionar existente</MenuItem>
                                          </TextField>
                                        </Grid>
                                      )}

                                      {isSelect && (
                                        <Grid item xs={12}>
                                          <Autocomplete
                                            options={existingUsers}
                                            value={picked}
                                            isOptionEqualToValue={(o, v) => o.id === v.id}
                                            getOptionLabel={(o) => `${o.name} (${o.email})`}
                                            noOptionsText={
                                              existingUsers.length === 0
                                                ? "No hay usuarios existentes para seleccionar."
                                                : "No se encontraron usuarios con ese criterio."
                                            }
                                            onChange={(_, newVal) => {
                                              setFieldValue(`users.${idx}.id`, newVal?.id ?? "")
                                              setFieldValue(`users.${idx}.name`, newVal?.name ?? "")
                                              setFieldValue(`users.${idx}.email`, newVal?.email ?? "")
                                              setFieldValue(`users.${idx}.phone`, newVal?.phone ?? "")
                                              setFieldValue(`users.${idx}.type`, newVal?.type ?? "ADMIN")
                                              setFieldValue(`users.${idx}.password`, "")
                                              setExpandedIdx(idx)
                                            }}
                                            renderInput={(params) => (
                                              <TextField
                                                {...params}
                                                label="Seleccionar usuario existente"
                                                size="small"
                                                fullWidth
                                                InputLabelProps={{ shrink: true }}
                                                helperText="Se completan los datos para visualizar, pero al guardar solo se relaciona con la empresa."
                                                sx={modernTextFieldSx}
                                              />
                                            )}
                                          />

                                          <Box mt={1.5}>
                                            <Alert
                                              severity={existingUsers.length === 0 ? "warning" : "info"}
                                              sx={{ 
                                                borderRadius: 2.5,
                                                "& .MuiAlert-icon": {
                                                  alignItems: "center",
                                                },
                                              }}
                                            >
                                              {existingUsers.length === 0 ? (
                                                <>
                                                  No hay usuarios existentes para seleccionar. Para crear uno, ingresa a{" "}
                                                  <MuiLink
                                                    component="button"
                                                    type="button"
                                                    onClick={goToUsers}
                                                    sx={{ fontWeight: 700 }}
                                                  >
                                                    aqui
                                                  </MuiLink>
                                                  .
                                                </>
                                              ) : (
                                                <>
                                                  No encontras tu usuario en la lista? Podes crearlo desde{" "}
                                                  <MuiLink
                                                    component="button"
                                                    type="button"
                                                    onClick={goToUsers}
                                                    sx={{ fontWeight: 700 }}
                                                  >
                                                    aqui
                                                  </MuiLink>
                                                  .
                                                </>
                                              )}
                                            </Alert>
                                          </Box>
                                        </Grid>
                                      )}

                                      <Grid item xs={12}>
                                        <TextField
                                          label="Nombre de usuario"
                                          value={u.name ?? ""}
                                          onChange={(e) => setFieldValue(`users.${idx}.name`, e.target.value)}
                                          size="small"
                                          fullWidth
                                          InputLabelProps={{ shrink: true }}
                                          error={Boolean(uTouched.name && uErrors.name)}
                                          helperText={uTouched.name ? uErrors.name : ""}
                                          disabled={isSelect}
                                          sx={modernTextFieldSx}
                                        />
                                      </Grid>

                                      <Grid item xs={12}>
                                        <TextField
                                          label="Correo electronico"
                                          value={u.email ?? ""}
                                          onChange={(e) => setFieldValue(`users.${idx}.email`, e.target.value)}
                                          size="small"
                                          fullWidth
                                          InputLabelProps={{ shrink: true }}
                                          error={Boolean(uTouched.email && uErrors.email)}
                                          helperText={uTouched.email ? uErrors.email : ""}
                                          disabled={isSelect}
                                          sx={modernTextFieldSx}
                                        />
                                      </Grid>

                                      {/* TELEFONO bien colocado (del usuario) */}
                                      <Grid item xs={12}>
                                        <PhoneField
                                          value={(values as any).users?.[idx]?.phone ?? null}
                                          onChange={(next) => setFieldValue(`users.${idx}.phone`, next)}
                                          defaultCountryIso2="AR"
                                          disabled={isSelect}
                                          error={Boolean((uTouched as any)?.phone && (uErrors as any)?.phone)}
                                          helperText={(uTouched as any)?.phone ? (uErrors as any)?.phone : ""}
                                        />
                                      </Grid>


                                      {/* ROL */}
                                      <Grid item xs={12}>
                                        {String(u.type ?? "").toUpperCase() === "SUPER_ADMIN" ? (
                                          <TextField
                                            label="Tipo de usuario"
                                            value="Super Administrador"
                                            size="small"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            disabled
                                            sx={modernTextFieldSx}
                                          />
                                        ) : (
                                          <TextField
                                            select
                                            label="Tipo de usuario"
                                            value={uiRoleLower(u.type) as any}
                                            onChange={(e) => {
                                              const uiValue = e.target.value as "Administrador" | "Usuario" | "Super Administrador"

                                              setFieldValue(`users.${idx}.type`, fromUiRoleLower(uiValue))
                                            }}
                                            size="small"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            error={Boolean(uTouched.type && uErrors.type)}
                                            helperText={uTouched.type ? uErrors.type : ""}
                                            disabled={isSelect}
                                            sx={modernTextFieldSx}
                                          >
                                            <MenuItem value="admin" sx={{ textTransform: "lowercase" }}>
                                              Administrador
                                            </MenuItem>
                                            <MenuItem value="user" sx={{ textTransform: "lowercase" }}>
                                              Usuario
                                            </MenuItem>
                                          </TextField>
                                        )}
                                      </Grid>

                                      <Grid item xs={12}>
                                        <TextField
                                          variant="outlined"
                                          value={u.password ?? ""}
                                          onChange={(e) => setFieldValue(`users.${idx}.password`, e.target.value)}
                                          label="Contrasena"
                                          size="small"
                                          fullWidth
                                          InputLabelProps={{ shrink: true }}
                                          type={showPassByIdx[idx] ? "text" : "password"}
                                          error={Boolean(uTouched.password && uErrors.password)}
                                          helperText={
                                            isSelect
                                              ? "No se puede cambiar contrasena al seleccionar existente (solo se relaciona)."
                                              : uTouched.password
                                              ? uErrors.password
                                              : u.id
                                              ? "Dejar vacio para no cambiarla"
                                              : ""
                                          }
                                          disabled={isSelect}
                                          sx={modernTextFieldSx}
                                          InputProps={{
                                            endAdornment: (
                                              <InputAdornment position="end">
                                                <IconButton
                                                  aria-label="toggle password visibility"
                                                  onClick={() =>
                                                    setShowPassByIdx((prev) => ({
                                                      ...prev,
                                                      [idx]: !prev[idx],
                                                    }))
                                                  }
                                                  onMouseDown={(event) => event.preventDefault()}
                                                  size="small"
                                                  disabled={isSelect}
                                                  sx={{
                                                    color: "text.secondary",
                                                    transition: "all 0.2s ease-in-out",
                                                    "&:hover": {
                                                      color: "#1976d2",
                                                    },
                                                  }}
                                                >
                                                  {showPassByIdx[idx] ? <VisibilityOffOutlined /> : <VisibilityOutlined />}
                                                </IconButton>
                                              </InputAdornment>
                                            ),
                                          }}
                                        />
                                      </Grid>

                                      {/* CREDITOS USUARIO */}
                                      {!isCreate && (
                                        <Grid item xs={12}>
                                          <Paper
                                            elevation={0}
                                            sx={{
                                              p: 2,
                                              borderRadius: 2.5,
                                              border: "1px solid",
                                              borderColor: alpha("#9c27b0", 0.15),
                                              bgcolor: alpha("#9c27b0", 0.02),
                                              position: "relative",
                                              overflow: "hidden",
                                            }}
                                          >
                                            <Box
                                              sx={{
                                                position: "absolute",
                                                inset: 0,
                                                background:
                                                  `radial-gradient(650px circle at 0% 0%, ${alpha("#1976d2", 0.06)}, transparent 42%), radial-gradient(500px circle at 100% 0%, ${alpha("#9c27b0", 0.06)}, transparent 35%)`,
                                                pointerEvents: "none",
                                              }}
                                            />

                                            <Box position="relative">
                                              <Box display="flex" alignItems="center" gap={1.5}>
                                                <Typography 
                                                  variant="caption" 
                                                  sx={{ 
                                                    fontWeight: 700, 
                                                    letterSpacing: 0.5,
                                                    color: "text.secondary",
                                                    textTransform: "uppercase",
                                                    fontSize: "0.7rem",
                                                  }}
                                                >
                                                  Balances del usuario
                                                </Typography>

                                                <Box
                                                  sx={{
                                                    px: 1.25,
                                                    py: 0.35,
                                                    borderRadius: 2,
                                                    bgcolor: alpha("#9c27b0", 0.08),
                                                    color: "#9c27b0",
                                                  }}
                                                >
                                                  <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1, fontSize: "0.65rem" }}>
                                                    Solo lectura
                                                  </Typography>
                                                </Box>
                                              </Box>

                                              <Box display="flex" alignItems="baseline" gap={1} mt={1}>
                                                <Typography 
                                                  variant="h4" 
                                                  sx={{ 
                                                    fontWeight: 800, 
                                                    lineHeight: 1,
                                                    background: `linear-gradient(135deg, #1976d2, #9c27b0)`,
                                                    WebkitBackgroundClip: "text",
                                                    WebkitTextFillColor: "transparent",
                                                  }}
                                                >
                                                  {Number(baseBalance).toLocaleString("en-US", { maximumFractionDigits: 2 })}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                                                  USD
                                                </Typography>
                                              </Box>

                                              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: "0.8rem", lineHeight: 1.5 }}>
                                                Este valor es informativo. Para ajustar balance, usa el buscador rapido de la empresa.
                                              </Typography>

                                              {delta !== 0 && (
                                                <Box
                                                  mt={1.5}
                                                  sx={{
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    border: "1px dashed",
                                                    borderColor: alpha(delta > 0 ? "#2e7d32" : "#d32f2f", 0.3),
                                                    bgcolor: alpha(delta > 0 ? "#2e7d32" : "#d32f2f", 0.04),
                                                  }}
                                                >
                                                  <Typography 
                                                    variant="caption" 
                                                    sx={{ 
                                                      fontWeight: 700, 
                                                      letterSpacing: 0.35,
                                                      color: "text.secondary",
                                                      textTransform: "uppercase",
                                                      fontSize: "0.65rem",
                                                    }}
                                                  >
                                                    Ajuste pendiente (al guardar)
                                                  </Typography>

                                                  <Box display="flex" alignItems="baseline" gap={1} mt={0.75}>
                                                    <Typography
                                                      variant="body1"
                                                      sx={{
                                                        fontWeight: 800,
                                                        color: delta > 0 ? "#2e7d32" : "#d32f2f",
                                                      }}
                                                    >
                                                      {delta > 0 ? `+${delta}` : `${delta}`} USD
                                                    </Typography>

                                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, fontSize: "0.8rem" }}>
                                                      quedara en{" "}
                                                      <strong>
                                                        {Number(afterPreview).toLocaleString("en-US", { maximumFractionDigits: 2 })} USD
                                                      </strong>
                                                    </Typography>
                                                  </Box>

                                                  <FormHelperText sx={{ mt: 1, fontSize: "0.7rem" }}>
                                                    Para modificar el ajuste, hacelo desde el buscador rapido (izquierda).
                                                  </FormHelperText>
                                                </Box>
                                              )}

                                              {isSelect && !picked && (
                                                <FormHelperText sx={{ mt: 1.5, color: "text.secondary", fontSize: "0.75rem" }}>
                                                  Selecciona un usuario existente para ver su balance.
                                                </FormHelperText>
                                              )}
                                            </Box>
                                          </Paper>
                                        </Grid>
                                      )}
                                    </Grid>
                                  </AccordionDetails>
                                </Accordion>
                              )
                            })}

                            <Button
                              variant="text"
                              size="small"
                              startIcon={<Add />}
                              onClick={() => push(emptyUser() as any)}
                              sx={{ 
                                ...modernButtonSx, 
                                alignSelf: "flex-start",
                                color: "#1976d2",
                                "&:hover": {
                                  ...modernButtonSx["&:hover"],
                                  bgcolor: alpha("#1976d2", 0.08),
                                },
                              }}
                            >
                              Agregar otro usuario
                            </Button>

                            {usersIndexed.length === 0 && (
                              <Box 
                                mt={1} 
                                p={2.5}
                                sx={{
                                  borderRadius: 2.5,
                                  bgcolor: alpha("#1976d2", 0.02),
                                  border: "1px dashed",
                                  borderColor: alpha("#1976d2", 0.15),
                                  textAlign: "center",
                                }}
                              >
                                <Typography variant="body2" color="text.secondary">
                                  No hay usuarios cargados todavia.
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        )}
                      </FieldArray>
                    </Paper>
                  </Grid>

                  {/* FOTO: full-width row */}
                  <Grid item xs={12}>
                    <Paper elevation={0} sx={{ ...modernPaperSx, p: 2.5 }}>
                      <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
                        <Box position="relative" sx={{ flexShrink: 0 }}>
                          <Avatar
                            src={
                              photoPreviewUrl === '__remove__'
                                ? undefined
                                : photoPreviewUrl ?? (dataForm as any)?.photoUrl ?? undefined
                            }
                            sx={{ width: 80, height: 80, fontSize: '2rem', bgcolor: 'primary.main' }}
                          >
                            {!(photoPreviewUrl && photoPreviewUrl !== '__remove__') && !(dataForm as any)?.photoUrl
                              ? String((values as any).name ?? 'E')[0]?.toUpperCase()
                              : null}
                          </Avatar>
                          <Box
                            component="label"
                            htmlFor="company-photo-upload-input"
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '50%',
                              bgcolor: 'rgba(0,0,0,0)',
                              transition: 'background 0.2s',
                              cursor: 'pointer',
                              '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.35)',
                                '& .company-cam-icon': { opacity: 1 },
                              },
                            }}
                          >
                            <CameraAltOutlined
                              className="company-cam-icon"
                              sx={{ opacity: 0, color: '#fff', transition: 'opacity 0.2s', fontSize: 28 }}
                            />
                          </Box>
                        </Box>

                        <Box display="flex" flexDirection="column" gap={1} flex={1}>
                          <Typography fontWeight={600} fontSize="0.9rem" color="text.primary">
                            Foto de la empresa
                          </Typography>
                          <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
                            <Button
                              component="label"
                              htmlFor="company-photo-upload-input"
                              variant="outlined"
                              size="small"
                              sx={{
                                ...modernButtonSx,
                                borderColor: alpha('#1976d2', 0.4),
                                color: '#1976d2',
                                '&:hover': {
                                  ...modernButtonSx['&:hover'],
                                  borderColor: '#1976d2',
                                  bgcolor: alpha('#1976d2', 0.04),
                                },
                              }}
                            >
                              {(photoPreviewUrl && photoPreviewUrl !== '__remove__') ||
                              ((dataForm as any)?.photoUrl && photoPreviewUrl !== '__remove__')
                                ? 'Cambiar foto'
                                : 'Subir foto'}
                            </Button>

                            {photoPreviewUrl && photoPreviewUrl !== '__remove__' && (
                              <Button
                                variant="text"
                                size="small"
                                onClick={() => { setPhotoFile(null); setPhotoPreviewUrl(null) }}
                                sx={{ ...modernButtonSx, color: 'text.secondary' }}
                              >
                                Cancelar cambio
                              </Button>
                            )}

                            {(((dataForm as any)?.photoUrl && photoPreviewUrl !== '__remove__') ||
                              (photoPreviewUrl && photoPreviewUrl !== '__remove__')) && (
                              <Button
                                variant="text"
                                size="small"
                                color="error"
                                onClick={() => { setPhotoPreviewUrl('__remove__'); setPhotoFile(null) }}
                                sx={modernButtonSx}
                              >
                                Quitar
                              </Button>
                            )}

                            {photoPreviewUrl === '__remove__' && (
                              <Button
                                variant="text"
                                size="small"
                                onClick={() => setPhotoPreviewUrl(null)}
                                sx={{ ...modernButtonSx, color: 'text.secondary' }}
                              >
                                Cancelar
                              </Button>
                            )}
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            PNG, JPG o WEBP. Máx 5 MB.
                          </Typography>
                        </Box>
                      </Box>

                      <input
                        type="file"
                        id="company-photo-upload-input"
                        accept="image/png,image/jpeg,image/webp"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null
                          setPhotoFile(file)
                          if (file) setPhotoPreviewUrl(URL.createObjectURL(file))
                          e.target.value = ''
                        }}
                      />
                    </Paper>
                  </Grid>
                </Grid>

                <Box display="flex" justifyContent="flex-end" mt={3}>
                  <Button
                    variant="contained"
                    disableElevation
                    type="submit"
                    size="large"
                    disabled={loading}
                    startIcon={<Save />}
                    sx={{ 
                      ...modernButtonSx,
                      px: 3,
                      py: 1.25,
                      bgcolor: "#1976d2",
                      boxShadow: `0 4px 14px ${alpha("#1976d2", 0.35)}`,
                      "&:hover": {
                        ...modernButtonSx["&:hover"],
                        bgcolor: "#1565c0",
                        boxShadow: `0 6px 20px ${alpha("#1976d2", 0.45)}`,
                      },
                    }}
                  >
                    Guardar y Enviar
                  </Button>
                </Box>
              </Box>

              <Dialog 
                open={openAddBalanceUser} 
                onClose={() => setOpenAddBalanceUser(false)} 
                fullWidth 
                maxWidth="xs"
                PaperProps={{
                  sx: {
                    borderRadius: 3,
                    p: 1,
                  },
                }}
              >
                <DialogTitle sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                  {balanceActionUser === "add" ? "Agregar balance" : "Restar balance"}
                </DialogTitle>
                <DialogContent>
                  <Box mt={1}>
                    <TextField
                      autoFocus
                      label={balanceActionUser === "add" ? "Monto a agregar" : "Monto a restar"}
                      fullWidth
                      size="small"
                      value={addAmountUser}
                      onChange={(e) => setAddAmountUser(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography fontWeight={600}>USD</Typography>
                          </InputAdornment>
                        ),
                      }}
                      type="number"
                      inputProps={{ step: "0.01", min: 0 }}
                      sx={modernTextFieldSx}
                    />
                  </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                  <Button 
                    onClick={() => setOpenAddBalanceUser(false)}
                    sx={{ 
                      ...modernButtonSx,
                      color: "text.secondary",
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    disableElevation
                    onClick={() => {
                      const raw = Number(addAmountUser ?? 0)
                      if (!Number.isFinite(raw) || raw < 0) return

                      const signed = balanceActionUser === "subtract" ? -raw : raw

                      if (activeIdx !== null) {
                        setAmountDeltaByIdx((prev) => ({ ...prev, [activeIdx]: signed }))
                      }

                      setOpenAddBalanceUser(false)
                    }}
                    sx={{ 
                      ...modernButtonSx,
                      bgcolor: balanceActionUser === "add" ? "#2e7d32" : "#d32f2f",
                      boxShadow: `0 4px 14px ${alpha(balanceActionUser === "add" ? "#2e7d32" : "#d32f2f", 0.35)}`,
                      "&:hover": {
                        ...modernButtonSx["&:hover"],
                        bgcolor: balanceActionUser === "add" ? "#1b5e20" : "#c62828",
                      },
                    }}
                  >
                    Confirmar
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          )
        }}
      </Formik>
    </LayerCardForm>
  )
}
