import { useLayoutEffect, useRef, useState } from "react"
import {
  Autocomplete,
  Box,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material"
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined"
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined"
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import {
  BusinessIntention,
  RequestType,
  Status,
} from "@/admin/utils/interfaces/partners.interface"

export interface IDataPartnerByFilter {
  name: string
  country: string
  email: string
  ownerName: string
  status: Status | "all"
  requestType: RequestType | "all"
  businessIntention: BusinessIntention | "all"
}

interface Props {
  onChange: (key: keyof IDataPartnerByFilter, value: any) => void
  partnerFilter: IDataPartnerByFilter
  companyNameOptions: string[]
  countryOptions: string[]
  emailOptions: string[]
  ownerNameOptions: string[]
}

const sectionLabelSx = {
  display: "flex",
  alignItems: "center",
  gap: 0.75,
  mb: 1.25,
}

const chipGroupSx = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: 0.75,
}

const inputSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    fontSize: "0.875rem",
  },
}

const STATUS_OPTIONS = [
  { value: "all", label: "Todos", color: "" },
  { value: Status.PENDING, label: "Pendiente", color: "#b45309" },
  { value: Status.APPROVED, label: "Aprobado", color: "#2e7d32" },
  { value: Status.REJECTED, label: "Rechazado", color: "#c62828" },
]

const REQUEST_TYPE_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: RequestType.OWN_USE, label: "Personal" },
  { value: RequestType.INFLUENCE, label: "Influencer" },
  { value: RequestType.TECH_COMPANY, label: "Empresa Tech" },
  { value: RequestType.TRAVEL_AGENCY, label: "Agencia de viaje" },
  { value: RequestType.OTHER, label: "Otro" },
]

const BUSINESS_INTENTION_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: BusinessIntention.SELL_TO_END_CUSTOMERS, label: "Vender a clientes" },
  { value: BusinessIntention.RESELL_TO_AGENCIES, label: "Revender agencias" },
  { value: BusinessIntention.BOTH, label: "Ambas" },
]

