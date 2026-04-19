import { Box, Chip, Divider, MenuItem, Stack, TextField, Typography, alpha } from "@mui/material"
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined"
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined"
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"
import { IUsersType } from "@/shared/interfaces/user"

export interface IDataUserByFilter {
  name: string
  companyId: string
  companyName: string
  type: keyof Omit<IUsersType, "SUPER_ADMIN"> | "SUPER_ADMIN" | "all"
  created_at: string
}

interface Props {
  onChange: (key: keyof IDataUserByFilter, value: string) => void
  userFilter: IDataUserByFilter
  nameOptions: string[]
  companyOptions: { id: string; name: string }[]
}

const USER_TYPE_ES: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrador",
  SELLER: "Usuario",
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

const TYPE_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "ADMIN", label: "Administrador" },
  { value: "SELLER", label: "Usuario" },
  { value: "SUPER_ADMIN", label: "Super Admin" },
]

export const FilterUserDataTable = ({
  onChange,
  userFilter,
  nameOptions,
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

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: "block", fontWeight: 600 }}>
              Tipo de usuario
            </Typography>
            <Box sx={chipGroupSx}>
              {TYPE_OPTIONS.map((opt) => {
                const active = userFilter.type === opt.value
                return (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    size="small"
                    onClick={() => onChange("type", opt.value)}
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

        {/* ── Sección 2: Empresa ── */}
        <Box>
          <Box sx={sectionLabelSx}>
            <BusinessOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Empresa y nombre
            </Typography>
          </Box>

          <Stack spacing={1.5}>
            <TextField
              select
              label="Nombre"
              fullWidth
              size="small"
              value={userFilter.name}
              onChange={(e) => onChange("name", e.target.value)}
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
              {nameOptions.map((n) => (
                <MenuItem key={n} value={n} sx={{ fontSize: "0.875rem" }}>{n}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Empresa"
              fullWidth
              size="small"
              value={userFilter.companyId}
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
              {companyOptions.map((c) => (
                <MenuItem key={c.id} value={c.id} sx={{ fontSize: "0.875rem" }}>{c.name}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </Box>

        <Divider />

        {/* ── Sección 3: Fecha ── */}
        <Box>
          <Box sx={sectionLabelSx}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Fecha
            </Typography>
          </Box>

          <TextField
            label="Fecha creado"
            type="date"
            fullWidth
            size="small"
            value={userFilter.created_at}
            onChange={(e) => onChange("created_at", e.target.value)}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: "text.secondary", mr: 0.75 }} />,
            }}
            sx={inputSx}
          />
        </Box>

      </Stack>
    </Box>
  )
}
