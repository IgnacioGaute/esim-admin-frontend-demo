import { Box, Chip, Divider, IconButton, InputAdornment, MenuItem, Stack, TextField, Tooltip, Typography, alpha } from "@mui/material"
import { Autocomplete } from "@mui/material"
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined"
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined"
import NumbersOutlinedIcon from "@mui/icons-material/NumbersOutlined"
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"

export interface IDataCouponByFilter {
  code: string
  created_at: string
  updated_at: string
  discount_percent: string
  count: string
  used_count: string
  cantRest: string
  enabled: "all" | "true" | "false"
}

interface Props {
  couponFilter: IDataCouponByFilter
  codeOptions: string[]
  onChange: (key: keyof IDataCouponByFilter, value: string) => void
  countOptions: string[]
  usedCountOptions: string[]
  cantRestOptions: string[]
}

const OPTIONS_1_100 = Array.from({ length: 100 }, (_, i) => `${i + 1}%`)
const onlyDigitsOrEmpty = (v: string) => v === "" || /^\d+$/.test(v)

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

const ENABLED_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "true", label: "SI", color: "#2e7d32" },
  { value: "false", label: "NO", color: "#c62828" },
]

const TIP_DYNAMIC_INT = "Filtro dinámico: muestra solo números enteros registrados (de menor a mayor). También podés escribir un número manualmente."

const EndInfo = () => (
  <InputAdornment position="end" sx={{ ml: 0 }}>
    <Tooltip title={TIP_DYNAMIC_INT} arrow placement="top">
      <IconButton size="small" tabIndex={-1} sx={{ p: 0.25 }}>
        <InfoOutlinedIcon sx={{ fontSize: 15, opacity: 0.55 }} />
      </IconButton>
    </Tooltip>
  </InputAdornment>
)

export const FilterCouponDataTable = ({
  onChange,
  couponFilter,
  codeOptions,
  countOptions,
  usedCountOptions,
  cantRestOptions,
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
              Habilitado
            </Typography>
            <Box sx={chipGroupSx}>
              {ENABLED_OPTIONS.map((opt) => {
                const active = couponFilter.enabled === opt.value
                const color = (opt as any).color || ""
                return (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    size="small"
                    onClick={() => onChange("enabled", opt.value)}
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.78rem",
                      borderRadius: "10px",
                      height: 30,
                      cursor: "pointer",
                      transition: "all 0.18s ease",
                      bgcolor: active && color
                        ? `${color}18`
                        : active
                        ? (theme) => alpha(theme.palette.primary.main, 0.12)
                        : (theme) => alpha(theme.palette.text.secondary, 0.07),
                      color: active && color ? color : active ? "primary.main" : "text.secondary",
                      border: "1.5px solid",
                      borderColor: active && color ? color : active ? "primary.main" : "transparent",
                      "&:hover": {
                        bgcolor: color ? `${color}14` : (theme: any) => alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  />
                )
              })}
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* ── Sección 2: Cupón ── */}
        <Box>
          <Box sx={sectionLabelSx}>
            <LocalOfferOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Cupón
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              select
              label="Código"
              fullWidth
              size="small"
              value={couponFilter.code}
              onChange={(e) => onChange("code", e.target.value)}
              sx={inputSx}
              SelectProps={{
                MenuProps: {
                  disablePortal: true,
                  PaperProps: { sx: { maxHeight: 280, overflowY: "auto" } },
                  MenuListProps: { dense: true, sx: { py: 0 } },
                },
              }}
            >
              <MenuItem value="" sx={{ fontSize: "0.875rem" }}>Todos</MenuItem>
              {codeOptions.map((c) => (
                <MenuItem key={c} value={c} sx={{ fontSize: "0.875rem" }}>{c}</MenuItem>
              ))}
            </TextField>

            <Autocomplete
              freeSolo
              options={OPTIONS_1_100}
              value={couponFilter.discount_percent ? `${couponFilter.discount_percent}%` : null}
              inputValue={couponFilter.discount_percent ? `${couponFilter.discount_percent}%` : ""}
              onChange={(_, v) => {
                const raw = String(v ?? "").replace(/%/g, "")
                onChange("discount_percent", raw)
              }}
              onInputChange={(_, v) => {
                const raw = v.replace(/%/g, "")
                if (onlyDigitsOrEmpty(raw)) onChange("discount_percent", raw)
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="% descuento"
                  placeholder="Ej: 10"
                  fullWidth
                  size="small"
                  sx={inputSx}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {params.InputProps.endAdornment}
                        <EndInfo />
                      </>
                    ),
                  }}
                />
              )}
            />
          </Stack>
        </Box>

        <Divider />

        {/* ── Sección 3: Cantidades ── */}
        <Box>
          <Box sx={sectionLabelSx}>
            <NumbersOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Cantidades
            </Typography>
          </Box>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1.5 }}>
            <Autocomplete
              freeSolo
              options={countOptions}
              value={couponFilter.count || null}
              inputValue={couponFilter.count}
              onChange={(_, v) => onChange("count", String(v ?? ""))}
              onInputChange={(_, v) => { if (onlyDigitsOrEmpty(v)) onChange("count", v) }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Cantidad"
                  fullWidth
                  size="small"
                  sx={inputSx}
                  InputProps={{ ...params.InputProps, endAdornment: <>{params.InputProps.endAdornment}<EndInfo /></> }}
                />
              )}
            />

            <Autocomplete
              freeSolo
              options={usedCountOptions}
              value={couponFilter.used_count || null}
              inputValue={couponFilter.used_count}
              onChange={(_, v) => onChange("used_count", String(v ?? ""))}
              onInputChange={(_, v) => { if (onlyDigitsOrEmpty(v)) onChange("used_count", v) }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Usada"
                  fullWidth
                  size="small"
                  sx={inputSx}
                  InputProps={{ ...params.InputProps, endAdornment: <>{params.InputProps.endAdornment}<EndInfo /></> }}
                />
              )}
            />

            <Autocomplete
              freeSolo
              options={cantRestOptions}
              value={couponFilter.cantRest || null}
              inputValue={couponFilter.cantRest}
              onChange={(_, v) => onChange("cantRest", String(v ?? ""))}
              onInputChange={(_, v) => { if (onlyDigitsOrEmpty(v)) onChange("cantRest", v) }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Restante"
                  fullWidth
                  size="small"
                  sx={inputSx}
                  InputProps={{ ...params.InputProps, endAdornment: <>{params.InputProps.endAdornment}<EndInfo /></> }}
                />
              )}
            />
          </Box>
        </Box>

        <Divider />

        {/* ── Sección 4: Fechas ── */}
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
              value={couponFilter.created_at}
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
              value={couponFilter.updated_at}
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