export const FilterPartnerDataTable = ({
  partnerFilter,
  onChange,
  companyNameOptions,
  countryOptions,
  emailOptions,
  ownerNameOptions,
}: Props) => {
  const nameRef = useRef<HTMLDivElement | null>(null)
  const [nameMenuWidth, setNameMenuWidth] = useState<number | undefined>(undefined)
  useLayoutEffect(() => {
    const el = nameRef.current
    if (!el) return
    const update = () => setNameMenuWidth(Math.round(el.getBoundingClientRect().width))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const menuProps = (width: number | undefined) => ({
    disablePortal: true,
    PaperProps: { sx: { ...(width !== undefined ? { width } : {}), maxHeight: 280, overflowY: "auto" } },
    MenuListProps: { dense: true, sx: { py: 0 } },
  })

  return (
    <Box sx={{ px: 0.5, py: 0.5 }}>
      <Stack spacing={2.5}>

        {/* ── Sección 1: General ── */}
        <Box>
          <Box sx={sectionLabelSx}>
            <FilterListOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              General
            </Typography>
          </Box>

          <Stack spacing={2}>
            {/* Estado */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: "block", fontWeight: 600 }}>
                Estado
              </Typography>
              <Box sx={chipGroupSx}>
                {STATUS_OPTIONS.map((opt) => {
                  const active = partnerFilter.status === opt.value
                  return (
                    <Chip
                      key={opt.value}
                      label={opt.label}
                      size="small"
                      onClick={() => onChange("status", opt.value)}
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.78rem",
                        borderRadius: "10px",
                        height: 30,
                        cursor: "pointer",
                        transition: "all 0.18s ease",
                        bgcolor: active && opt.color
                          ? `${opt.color}18`
                          : active
                          ? (theme) => alpha(theme.palette.primary.main, 0.12)
                          : (theme) => alpha(theme.palette.text.secondary, 0.07),
                        color: active && opt.color ? opt.color : active ? "primary.main" : "text.secondary",
                        border: "1.5px solid",
                        borderColor: active && opt.color ? opt.color : active ? "primary.main" : "transparent",
                        "&:hover": {
                          bgcolor: opt.color ? `${opt.color}14` : (theme: any) => alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    />
                  )
                })}
              </Box>
            </Box>
          </Stack>
        </Box>

        <Divider />

        {/* ── Sección 2: Tipo de solicitud e intención ── */}
        <Box>
          <Box sx={sectionLabelSx}>
            <HandshakeOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Tipo de solicitud e intención
            </Typography>
          </Box>

          <Stack spacing={2}>
            {/* Tipo de solicitud */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: "block", fontWeight: 600 }}>
                Tipo de solicitud
              </Typography>
              <Box sx={chipGroupSx}>
                {REQUEST_TYPE_OPTIONS.map((opt) => {
                  const active = partnerFilter.requestType === opt.value
                  return (
                    <Chip
                      key={opt.value}
                      label={opt.label}
                      size="small"
                      onClick={() => onChange("requestType", opt.value)}
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.78rem",
                        borderRadius: "10px",
                        height: 30,
                        cursor: "pointer",
                        transition: "all 0.18s ease",
                        bgcolor: active
                          ? (theme) => alpha(theme.palette.primary.main, 0.12)
                          : (theme) => alpha(theme.palette.text.secondary, 0.07),
                        color: active ? "primary.main" : "text.secondary",
                        border: "1.5px solid",
                        borderColor: active ? "primary.main" : "transparent",
                        "&:hover": {
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    />
                  )
                })}
              </Box>
            </Box>

            {/* Intención de negocio */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: "block", fontWeight: 600 }}>
                Intención de negocio
              </Typography>
              <Box sx={chipGroupSx}>
                {BUSINESS_INTENTION_OPTIONS.map((opt) => {
                  const active = partnerFilter.businessIntention === opt.value
                  return (
                    <Chip
                      key={opt.value}
                      label={opt.label}
                      size="small"
                      onClick={() => onChange("businessIntention", opt.value)}
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.78rem",
                        borderRadius: "10px",
                        height: 30,
                        cursor: "pointer",
                        transition: "all 0.18s ease",
                        bgcolor: active
                          ? (theme) => alpha(theme.palette.primary.main, 0.12)
                          : (theme) => alpha(theme.palette.text.secondary, 0.07),
                        color: active ? "primary.main" : "text.secondary",
                        border: "1.5px solid",
                        borderColor: active ? "primary.main" : "transparent",
                        "&:hover": {
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                        },
                      }}
                    />
                  )
                })}
              </Box>
            </Box>
          </Stack>
        </Box>

        <Divider />

        {/* ── Sección 3: Empresa y contacto ── */}
        <Box>
          <Box sx={sectionLabelSx}>
            <BusinessOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Empresa y contacto
            </Typography>
          </Box>

          <Stack spacing={1.5}>
            <Box ref={nameRef}>
              <TextField
                select
                label="Empresa"
                fullWidth
                size="small"
                value={partnerFilter.name}
                onChange={(e) => onChange("name", e.target.value)}
                sx={inputSx}
                SelectProps={{ MenuProps: menuProps(nameMenuWidth) }}
              >
                <MenuItem value="" sx={{ fontSize: "0.875rem" }}><em>Todas</em></MenuItem>
                {companyNameOptions.map((v) => (
                  <MenuItem key={v} value={v} sx={{ fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: nameMenuWidth }}>
                    {v}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <TextField
                select
                label="País"
                fullWidth
                size="small"
                value={partnerFilter.country}
                onChange={(e) => onChange("country", e.target.value)}
                sx={inputSx}
                SelectProps={{ MenuProps: { disablePortal: true, PaperProps: { sx: { maxHeight: 280 } }, MenuListProps: { dense: true, sx: { py: 0 } } } }}
              >
                <MenuItem value="" sx={{ fontSize: "0.875rem" }}><em>Todos</em></MenuItem>
                {countryOptions.map((v) => (
                  <MenuItem key={v} value={v} sx={{ fontSize: "0.875rem" }}>{v}</MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Usuario"
                fullWidth
                size="small"
                value={partnerFilter.ownerName}
                onChange={(e) => onChange("ownerName", e.target.value)}
                sx={inputSx}
                SelectProps={{ MenuProps: { disablePortal: true, PaperProps: { sx: { maxHeight: 280 } }, MenuListProps: { dense: true, sx: { py: 0 } } } }}
              >
                <MenuItem value="" sx={{ fontSize: "0.875rem" }}><em>Todos</em></MenuItem>
                {ownerNameOptions.map((v) => (
                  <MenuItem key={v} value={v} sx={{ fontSize: "0.875rem" }}>{v}</MenuItem>
                ))}
              </TextField>
            </Stack>

            <Autocomplete
              freeSolo
              options={emailOptions}
              value={partnerFilter.email || null}
              inputValue={partnerFilter.email}
              onChange={(_, v) => onChange("email", String(v ?? ""))}
              onInputChange={(_, v) => onChange("email", v)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Email"
                  fullWidth
                  size="small"
                  sx={inputSx}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {params.InputProps.endAdornment}
                        <InputAdornment position="end" sx={{ ml: 0 }}>
                          <Tooltip title="Filtro dinámico: muestra solo emails registrados en los partners." arrow placement="top">
                            <IconButton size="small" tabIndex={-1} sx={{ p: 0.25 }}>
                              <InfoOutlinedIcon sx={{ fontSize: 15, opacity: 0.55 }} />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      </>
                    ),
                  }}
                />
              )}
            />
          </Stack>
        </Box>

      </Stack>
    </Box>
  )
}
