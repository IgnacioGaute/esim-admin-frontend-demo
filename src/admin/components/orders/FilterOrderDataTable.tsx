import { useLayoutEffect, useMemo, useRef, useState } from "react"
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
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined"
import FilterListOutlinedIcon from "@mui/icons-material/FilterListOutlined"
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined"
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined"

export type IDataOrderByFilter = {
  channel: string
  state_order: string
  reseller: string
  order_date: string
  salePrice: string
  esimCost: string
  totalPrice: string
  quantity: string
  marginPercent: string
  marginMoney: string
}

interface Props {
  orderFilter: IDataOrderByFilter
  onChange: (field: keyof IDataOrderByFilter, value: string) => void
  resellerOptions: Array<{ value: string; label: string }>
  salePriceOptions: string[]
  esimCostOptions: string[]
  marginMoneyOptions: string[]
  quantityOptions: string[]
  totalPriceOptions: string[]
}

const OPTIONS_1_100_PCT = Array.from({ length: 100 }, (_, i) => `${i + 1}%`)

const isNumericLikeOrEmpty = (v: string) => v === "" || /^[0-9]+([.,][0-9]+)?$/.test(v)

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

export const FilterOrderDataTable = ({
  orderFilter,
  onChange,
  resellerOptions,
  salePriceOptions,
  esimCostOptions,
  marginMoneyOptions,
  quantityOptions,
  totalPriceOptions,
}: Props) => {
  const resellerOptionsUnique = useMemo(
    () => Array.from(new Map((resellerOptions ?? []).map((o) => [String(o.value), o])).values()),
    [resellerOptions]
  )

  const resellerFieldRef = useRef<HTMLDivElement | null>(null)
  const [resellerMenuWidth, setResellerMenuWidth] = useState<number | undefined>(undefined)

  useLayoutEffect(() => {
    const el = resellerFieldRef.current
    if (!el) return
    const update = () => setResellerMenuWidth(Math.round(el.getBoundingClientRect().width))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const NumericSelectFree = ({
    label,
    field,
    value,
    options = [],
    withPercent = false,
    placeholder,
  }: {
    label: string
    field: "salePrice" | "esimCost" | "totalPrice" | "quantity" | "marginPercent" | "marginMoney"
    value: string
    options?: string[]
    withPercent?: boolean
    placeholder?: string
  }) => {
    const displayValue = withPercent && value ? `${value}%` : value
    return (
      <Autocomplete
        freeSolo
        options={options}
        value={displayValue || null}
        inputValue={displayValue}
        onChange={(_, v) => {
          const raw = String(v ?? "")
          const cleaned = withPercent ? raw.replace(/%/g, "") : raw
          onChange(field as any, cleaned.trim())
        }}
        onInputChange={(_, v) => {
          const raw = String(v ?? "")
          const cleaned = withPercent ? raw.replace(/%/g, "") : raw
          if (isNumericLikeOrEmpty(cleaned)) onChange(field as any, cleaned.trim())
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            fullWidth
            size="small"
            sx={inputSx}
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {params.InputProps.endAdornment}
                  <InputAdornment position="end" sx={{ ml: 0 }}>
                    <Tooltip
                      title="Filtro dinámico: muestra solo números enteros registrados en las órdenes (de menor a mayor). También podés escribir un número manualmente."
                      arrow
                      placement="top"
                    >
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
    )
  }

  const CANAL_OPTIONS = [
    { value: "all", label: "Todos" },
    { value: "WEB", label: "Web" },
    { value: "APP", label: "App" },
    { value: "RESELLER", label: "Reseller" },
  ]

  const STATE_OPTIONS = [
    { value: "all", label: "Todos" },
    { value: "initialized", label: "Inicializados" },
    { value: "paid", label: "Pagados" },
    { value: "rejected", label: "Rechazados" },
    { value: "canceled", label: "Cancelados" },
  ]

  const activeChipSx = (color: "primary" | "secondary" | "success" | "error" | "warning") => ({
    fontWeight: 700,
    fontSize: "0.78rem",
    borderRadius: "10px",
    height: 30,
    cursor: "pointer",
    transition: "all 0.18s ease",
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
            {/* Canal */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: "block", fontWeight: 600 }}>
                Canal
              </Typography>
              <Box sx={chipGroupSx}>
                {CANAL_OPTIONS.map((opt) => {
                  const active = orderFilter.channel === opt.value
                  return (
                    <Chip
                      key={opt.value}
                      label={opt.label}
                      size="small"
                      onClick={() => onChange("channel", opt.value)}
                      sx={{
                        ...activeChipSx("primary"),
                        bgcolor: active
                          ? (theme) => alpha(theme.palette.primary.main, 0.12)
                          : (theme) => alpha(theme.palette.text.secondary, 0.07),
                        color: active ? "primary.main" : "text.secondary",
                        border: active ? "1.5px solid" : "1.5px solid transparent",
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
                {STATE_OPTIONS.map((opt) => {
                  const active = orderFilter.state_order === opt.value
                  const colorMap: Record<string, string> = {
                    paid: "#2e7d32",
                    rejected: "#c62828",
                    canceled: "#b45309",
                    initialized: "#1565c0",
                    all: "",
                  }
                  const color = colorMap[opt.value] || ""
                  return (
                    <Chip
                      key={opt.value}
                      label={opt.label}
                      size="small"
                      onClick={() => onChange("state_order", opt.value)}
                      sx={{
                        ...activeChipSx("primary"),
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
          </Stack>
        </Box>

        <Divider />

        {/* ── Sección 2: Reseller y Fecha ── */}
        <Box>
          <Box sx={sectionLabelSx}>
            <StorefrontOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Reseller y fecha
            </Typography>
          </Box>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Box ref={resellerFieldRef} sx={{ flex: 2 }}>
              <TextField
                select
                label="Reseller"
                fullWidth
                size="small"
                value={orderFilter.reseller}
                onChange={(e) => onChange("reseller", e.target.value)}
                sx={inputSx}
                SelectProps={{
                  MenuProps: {
                    disablePortal: true,
                    PaperProps: {
                      sx: { width: resellerMenuWidth, maxHeight: 280, overflowY: "auto" },
                    },
                    MenuListProps: { dense: true, sx: { py: 0 } },
                  },
                }}
              >
                {resellerOptionsUnique.map((r) => (
                  <MenuItem key={r.value} value={r.value} sx={{ fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: resellerMenuWidth }}>
                    {r.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box sx={{ flex: 1 }}>
              <TextField
                label="Fecha Orden"
                type="date"
                fullWidth
                size="small"
                value={orderFilter.order_date}
                onChange={(e) => onChange("order_date", e.target.value)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: "text.secondary", mr: 0.75 }} />,
                }}
                sx={inputSx}
              />
            </Box>
          </Stack>
        </Box>

        <Divider />

        {/* ── Sección 3: Numéricos ── */}
        <Box>
          <Box sx={sectionLabelSx}>
            <AttachMoneyOutlinedIcon sx={{ fontSize: 15, color: "text.secondary" }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Montos y cantidades
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" },
              gap: 1.5,
            }}
          >
            <NumericSelectFree label="Precio Venta" field="salePrice" value={orderFilter.salePrice} options={salePriceOptions} placeholder="Ej: 9" />
            <NumericSelectFree label="Costo eSIM" field="esimCost" value={orderFilter.esimCost} options={esimCostOptions} placeholder="Ej: 5" />
            <NumericSelectFree label="Margen %" field="marginPercent" value={orderFilter.marginPercent} options={OPTIONS_1_100_PCT} withPercent placeholder="Ej: 65" />
            <NumericSelectFree label="Margen $" field="marginMoney" value={orderFilter.marginMoney} options={marginMoneyOptions} placeholder="Ej: 3" />
            <NumericSelectFree label="Cantidad" field="quantity" value={orderFilter.quantity} options={quantityOptions} placeholder="Ej: 1" />
            <NumericSelectFree label="Total Venta" field="totalPrice" value={orderFilter.totalPrice} options={totalPriceOptions} placeholder="Ej: 9" />
          </Box>
        </Box>
      </Stack>
    </Box>
  )
}
