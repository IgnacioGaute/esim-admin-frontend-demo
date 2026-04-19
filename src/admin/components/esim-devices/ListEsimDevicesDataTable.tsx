import React, { useMemo, useState } from "react"
import {
  Box,
  Button,
  IconButton,
  Typography,
  Chip,
  Tooltip,
  Grid,
  MenuItem,
  TextField,
  InputAdornment,
  Fade,
  alpha,
  Drawer,
  Stack,
  Divider,
} from "@mui/material"
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"
import { Edit, DeleteOutline, Devices, TipsAndUpdates } from "@mui/icons-material"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined"
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined"
import FilterListOffOutlinedIcon from "@mui/icons-material/FilterListOffOutlined"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import logo2x from "@/assets/images/logo/esim-logo.svg"

import { useDataTable } from "@/shared/hooks/useDataTable"
import { DataTable, DataTableToolbar, PaperDataTable } from "@/shared/components/data-table"
import { DataTableHeadCellProps } from "@/shared/interfaces/hooks/use-data-table.interface"
import { formatterDateDDMMYYYY } from "@/shared/helpers/handligDateHelper"

import { onFilterDataTable, onSearchDataTable } from "@/shared/helpers/hooks/useDataTableHelper"

import { IDeviceModel } from "@/admin/utils/interfaces/esim-devices.interface"

type Role = "SUPER_ADMIN" | "ADMIN" | "SELLER"

interface CurrentUser {
  id: string
  type: Role
  companyId?: string | null
}

interface Props {
  modelList: Array<IDeviceModel & { brandName?: string }>
  currentUser?: CurrentUser | null
  loading?: boolean

  onShowModel: (model: IDeviceModel) => void
  onEdit: (modelId: string) => void
  onDelete: (modelId: string) => void
}

export interface IDeviceFilters {
  brand: string
  isActive: "all" | "true" | "false"
  maxEsims: string
  createdAt: string
}

const initFilters: IDeviceFilters = {
  brand: "all",
  isActive: "all",
  maxEsims: "",
  createdAt: "",
}

interface FilterProps {
  filters: IDeviceFilters
  brands: string[]
  maxEsimsOptions: string[]
  onChange: (key: keyof IDeviceFilters, value: string) => void
}

const EndInfo = ({ tip }: { tip: string }) => (
  <InputAdornment position="end" sx={{ ml: 0.5 }}>
    <Tooltip title={tip} arrow placement="top">
      <IconButton size="small" tabIndex={-1} sx={{ p: 2 }}>
        <InfoOutlinedIcon sx={{ fontSize: 16, opacity: 0.8 }} />
      </IconButton>
    </Tooltip>
  </InputAdornment>
)

