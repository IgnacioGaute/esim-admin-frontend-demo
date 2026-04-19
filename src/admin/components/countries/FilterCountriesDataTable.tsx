import { Box, Chip, Divider, MenuItem, Stack, TextField, Typography, alpha } from "@mui/material"
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined"
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined"

export interface IDataCountryByFilter {
  enabled: "all" | "true" | "false"
  updatedBy: string
}

interface Props {
  filter: IDataCountryByFilter
  updatedByOptions: string[]
  onChange: (key: keyof IDataCountryByFilter, value: any) => void
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

const ENABLED_OPTIONS = [
  { value: "all", label: "Todos", color: "" },
  { value: "true", label: "Activo", color: "#2e7d32" },
  { value: "false", label: "Inactivo", color: "#c62828" },
]

export const FilterCountriesDataTable = ({ filter, updatedByOptions, onChange }: Props) => {
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
              Estado
            </Typography>
            <Box sx={chipGroupSx}>
              {ENABLED_OPTIONS.map((opt) => {
                const active = filter.enabled === opt.value
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
        </Box>

        <Divider />

        {/* ── Sección 2: Actualizado por ── */}
        <Box>
          <Box sx={sectionLabelSx}>
            <PersonOutlineOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Actualizado por
            </Typography>
          </Box>

          <TextField
            select
            label="Usuario"
            fullWidth
            size="small"
            value={filter.updatedBy}
            onChange={(e) => onChange("updatedBy", e.target.value)}
            sx={inputSx}
            SelectProps={{
              MenuProps: {
                disablePortal: true,
                PaperProps: { sx: { maxHeight: 280, overflowY: "auto" } },
                MenuListProps: { dense: true, sx: { py: 0 } },
              },
            }}
          >
            <MenuItem value="" sx={{ fontSize: "0.875rem" }}><em>Todos</em></MenuItem>
            {updatedByOptions.map((v) => (
              <MenuItem key={v} value={v} sx={{ fontSize: "0.875rem" }}>{v}</MenuItem>
            ))}
          </TextField>
        </Box>

      </Stack>
    </Box>
  )
}
