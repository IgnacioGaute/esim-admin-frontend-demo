import { Box, Chip, Divider, IconButton, InputAdornment, MenuItem, Stack, TextField, Tooltip, Typography, alpha } from "@mui/material"
import { Autocomplete } from "@mui/material"
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined"
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined"
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"

export type CompanyPaymentType = "PRE_PAYMENT" | "POST_PAYMENT" | "all"

type CompanyOpt = { id: string; name: string }

export interface IDataCompanyByFilter {
  companyId: string
  created_at: string
  updated_at: string
  paymentType: CompanyPaymentType
  balanceMin: string
}

interface Props {
  onChange: (key: keyof IDataCompanyByFilter, value: string) => void
  companyFilter: IDataCompanyByFilter
  companiesOptions: CompanyOpt[]
  balanceOptions: string[]
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

const PAYMENT_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "PRE_PAYMENT", label: "Prepago" },
  { value: "POST_PAYMENT", label: "Postpago" },
]

const isNumericLikeOrEmpty = (v: string) => v === "" || /^[0-9]+([.,][0-9]+)?$/.test(v)

export const FilterCompanyDataTable = ({
  onChange,
  companyFilter,
  companiesOptions,
  balanceOptions,
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

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: "block", fontWeight: 600 }}>
              Tipo de pago
            </Typography>
            <Box sx={chipGroupSx}>
              {PAYMENT_OPTIONS.map((opt) => {
                const active = companyFilter.paymentType === opt.value
                return (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    size="small"
                    onClick={() => onChange("paymentType", opt.value)}
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
        </Box>

        <Divider />

        {/* ── Sección 2: Empresa y balance ── */}
        <Box>
          <Box sx={sectionLabelSx}>
            <BusinessOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Empresa y balance
            </Typography>
          </Box>

          <Stack spacing={1.5}>
            <TextField
              select
              label="Empresa"
              fullWidth
              size="small"
              value={companyFilter.companyId}
              onChange={(e) => onChange("companyId", e.target.value)}
              sx={inputSx}
              SelectProps={{
                MenuProps: {
                  disablePortal: true,
                  PaperProps: { sx: { maxHeight: 280, overflowY: "auto" } },
                  MenuListProps: { dense: true, sx: { py: 0 } },
                },
              }}
            >
              <MenuItem value="" sx={{ fontSize: "0.875rem" }}>Todas</MenuItem>
              {companiesOptions.map((c) => (
                <MenuItem key={c.id} value={c.id} sx={{ fontSize: "0.875rem" }}>{c.name}</MenuItem>
              ))}
            </TextField>

            <Autocomplete
              freeSolo
              options={balanceOptions}
              value={companyFilter.balanceMin || null}
              inputValue={companyFilter.balanceMin}
              onChange={(_, v) => onChange("balanceMin", String(v ?? ""))}
              onInputChange={(_, v) => {
                if (isNumericLikeOrEmpty(v)) onChange("balanceMin", v)
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Balance"
                  placeholder="Ej: 500"
                  fullWidth
                  size="small"
                  sx={inputSx}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {params.InputProps.endAdornment}
                        <InputAdornment position="end" sx={{ ml: 0 }}>
                          <Tooltip title="Filtro dinámico: muestra solo balances enteros registrados (de menor a mayor). También podés escribir un número manualmente." arrow placement="top">
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

        <Divider />

        {/* ── Sección 3: Fechas ── */}
        <Box>
          <Box sx={sectionLabelSx}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Fechas
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              label="Fecha creado"
              type="date"
              fullWidth
              size="small"
              value={companyFilter.created_at}
              onChange={(e) => onChange("created_at", e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: "text.secondary", mr: 0.75 }} />,
              }}
              sx={inputSx}
            />
            <TextField
              label="Fecha actualizado"
              type="date"
              fullWidth
              size="small"
              value={companyFilter.updated_at}
              onChange={(e) => onChange("updated_at", e.target.value)}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: "text.secondary", mr: 0.75 }} />,
              }}
              sx={inputSx}
            />
          </Stack>
        </Box>

      </Stack>
    </Box>
  )
}
