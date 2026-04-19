import { Box, Chip, Divider, IconButton, InputAdornment, MenuItem, Stack, TextField, Tooltip, Typography, alpha } from "@mui/material"
import { Autocomplete } from "@mui/material"
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined"
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined"
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined"
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import { CompanyTopupProvider, CompanyTopupStatus } from "@/admin/utils/interfaces/company-topup.interface"

export interface IDataCompanyTopupFilter {
  provider: CompanyTopupProvider | "all"
  status: CompanyTopupStatus | "all"
  createdAt: string
  amountUsd: string
  company: string
}

interface Props {
  onChange: (key: keyof IDataCompanyTopupFilter, value: any) => void
  paymentFilter: IDataCompanyTopupFilter
  amountOptions: string[]
  companyOptions: string[]
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

const PROVIDER_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: CompanyTopupProvider.WEBPAY, label: "WebPay" },
  { value: CompanyTopupProvider.KHIPU, label: "Khipu" },
  { value: CompanyTopupProvider.BANK_TRANSFER, label: "Transferencia" },
]

const STATUS_OPTIONS = [
  { value: "all", label: "Todos", color: "" },
  { value: CompanyTopupStatus.INITIALIZED, label: "Inicializado", color: "#1565c0" },
  { value: CompanyTopupStatus.PENDING, label: "Pendiente", color: "#b45309" },
  { value: CompanyTopupStatus.PENDING_BANK_TRANSFER, label: "Pend. Transferencia", color: "#b45309" },
  { value: CompanyTopupStatus.PAID, label: "Pagado", color: "#2e7d32" },
  { value: CompanyTopupStatus.REJECTED, label: "Rechazado", color: "#c62828" },
  { value: CompanyTopupStatus.CANCELLED, label: "Cancelado", color: "#78350f" },
]

const isNumericLikeOrEmpty = (v: string) => v === "" || /^[0-9]+([.,][0-9]+)?$/.test(v)

export const FilterCompanyTopupDataTable = ({
  paymentFilter,
  onChange,
  amountOptions,
  companyOptions,
}: Props) => {
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
            {/* Proveedor */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: "block", fontWeight: 600 }}>
                Proveedor
              </Typography>
              <Box sx={chipGroupSx}>
                {PROVIDER_OPTIONS.map((opt) => {
                  const active = paymentFilter.provider === opt.value
                  return (
                    <Chip
                      key={opt.value}
                      label={opt.label}
                      size="small"
                      onClick={() => onChange("provider", opt.value)}
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

            {/* Estado */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: "block", fontWeight: 600 }}>
                Estado
              </Typography>
              <Box sx={chipGroupSx}>
                {STATUS_OPTIONS.map((opt) => {
                  const active = paymentFilter.status === opt.value
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

        {/* ── Sección 2: Empresa y fecha ── */}
        <Box>
          <Box sx={sectionLabelSx}>
            <BusinessOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Empresa y fecha
            </Typography>
          </Box>

          <Stack spacing={1.5}>
            <TextField
              select
              label="Empresa"
              fullWidth
              size="small"
              value={paymentFilter.company}
              onChange={(e) => onChange("company", e.target.value)}
              sx={inputSx}
              SelectProps={{
                MenuProps: {
                  disablePortal: true,
                  PaperProps: { sx: { maxHeight: 280, overflowY: "auto" } },
                  MenuListProps: { dense: true, sx: { py: 0 } },
                },
              }}
            >
              <MenuItem value="" sx={{ fontSize: "0.875rem" }}><em>Todas</em></MenuItem>
              {companyOptions.map((v) => (
                <MenuItem key={v} value={v} sx={{ fontSize: "0.875rem" }}>{v}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Fecha"
              type="date"
              fullWidth
              size="small"
              value={paymentFilter.createdAt}
              onChange={(e) => onChange("createdAt", e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: "text.secondary", mr: 0.75 }} />,
              }}
              sx={inputSx}
            />
          </Stack>
        </Box>

        <Divider />

        {/* ── Sección 3: Montos ── */}
        <Box>
          <Box sx={sectionLabelSx}>
            <AttachMoneyOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Montos
            </Typography>
          </Box>

          <Autocomplete
            freeSolo
            options={amountOptions}
            value={paymentFilter.amountUsd || null}
            inputValue={paymentFilter.amountUsd}
            onChange={(_, v) => onChange("amountUsd", String(v ?? ""))}
            onInputChange={(_, v) => {
              if (isNumericLikeOrEmpty(v)) onChange("amountUsd", v)
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Monto USD"
                placeholder="Ej: 100"
                fullWidth
                size="small"
                sx={inputSx}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {params.InputProps.endAdornment}
                      <InputAdornment position="end" sx={{ ml: 0 }}>
                        <Tooltip title="Filtro dinámico: muestra solo montos enteros registrados en los pagos. También podés escribir un número manualmente." arrow placement="top">
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
        </Box>

      </Stack>
    </Box>
  )
}

export default FilterCompanyTopupDataTable