const FilterEsimDevicesDataTable = ({ filters, brands, maxEsimsOptions, onChange }: FilterProps) => {
  return (
    <Grid container spacing={2} sx={{ pt: 0.5 }}>
      <Grid item xs={12} md={6}>
        <TextField
          select
          label="Marca"
          value={filters.brand}
          fullWidth
          onChange={(e) => onChange("brand", e.target.value)}
        >
          <MenuItem value="all">Todas</MenuItem>
          {brands.map((b) => (
            <MenuItem key={b} value={b}>
              {b}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          select
          label="Estado"
          value={filters.isActive}
          fullWidth
          onChange={(e) => onChange("isActive", e.target.value)}
        >
          <MenuItem value="all">Todos</MenuItem>
          <MenuItem value="true">Activo</MenuItem>
          <MenuItem value="false">Inactivo</MenuItem>
        </TextField>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          select
          label="Máx eSIMs"
          value={filters.maxEsims}
          fullWidth
          onChange={(e) => onChange("maxEsims", e.target.value)}
          InputProps={{
            endAdornment: (
              <EndInfo tip="Filtro dinámico: muestra solo valores ENTEROS de 'Máx eSIMs' que existen en los modelos registrados (ordenados de menor a mayor). Filtra por valor EXACTO (=)." />
            ),
          }}
        >
          <MenuItem value="">Todos</MenuItem>
          {maxEsimsOptions.map((v) => (
            <MenuItem key={v} value={v}>
              {v}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label="Creado"
          type="date"
          value={filters.createdAt}
          fullWidth
          InputLabelProps={{ shrink: true }}
          onChange={(e) => onChange("createdAt", e.target.value)}
        />
      </Grid>
    </Grid>
  )
}

const getCreatedByLabel = (row: any) => {
  const by = row?.createdBy
  if (by == null) return "Steve Sladovnik"

  const name = String(by?.name ?? "").trim()
  if (name) return name

  const email = String(by?.email ?? "").trim()
  if (email) return email

  return "-"
}

const blobToDataURL = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })

const drawHeaderFactory = (doc: jsPDF, logoDataUrl: string | null, totalRows: number) => {
  const pageWidth = doc.internal.pageSize.getWidth()
  const marginX = 52
  const safeRight = pageWidth - marginX

  const hr = (y: number) => {
    doc.setDrawColor(210)
    doc.setLineWidth(0.8)
    doc.line(marginX, y, safeRight, y)
  }

  return () => {
    const topY = 26

    if (logoDataUrl) doc.addImage(logoDataUrl, "PNG", marginX, topY, 110, 34)

    const textX = logoDataUrl ? marginX + 125 : marginX

    doc.setTextColor(0)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.text("Dispositivos eSIM", textX, topY + 16)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Generado: ${new Date().toLocaleString()}`, textX, topY + 34)
    doc.text(`Registros: ${totalRows}`, textX, topY + 48)

    hr(topY + 64)
  }
}

const addDaysYYYYMMDD = (yyyy_mm_dd: string, days: number) => {
  if (!yyyy_mm_dd) return ""
  const [y, m, d] = yyyy_mm_dd.split("-").map(Number)
  if (!y || !m || !d) return ""
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + days)
  const yy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, "0")
  const dd = String(dt.getDate()).padStart(2, "0")
  return `${yy}-${mm}-${dd}`
}

const modernButtonSx = {
  textTransform: "none",
  fontWeight: 600,
  borderRadius: 2,
  px: 2.5,
  py: 1,
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "translateY(-1px)",
  },
}

export const ListEsimDevicesDataTable = ({
  modelList,
  currentUser,
  loading,
  onShowModel,
  onEdit,
  onDelete,
}: Props) => {
  if (!currentUser) return null
  if (currentUser.type === "SELLER") return null

  const visibleModels = useMemo(() => {
    return (modelList ?? []).map((m: any) => ({
      ...m,
      brandLabel: String(m?.brand?.name ?? m?.brandName ?? "-"),
    }))
  }, [modelList])

  const [filters, setFilters] = useState<IDeviceFilters>(initFilters)
  const [isDownloading, setIsDownloading] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  const stopRowClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const brandOptions = useMemo(() => {
    const set = new Set<string>()
    visibleModels.forEach((m: any) => {
      const name = String(m?.brandLabel ?? "").trim()
      if (name && name !== "-") set.add(name)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [visibleModels])

  const maxEsimsOptions = useMemo(() => {
    const toInt = (v: any) => {
      const n = Number(v)
      return Number.isFinite(n) ? Math.trunc(n) : null
    }

    const vals: number[] = []
    ;(visibleModels ?? []).forEach((m: any) => {
      const n = toInt(m?.maxEsims)
      if (n !== null) vals.push(n)
    })

    const uniqueSorted = Array.from(new Set(vals))
      .sort((a, b) => a - b)
      .map(String)

    return uniqueSorted.length ? uniqueSorted : ["1"]
  }, [visibleModels])

  const {
    ListItemTable,
    ItemDataTable,
    onSearch,
    onSetFilter,
    onApplyFilter,
    isSelectedItem,
    pagination,
    DataTableHead,
    selected,
    rows,
    dataByFilter,
  } = useDataTable<any>(headCells, visibleModels, "name", {
    showCheckbocHead: true,
    onShow(values) {
      onShowModel(values[0])
    },
  })

  const rowsForExport = useMemo(() => {
    const base = visibleModels.map((item: any, idx: number) => ({ ...item, id_data_table: idx + 1 }))
    let result = base

    if (dataByFilter?.length) result = onFilterDataTable(result, dataByFilter as any)

    const q = (searchText || "").trim()
    if (q) {
      let fields: any[] = []
      headCells.forEach(({ id }) => fields.push(id))
      fields = [...fields, "brand", "brandName", "brandLabel", "createdBy", "createdById", "metadata"]
      result = onSearchDataTable(q, fields as any, result as any, "id_data_table")
    }

    return result as any[]
  }, [visibleModels, dataByFilter, searchText])

  const handleSearch = (value: unknown) => {
    const v = typeof value === "string" ? value : String((value as any)?.target?.value ?? "")
    setSearchText(v)
    onSearch(v)
  }

  const activeFilterChips = useMemo(() => {
    const chips: { key: keyof IDeviceFilters; label: string }[] = []

    if (filters.brand !== initFilters.brand)
      chips.push({ key: "brand", label: `Marca: ${filters.brand}` })
    if (filters.isActive !== initFilters.isActive)
      chips.push({ key: "isActive", label: `Estado: ${filters.isActive === "true" ? "Activo" : "Inactivo"}` })
    if (filters.maxEsims !== initFilters.maxEsims)
      chips.push({ key: "maxEsims", label: `Máx eSIMs: ${filters.maxEsims}` })
    if (filters.createdAt !== initFilters.createdAt)
      chips.push({ key: "createdAt", label: `Fecha: ${filters.createdAt}` })

    return chips
  }, [filters])

  const handleReset = () => {
    setFilters(initFilters)
    setSearchText("")
    onSearch("")

    onSetFilter("brandLabel" as any, "=", "")
    onSetFilter("isActive" as any, "=", "")
    onSetFilter("maxEsims" as any, "=", "")
    onSetFilter("createdAt" as any, "date-from", "")
    onSetFilter("createdAt" as any, "date-to", "")

    onApplyFilter([], true)
  }

  const handleFilterChange = (key: keyof IDeviceFilters, value: string) => {
    if (key === "brand") {
      const filterVal = value === "all" ? "" : value
      const newFilter = [
        ...dataByFilter.filter(f => !(f.field === "brandLabel" && f.action === "=")),
        ...(filterVal ? [{ field: "brandLabel", action: "=", value: filterVal }] : [])
      ]
      onSetFilter("brandLabel" as any, "=", filterVal)
      onApplyFilter(newFilter as any)
      setFilters(prev => ({ ...prev, brand: value }))
      return
    }

    if (key === "isActive") {
      const filterVal = value === "all" ? "" : (value === "true" ? true : false)
      const newFilter = [
        ...dataByFilter.filter(f => !(f.field === "isActive" && f.action === "=")),
        ...(value !== "all" ? [{ field: "isActive", action: "=", value: filterVal }] : [])
      ]
      onSetFilter("isActive" as any, "=", value === "all" ? "" : filterVal)
      onApplyFilter(newFilter as any)
      setFilters(prev => ({ ...prev, isActive: value as any }))
      return
    }

    if (key === "maxEsims") {
      const numVal = value === "" ? "" : Number(value)
      const newFilter = [
        ...dataByFilter.filter(f => !(f.field === "maxEsims" && f.action === "=")),
        ...(value !== "" ? [{ field: "maxEsims", action: "=", value: numVal }] : [])
      ]
      onSetFilter("maxEsims" as any, "=", numVal)
      onApplyFilter(newFilter as any)
      setFilters(prev => ({ ...prev, maxEsims: value }))
      return
    }

    if (key === "createdAt") {
      const toNextDay = value ? addDaysYYYYMMDD(value, 1) : ""
      const newFilter = [
        ...dataByFilter.filter(f => f.field !== "createdAt"),
        ...(value ? [
          { field: "createdAt", action: "date-from", value },
          { field: "createdAt", action: "date-to", value: toNextDay }
        ] : [])
      ]
      onSetFilter("createdAt" as any, "date-from", value || "")
      onSetFilter("createdAt" as any, "date-to", toNextDay || "")
      onApplyFilter(newFilter as any)
      setFilters(prev => ({ ...prev, createdAt: value }))
      return
    }
  }

  const removeFilter = (key: keyof IDeviceFilters) => {
    handleFilterChange(key, initFilters[key])
  }

  const handleDownloadPdf = async () => {
    try {
      if (!rowsForExport.length) return
      setIsDownloading(true)

      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" })
      const pageWidth = doc.internal.pageSize.getWidth()

      const marginX = 52
      const TOP_TABLE_Y = 110

      const logoUrl = typeof logo2x === "string" ? logo2x : (logo2x as any).src

      let logoDataUrl: string | null = null
      try {
        const blob = await fetch(logoUrl).then((r) => r.blob())
        logoDataUrl = await blobToDataURL(blob)
      } catch {
        logoDataUrl = null
      }

      const drawHeader = drawHeaderFactory(doc, logoDataUrl, rowsForExport.length)
      drawHeader()

      const head = [["Modelo", "Marca", "Máx eSIMs", "Estado", "Creado por", "Creado"]]

      const body = rowsForExport.map((row: any) => [
        String(row.name ?? "-"),
        String(row.brandLabel ?? "-"),
        String(row.maxEsims ?? "-"),
        String(row.isActive ? "Activo" : "Inactivo"),
        String(getCreatedByLabel(row)),
        formatterDateDDMMYYYY(row.createdAt),
      ])

      const tableWidth = pageWidth - marginX * 2

      const W_MAX = 90
      const W_ESTADO = 100
      const W_CREADO = 120
      const W_MARCA = 120
      const W_CREADO_POR = 140

      const remaining = tableWidth - (W_MARCA + W_MAX + W_ESTADO + W_CREADO_POR + W_CREADO)
      const W_MODELO = Math.max(140, remaining)

      autoTable(doc, {
        head,
        body,
        startY: TOP_TABLE_Y,
        margin: { left: marginX, right: marginX, top: TOP_TABLE_Y },
        tableWidth,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 5, overflow: "linebreak", valign: "middle" },
        headStyles: { fontStyle: "bold", fillColor: [28, 54, 128], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 252] },
        columnStyles: {
          0: { cellWidth: W_MODELO },
          1: { cellWidth: W_MARCA },
          2: { cellWidth: W_MAX, halign: "right" },
          3: { cellWidth: W_ESTADO },
          4: { cellWidth: W_CREADO_POR },
          5: { cellWidth: W_CREADO, halign: "right" },
        },
        pageBreak: "auto",
        rowPageBreak: "avoid",
        didDrawPage: () => drawHeader(),
      })

      doc.save(`dispositivos-compatibles-${new Date().toISOString().slice(0, 10)}.pdf`)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Fade in timeout={400}>
      <Box>
        <PaperDataTable>
          {/* Header con titulo y boton PDF */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              px: 3,
              py: 2.5,
              borderBottom: "1px solid",
              borderColor: "divider",
              background: (theme) =>
                `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(
                  theme.palette.background.paper,
                  1
                )} 100%)`,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                }}
              >
                <Devices sx={{ color: "white", fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
                  Dispositivos eSIM
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {visibleModels.length} dispositivos registrados
                </Typography>
              </Box>
            </Box>

            <Button
              onClick={handleDownloadPdf}
              variant="contained"
              startIcon={<PictureAsPdfIcon />}
              disabled={isDownloading || !rowsForExport.length}
              sx={{
                ...modernButtonSx,
                backgroundColor: "#dc2626",
                boxShadow: "0 4px 14px rgba(220, 38, 38, 0.4)",
                "&:hover": {
                  backgroundColor: "#b91c1c",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(220, 38, 38, 0.5)",
                },
              }}
            >
              {isDownloading ? "Generando..." : "Descargar PDF"}
            </Button>
          </Box>

          <Box sx={{ px: 3, py: 1.25, display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", borderBottom: "1px solid", borderColor: "divider", minHeight: 52, bgcolor: activeFilterChips.length > 0 ? (theme) => alpha(theme.palette.primary.main, 0.02) : "background.paper" }}>
            <Button size="small" variant={activeFilterChips.length > 0 ? "contained" : "outlined"} startIcon={<TuneOutlinedIcon sx={{ fontSize: "16px !important" }} />} onClick={() => setFilterDrawerOpen(true)} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600, fontSize: "0.8rem", px: 1.5, py: 0.6, boxShadow: "none", "&:hover": { boxShadow: "none" }, flexShrink: 0 }}>
              Filtros{activeFilterChips.length > 0 ? ` (${activeFilterChips.length})` : ""}
            </Button>
            {activeFilterChips.map((chip) => (
              <Chip key={chip.key} label={chip.label} size="small" onDelete={() => removeFilter(chip.key)} sx={{ borderRadius: "8px", fontWeight: 600, fontSize: "0.75rem", height: 26, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08), color: "primary.main", border: "1px solid", borderColor: (theme) => alpha(theme.palette.primary.main, 0.2), "& .MuiChip-deleteIcon": { fontSize: 14, color: "primary.main", opacity: 0.7, "&:hover": { opacity: 1 } } }} />
            ))}
            {activeFilterChips.length > 0 && (
              <Button size="small" startIcon={<FilterListOffOutlinedIcon sx={{ fontSize: "16px !important" }} />} onClick={handleReset} sx={{ textTransform: "none", fontSize: "0.78rem", fontWeight: 600, color: "text.secondary", borderRadius: 2, px: 1, "&:hover": { color: "error.main", bgcolor: (theme) => alpha(theme.palette.error.main, 0.06) } }}>
                Limpiar todo
              </Button>
            )}
          </Box>

          <Drawer anchor="right" open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)}
            PaperProps={{ sx: { width: { xs: "100vw", sm: 440 }, borderRadius: { xs: "20px 20px 0 0", sm: "20px 0 0 20px" }, display: "flex", flexDirection: "column", overflow: "hidden", height: "auto", maxHeight: "82vh", my: "auto", top: 0, bottom: 0, margin: "auto 0" } }}>
            <Box sx={{ px: 3, py: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between", background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`, flexShrink: 0 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <TuneOutlinedIcon sx={{ color: "white", fontSize: 22 }} />
                <Box>
                  <Typography variant="h6" sx={{ color: "white", fontWeight: 700, lineHeight: 1.2 }}>Filtros</Typography>
                  {activeFilterChips.length > 0 && <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)" }}>{activeFilterChips.length} filtro{activeFilterChips.length > 1 ? "s" : ""} activo{activeFilterChips.length > 1 ? "s" : ""}</Typography>}
                </Box>
              </Stack>
              <IconButton onClick={() => setFilterDrawerOpen(false)} sx={{ color: "white", bgcolor: "rgba(255,255,255,0.12)", borderRadius: 2, "&:hover": { bgcolor: "rgba(255,255,255,0.22)" } }} size="small">
                <CloseOutlinedIcon fontSize="small" />
              </IconButton>
            </Box>
            {activeFilterChips.length > 0 && (
              <Box sx={{ px: 3, py: 1.5, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04), borderBottom: "1px solid", borderColor: "divider", display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {activeFilterChips.map((chip) => (
                  <Chip key={chip.key} label={chip.label} size="small" onDelete={() => removeFilter(chip.key)} sx={{ borderRadius: "8px", fontWeight: 600, fontSize: "0.72rem", height: 24, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1), color: "primary.main" }} />
                ))}
              </Box>
            )}
            <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2.5 }}>
              <FilterEsimDevicesDataTable
                filters={filters}
                brands={brandOptions}
                maxEsimsOptions={maxEsimsOptions}
                onChange={handleFilterChange}
              />
            </Box>
            <Divider />
            <Box sx={{ px: 3, py: 2, display: "flex", gap: 1.5, flexShrink: 0 }}>
              <Button fullWidth variant="outlined" onClick={handleReset} disabled={activeFilterChips.length === 0} startIcon={<FilterListOffOutlinedIcon />} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}>Limpiar filtros</Button>
              <Button fullWidth variant="contained" onClick={() => setFilterDrawerOpen(false)} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, boxShadow: "none" }}>Listo</Button>
            </Box>
          </Drawer>

          <DataTableToolbar
            numSelected={selected.length}
            onChangeSearch={handleSearch}
            searchPlaceholder="Buscar por modelo, marca..."
          />

          <Box
            sx={{
              px: 3,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 1,
              backgroundColor: (theme) => alpha(theme.palette.info.main, 0.04),
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <TipsAndUpdates sx={{ fontSize: 18, color: "info.main" }} />
            <Typography variant="caption" color="text.secondary">
              Tip: puedes ordenar los datos haciendo click en las flechas de cada columna.
            </Typography>
          </Box>

          <DataTable
            DataTableHead={DataTableHead}
            pagination={pagination}
            loading={{ load: loading || false, cell: headCells.length + 1 }}
            tableProps={{
              sx: {
                "& th": {
                  fontWeight: 600,
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: "0.05em",
                  color: "text.secondary",
                  backgroundColor: (theme: any) => alpha(theme.palette.background.default, 0.6),
                },
                "& tbody tr": {
                  transition: "all 0.15s ease",
                  "&:hover": {
                    backgroundColor: (theme: any) => alpha(theme.palette.primary.main, 0.04),
                  },
                },
              },
            }}
          >
            {rows.map((row: any, idx: number) => {
              const labelId = `enhanced-table-checkbox-${idx}`

              return (
                <ListItemTable
                  key={row.id_data_table}
                  id_data_table={row.id_data_table}
                  isHandleClick={false}
                  props={{
                    onClick: () => onEdit(row.id),
                    sx: { cursor: "pointer", "&:hover": { backgroundColor: "action.hover" } },
                  }}
                >
                  <ItemDataTable
                    padding="checkbox"
                    align="center"
                    sx={{
                      width: 80,
                      minWidth: 80,
                      maxWidth: 80,
                      px: 0,
                      textAlign: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 0.25,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.15 }}>
                        <Tooltip title="Editar modelo" placement="top" arrow>
                          <IconButton
                            size="small"
                            sx={{
                              p: 0.5,
                              borderRadius: 1.5,
                              transition: "all 0.2s ease",
                              "&:hover": {
                                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                color: "primary.main",
                              },
                            }}
                            onClick={(e) => {
                              stopRowClick(e)
                              onEdit(row.id)
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Eliminar modelo" placement="top" arrow>
                          <IconButton
                            size="small"
                            sx={{
                              p: 0.5,
                              borderRadius: 1.5,
                              transition: "all 0.2s ease",
                              "&:hover": {
                                backgroundColor: (theme) => alpha(theme.palette.error.main, 0.1),
                                color: "error.main",
                              },
                            }}
                            onClick={(e) => {
                              stopRowClick(e)
                              onDelete(row.id)
                            }}
                          >
                            <DeleteOutline fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </ItemDataTable>

                  <ItemDataTable component="th" id={labelId} scope="row">
                    {row.name}
                  </ItemDataTable>

                  <ItemDataTable align="left">{row.brandLabel ?? "-"}</ItemDataTable>

                  <ItemDataTable align="center">{row.maxEsims}</ItemDataTable>

                  <ItemDataTable align="left">
                    <Chip size="small" label={row.isActive ? "Activo" : "Inactivo"} variant="outlined" />
                  </ItemDataTable>

                  <ItemDataTable align="left">{getCreatedByLabel(row)}</ItemDataTable>

                  <ItemDataTable align="right">{formatterDateDDMMYYYY(row.createdAt)}</ItemDataTable>
                </ListItemTable>
              )
            })}
          </DataTable>

          {rows.length === 0 && (
            <Box p={4} textAlign="center">
              <Typography fontWeight={600}>No hay datos registrados</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                No hay dispositivos para mostrar.
              </Typography>
            </Box>
          )}
        </PaperDataTable>
      </Box>
    </Fade>
  )
}

const headCells: DataTableHeadCellProps<any>[] = [
  { id: "name", numeric: false, disablePadding: false, label: "Modelo" },
  { id: "brandLabel" as any, numeric: false, disablePadding: false, label: "Marca" },
  { id: "maxEsims", numeric: true, disablePadding: false, label: "Máx eSIMs" },
  { id: "isActive", numeric: false, disablePadding: false, label: "Estado" },
  { id: "createdBy", numeric: false, disablePadding: false, label: "Creado por" },
  { id: "createdAt", numeric: true, disablePadding: false, label: "Creado" },
]