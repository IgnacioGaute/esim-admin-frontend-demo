import { useEffect, useMemo, useState } from "react"
import { Formik } from "formik"
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  InputAdornment,
  IconButton,
  FormHelperText,
  Typography,
  Chip,
  Avatar,
  alpha,
} from "@mui/material"
import {
  Save,
  VisibilityOffOutlined,
  VisibilityOutlined,
  PersonOutline,
  EmailOutlined,
  BusinessOutlined,
  LockOutlined,
  AccountBalanceWalletOutlined,
  BadgeOutlined,
  CameraAltOutlined,
} from "@mui/icons-material"

import { LayerCardForm } from "../LayerCardForm"
import { SelectCompany } from "../companies/SelectCompany"

import { FormUserShema, FormUserShemaEdit } from "@/admin/utils/shemas/FormUserShema"
import { IFormUser } from "@/admin/utils/interfaces/user-data.interface"
import { PhoneField } from "../companies/PhoneField"

type Role = "SUPER_ADMIN" | "ADMIN" | "SELLER" | "CORPORATE"

interface Props {
  dataForm?: IFormUser & { amount?: number; company?: any; photoUrl?: string | null }
  title?: string
  onBack: () => void
  onSubmit: (values: IFormUser & { amount?: number; companyId?: string }, photoFile?: File | null) => void
  loading?: boolean
  showInputBalance?: boolean
  showCompanyField?: boolean
  showTypeField?: boolean
  currentRole: Role
  currentCompanyId?: string
  currentCompanyName?: string
}

const modernTextFieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    transition: "all 0.2s ease",
    "&:hover": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "primary.main",
      },
    },
    "&.Mui-focused": {
      "& .MuiOutlinedInput-notchedOutline": {
        borderWidth: 2,
      },
      boxShadow: (theme: any) => `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
  },
}

const modernSelectSx = {
  borderRadius: 2,
  transition: "all 0.2s ease",
  "&:hover": {
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "primary.main",
    },
  },
  "&.Mui-focused": {
    "& .MuiOutlinedInput-notchedOutline": {
      borderWidth: 2,
    },
    boxShadow: (theme: any) => `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
  },
}

