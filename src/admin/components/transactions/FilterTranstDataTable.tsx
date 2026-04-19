import { Box, Chip, Divider, IconButton, InputAdornment, MenuItem, Stack, TextField, Tooltip, Typography, alpha } from "@mui/material"
import { Autocomplete } from "@mui/material"
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined"
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined"
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined"
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import { ITransactionType, TRANSACTION_TYPE_RESP, TRANSACTION_STATUS_RESP } from "@/admin/utils"

type TxStatusKey = keyof typeof TRANSACTION_STATUS_RESP
const itemsTypeTransaction: Array<keyof ITransactionType> = ["ADD_BALANCE", "BUY_ESIM", "SUBTRACT_BALANCE"]
const itemsStatusTransaction: TxStatusKey[] = ["PENDING", "COMPLETED"] as TxStatusKey[]

export interface IDataTransactionByFilter {
  type: keyof ITransactionType | "all"
  status: TxStatusKey | "all"
  createdAt: string
  amountMin: string
  owner: string
}

interface Props {
  onChange: (key: keyof IDataTransactionByFilter, value: any) => void
  transactionFilter: IDataTransactionByFilter
  amountOptions: string[]
  ownerOptions: string[]
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
  { value: "ADD_BALANCE", label: TRANSACTION_TYPE_RESP["ADD_BALANCE"] },
  { value: "BUY_ESIM", label: TRANSACTION_TYPE_RESP["BUY_ESIM"] },
  { value: "SUBTRACT_BALANCE", label: TRANSACTION_TYPE_RESP["SUBTRACT_BALANCE"] },
]

const STATUS_OPTIONS = [
  { value: "all", label: "Todos", color: "" },
  { value: "PENDING", label: "Pendiente", color: "#b45309" },
  { value: "COMPLETED", label: "Completado", color: "#2e7d32" },
]

const isNumericLikeOrEmpty = (v: string) => v === "" || /^[0-9]+([.,][0-9]+)?$/.test(v)

export const FilterTranstDataTable = ({ transactionFilter, onChange, amountOptions, ownerOptions }: Props) => {
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
            {/* Tipo */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: "block", fontWeight: 600 }}>
                Tipo de transacción
              </Typography>
              <Box sx={chipGroupSx}>
                {TYPE_OPTIONS.map((opt) => {
                  const active = transactionFilter.type === opt.value
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

            {/* Estado */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: "block", fontWeight: 600 }}>
                Estado
              </Typography>
              <Box sx={chipGroupSx}>
                {STATUS_OPTIONS.map((opt) => {
                  const active = transactionFilter.status === opt.value
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

        {/* ── Sección 2: Usuario y fecha ── */}
        <Box>
          <Box sx={sectionLabelSx}>
            <PersonOutlineOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Usuario y fecha
            </Typography>
          </Box>

          <Stack spacing={1.5}>
            <TextField
              select
              label="Usuario / Empresa"
              fullWidth
              size="small"
              value={transactionFilter.owner}
              onChange={(e) => onChange("owner", e.target.value)}
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
              {ownerOptions.map((v) => (
                <MenuItem key={v} value={v} sx={{ fontSize: "0.875rem" }}>{v}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Fecha"
              type="date"
              fullWidth
              size="small"
              value={transactionFilter.createdAt}
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
            value={transactionFilter.amountMin || null}
            inputValue={transactionFilter.amountMin}
            onChange={(_, v) => onChange("amountMin", String(v ?? ""))}
            onInputChange={(_, v) => {
              if (isNumericLikeOrEmpty(v)) onChange("amountMin", v)
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Monto"
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
                        <Tooltip title="Filtro dinámico: muestra solo montos enteros registrados (de menor a mayor). También podés escribir un número manualmente." arrow placement="top">
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
