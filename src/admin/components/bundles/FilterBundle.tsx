import { Box, Chip, Divider, Stack, TextField, Typography, alpha } from "@mui/material"
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined"
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"

export interface IDataBundleyByFilter {
  provider: string
  created_at: DateBundle
}

interface DateBundle { from: string; to: string }

interface Props {
  onChange: (key: keyof IDataBundleyByFilter, value: string, at_field?: keyof DateBundle) => void
  bundleFilter: IDataBundleyByFilter
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
  { value: "ESIMGO", label: "ESIMGO" },
  { value: "CHOICE", label: "CHOICE" },
]

export const FilterBundle = ({ bundleFilter, onChange }: Props) => {
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
              Proveedor
            </Typography>
            <Box sx={chipGroupSx}>
              {PROVIDER_OPTIONS.map((opt) => {
                const active = bundleFilter.provider === opt.value
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
        </Box>

        <Divider />

        {/* ── Sección 2: Fechas ── */}
        <Box>
          <Box sx={sectionLabelSx}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Fechas
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              label="Desde"
              type="date"
              fullWidth
              size="small"
              value={bundleFilter.created_at.from}
              onChange={(e) => onChange("created_at", e.target.value, "from")}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: "text.secondary", mr: 0.75 }} />,
              }}
              sx={inputSx}
            />
            <TextField
              label="Hasta"
              type="date"
              fullWidth
              size="small"
              value={bundleFilter.created_at.to}
              onChange={(e) => onChange("created_at", e.target.value, "to")}
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