export const UserFormNewAndEdit = ({
  dataForm,
  title = "Agregar Usuario",
  loading = false,
  showInputBalance = false,
  onBack,
  onSubmit,
  showCompanyField = true,
  showTypeField = true,
  currentRole,
  currentCompanyId = "",
  currentCompanyName = "",
}: Props) => {
  const [showPass, setShowPass] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)

  const normalizeUserType = (t?: string) => {
    if (t === "USER") return "SELLER"
    if (t === "CORPORATE") return "ADMIN"
    return t
  }

  const toUiType = (t?: string) => {
    const nt = normalizeUserType(t)
    if (nt === "SUPER_ADMIN") return "SUPER_ADMIN"
    return nt === "SELLER" ? "USER" : "ADMIN"
  }

  const fromUiType = (ui: "ADMIN" | "USER" | "SUPER_ADMIN") => {
    if (ui === "SUPER_ADMIN") return "SUPER_ADMIN"
    return ui === "USER" ? "SELLER" : "ADMIN"
  }

  const isMyAccount = title === "Mi cuenta"
  const isEditing = Boolean(dataForm)

  const canPickCompany = showCompanyField && !isMyAccount && currentRole === "SUPER_ADMIN"

  const normalizePhone = (raw: any, iso2 = "AR") => {
    const v = String(raw ?? "").trim()

    if (!v || v === "+" || v === "+0") return ""

    if (iso2 === "AR" && (v === "+54" || v === "+54 " || v === "+54-")) return ""

    if (/^\+\d{1,3}$/.test(v)) return ""

    return v
  }

  const canViewBalance = useMemo(() => {
    const canRole = currentRole === "ADMIN" || currentRole === "SUPER_ADMIN"
    return showInputBalance && canRole
  }, [currentRole, showInputBalance])

  const formatUsd = (n: number) => {
    const safe = Number(n ?? 0)
    if (!Number.isFinite(safe)) return "0.00"
    return safe.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  const onHandleSubmit = (values: IFormUser & { amount?: number; companyId?: string }) => {
    const payload: any = { ...values }

    if (payload.type === "CORPORATE") payload.type = "ADMIN"

    if (dataForm && (!payload.password || payload.password.trim() === "")) {
      delete payload.password
    }

    const cleanedPhone = normalizePhone(payload.phone, "AR")
    if (!cleanedPhone) {
      delete payload.phone
    } else {
      payload.phone = cleanedPhone
    }

    if (currentRole !== "SUPER_ADMIN") {
      payload.companyId = String(currentCompanyId ?? "")
    }

    if (photoPreviewUrl === "__remove__") payload.photoUrl = null
    onSubmit(payload, photoFile)
  }

  const initialValues = useMemo(() => {
    const base: any = dataForm
      ? {
          ...(dataForm as any),
          password: "",
          type: normalizeUserType((dataForm as any).type) as any,
          companyId:
            currentRole === "SUPER_ADMIN"
              ? String((dataForm as any).companyId ?? (dataForm as any).company?.id ?? "")
              : String(currentCompanyId ?? ""),
          phone: normalizePhone((dataForm as any).phone, "AR"),
        }
      : {
          name: "",
          email: "",
          password: "",
          phone: "",
          type: "ADMIN",
          companyId: currentRole === "SUPER_ADMIN" ? "" : String(currentCompanyId ?? ""),
        }

    return base
  }, [dataForm, currentRole, currentCompanyId])

  return (
    <LayerCardForm title={title} loading={loading} onBack={onBack}>
      <Formik
        initialValues={initialValues}
        validationSchema={dataForm ? FormUserShemaEdit : FormUserShema}
        enableReinitialize
        onSubmit={(vals, helpers) => onHandleSubmit(vals as any)}
      >
        {({ handleChange, handleSubmit, values, errors, touched, setFieldValue, setFieldTouched }) => {
          useEffect(() => {
            if (currentRole === "SUPER_ADMIN") return
            const target = String(currentCompanyId ?? "")
            if (!target) return
            const current = String((values as any).companyId ?? "")
            if (current !== target) setFieldValue("companyId", target, false)
          }, [currentRole, currentCompanyId, setFieldValue, values])

          const phoneNormalized = normalizePhone((values as any).phone, "AR")
          useEffect(() => {
            if (phoneNormalized === "" && String((values as any).phone ?? "").trim() !== "") {
              setFieldValue("phone", "", false)
            }
          }, [])

          const companyError = (touched as any).companyId ? String((errors as any).companyId ?? "") : ""

          const readOnlyCompanyName =
            currentRole === "SUPER_ADMIN" ? "" : String(currentCompanyName || (dataForm as any)?.company?.name || "")

          const phoneTouched = Boolean((touched as any).phone)

          const passTouched = Boolean((touched as any).password)
          const passError = passTouched ? String((errors as any).password ?? "") : ""

          return (
            <Box component="form" width={"100%"} onSubmit={handleSubmit} pt={2.5}>
              <Grid container spacing={3} mb={3}>
                {/* ===================== LEFT ===================== */}
                <Grid item xs={12} md={6}>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12}>
                      <TextField
                        variant="outlined"
                        value={(values as any).name}
                        onChange={handleChange("name")}
                        label="Nombre de usuario"
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        type="text"
                        error={(errors as any).name !== undefined}
                        helperText={(errors as any).name}
                        sx={modernTextFieldSx}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonOutline sx={{ color: "text.secondary", fontSize: 20 }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        variant="outlined"
                        value={(values as any).email}
                        onChange={handleChange("email")}
                        label="Correo electronico"
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        type="email"
                        error={(errors as any).email !== undefined}
                        helperText={(errors as any).email}
                        sx={modernTextFieldSx}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    {showCompanyField && !isMyAccount && (
                      <Grid item xs={12}>
                        {canPickCompany ? (
                          <SelectCompany
                            value={String((values as any).companyId ?? "")}
                            onChange={(companyId: string) => {
                              setFieldValue("companyId", companyId, true)
                              setFieldTouched("companyId", true, true)
                            }}
                            error={companyError || undefined}
                            label="Seleccion de Compania"
                          />
                        ) : (
                          <TextField
                            label="Compania"
                            size="small"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            value={readOnlyCompanyName || "-"}
                            disabled
                            helperText="Asignada automaticamente segun tu empresa."
                            sx={modernTextFieldSx}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <BusinessOutlined sx={{ color: "text.disabled", fontSize: 20 }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      </Grid>
                    )}
                  </Grid>
                </Grid>

                {/* ===================== RIGHT ===================== */}
                <Grid item xs={12} md={6}>
                  <Grid container spacing={2.5}>
                    {showTypeField && (
                      <Grid item xs={12}>
                        <FormControl
                          variant="outlined"
                          fullWidth
                          size="small"
                          error={(errors as any).type !== undefined}
                        >
                          <InputLabel id="simple-select-type-label">Tipo de usuario</InputLabel>

                          <Select
                            labelId="simple-select-type-label"
                            id="simple-select-type"
                            value={toUiType((values as any).type) as any}
                            label="Tipo de usuario"
                            onChange={(e) => {
                              const uiValue = e.target.value as "ADMIN" | "USER" | "SUPER_ADMIN"
                              setFieldValue("type", fromUiType(uiValue))
                            }}
                            sx={modernSelectSx}
                            startAdornment={
                              <InputAdornment position="start">
                                <BadgeOutlined sx={{ color: "text.secondary", fontSize: 20, ml: 0.5 }} />
                              </InputAdornment>
                            }
                          >
                            <MenuItem value="ADMIN">
                              <Box display="flex" alignItems="center" gap={1}>
                                <Chip
                                  label="Admin"
                                  size="small"
                                  sx={{
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                    color: "primary.main",
                                    fontWeight: 600,
                                    fontSize: "0.7rem",
                                  }}
                                />
                                <Typography variant="body2">Administrador</Typography>
                              </Box>
                            </MenuItem>
                            <MenuItem value="USER">
                              <Box display="flex" alignItems="center" gap={1}>
                                <Chip
                                  label="User"
                                  size="small"
                                  sx={{
                                    bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                                    color: "success.main",
                                    fontWeight: 600,
                                    fontSize: "0.7rem",
                                  }}
                                />
                                <Typography variant="body2">Usuario</Typography>
                              </Box>
                            </MenuItem>

                            {currentRole === "SUPER_ADMIN" && (
                              <MenuItem value="SUPER_ADMIN">
                                <Box display="flex" alignItems="center" gap={1}>
                                  <Chip
                                    label="Super"
                                    size="small"
                                    sx={{
                                      bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                                      color: "error.main",
                                      fontWeight: 600,
                                      fontSize: "0.7rem",
                                    }}
                                  />
                                  <Typography variant="body2">Super Administrador</Typography>
                                </Box>
                              </MenuItem>
                            )}
                          </Select>

                          {(errors as any).type && <FormHelperText>{(errors as any).type}</FormHelperText>}
                        </FormControl>
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <TextField
                        variant="outlined"
                        value={(values as any).password ?? ""}
                        onChange={handleChange("password")}
                        label={dataForm ? "Nueva contrasena (opcional)" : "Contrasena"}
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        type={showPass ? "text" : "password"}
                        onBlur={() => setFieldTouched("password", true, true)}
                        error={Boolean(passError)}
                        helperText={passError}
                        sx={modernTextFieldSx}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockOutlined sx={{ color: "text.secondary", fontSize: 20 }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPass((prev) => !prev)}
                                onMouseDown={(event) => event.preventDefault()}
                                size="small"
                                sx={{
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                  },
                                }}
                              >
                                {showPass ? (
                                  <VisibilityOffOutlined sx={{ fontSize: 20 }} />
                                ) : (
                                  <VisibilityOutlined sx={{ fontSize: 20 }} />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <PhoneField
                        value={phoneNormalized || null}
                        onChange={(next) => {
                          const cleaned = normalizePhone(next, "AR")
                          setFieldValue("phone", cleaned, true)
                          setFieldTouched("phone", true, true)
                        }}
                        defaultCountryIso2="AR"
                        disabled={false}
                        error={Boolean((errors as any).phone) && phoneTouched}
                        helperText={phoneTouched ? String((errors as any).phone ?? "") : ""}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Balance section for "Mi cuenta" */}
                {isMyAccount && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        p: 3,
                        display: "flex",
                        alignItems: { xs: "flex-start", md: "center" },
                        justifyContent: "space-between",
                        gap: 2,
                        flexDirection: { xs: "column", md: "row" },
                        background: (theme) =>
                          theme.palette.mode === "dark"
                            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(
                                theme.palette.primary.main,
                                0.02
                              )} 100%)`
                            : "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          borderColor: "primary.light",
                          boxShadow: (theme) => `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                            boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)",
                          }}
                        >
                          <AccountBalanceWalletOutlined sx={{ color: "white", fontSize: 28 }} />
                        </Box>
                        <Box>
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                              Balance
                            </Typography>
                            <Chip
                              size="small"
                              label="Solo lectura"
                              sx={{
                                bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
                                color: "info.main",
                                fontWeight: 600,
                                fontSize: "0.65rem",
                                height: 20,
                              }}
                            />
                          </Box>

                          <Typography
                            variant="h4"
                            sx={{
                              fontWeight: 800,
                              letterSpacing: "-0.02em",
                              lineHeight: 1.1,
                              background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                              backgroundClip: "text",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                            }}
                          >
                            USD {formatUsd(Number((dataForm as any)?.amount ?? 0))}
                          </Typography>

                          <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
                            Este es tu balance actual.
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Grid>
                )}
                {/* ===================== FOTO DE PERFIL ===================== */}
                <Grid item xs={12}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      display: "flex",
                      alignItems: "center",
                      gap: 3,
                      flexWrap: "wrap",
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.01),
                    }}
                  >
                    <Box sx={{ position: "relative", flexShrink: 0 }}>
                      <Avatar
                        src={photoPreviewUrl || (dataForm as any)?.photoUrl || undefined}
                        sx={{
                          width: 80,
                          height: 80,
                          border: (theme) => `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                          color: "primary.main",
                          fontWeight: 800,
                          fontSize: "2rem",
                        }}
                      >
                        {(values as any).name?.charAt(0)?.toUpperCase() || <PersonOutline />}
                      </Avatar>

                      <Box
                        component="label"
                        htmlFor="photo-upload-input"
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          width: 26,
                          height: 26,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          border: "2px solid white",
                          transition: "all 0.2s ease",
                          "&:hover": { bgcolor: "primary.dark" },
                        }}
                      >
                        <CameraAltOutlined sx={{ fontSize: 13 }} />
                      </Box>
                    </Box>

                    <Box flex={1} minWidth={160}>
                      <Typography fontWeight={700} fontSize="0.95rem" mb={0.4}>
                        Foto de perfil
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontSize="0.78rem" mb={1.5}>
                        PNG, JPG, JPEG o WEBP · Máx. 5MB
                      </Typography>

                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Button
                          component="label"
                          htmlFor="photo-upload-input"
                          variant="outlined"
                          size="small"
                          startIcon={<CameraAltOutlined sx={{ fontSize: 15 }} />}
                          sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: "0.8rem",
                            borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
                            color: "primary.main",
                            "&:hover": {
                              borderColor: "primary.main",
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                            },
                          }}
                        >
                          {photoPreviewUrl || (dataForm as any)?.photoUrl ? "Cambiar foto" : "Subir foto"}
                        </Button>

                        {(photoPreviewUrl || (dataForm as any)?.photoUrl) && !photoFile && (
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => { setPhotoFile(null); setPhotoPreviewUrl("__remove__") }}
                            sx={{
                              textTransform: "none",
                              borderRadius: 2,
                              fontSize: "0.8rem",
                              color: "text.secondary",
                            }}
                          >
                            Quitar
                          </Button>
                        )}

                        {photoFile && (
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => { setPhotoFile(null); setPhotoPreviewUrl(null) }}
                            sx={{
                              textTransform: "none",
                              borderRadius: 2,
                              fontSize: "0.8rem",
                              color: "text.secondary",
                            }}
                          >
                            Cancelar cambio
                          </Button>
                        )}
                      </Box>
                    </Box>

                    <input
                      id="photo-upload-input"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0] ?? null
                        if (!file) return
                        setPhotoFile(file)
                        setPhotoPreviewUrl(URL.createObjectURL(file))
                        e.target.value = ""
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>

              <Box display="flex" justifyContent="flex-end" gap={1.5}>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="medium"
                  onClick={onBack}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: (theme) => alpha(theme.palette.text.primary, 0.05),
                    },
                  }}
                >
                  Cancelar
                </Button>

                <Button
                  variant="contained"
                  color="primary"
                  disableElevation
                  type="submit"
                  size="medium"
                  startIcon={<Save />}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.4)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(59, 130, 246, 0.5)",
                    },
                  }}
                >
                  Guardar
                </Button>
              </Box>
            </Box>
          )
        }}
      </Formik>
    </LayerCardForm>
  )
}
