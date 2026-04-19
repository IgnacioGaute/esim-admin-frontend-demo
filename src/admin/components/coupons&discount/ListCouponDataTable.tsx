import React, { useMemo, useState } from "react"
import { Box, Button, Typography, IconButton, Tooltip, Fade, alpha, Chip, Drawer, Stack, Divider } from "@mui/material"
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"
import { LocalOffer, TipsAndUpdates } from "@mui/icons-material"
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined"
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined"
import FilterListOffOutlinedIcon from "@mui/icons-material/FilterListOffOutlined"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import { useDataTable } from "@/shared/hooks/useDataTable"
import { DataTable, DataTableToolbar, PaperDataTable } from "@/shared/components/data-table"
import { DataTableHeadCellProps } from "@/shared/interfaces/hooks/use-data-table.interface"
import { ICouponData } from "@/admin/utils/interfaces/coupon-data.interface"
import { formatterDateDDMMYYYY } from "@/shared/helpers/handligDateHelper"
import { FilterCouponDataTable, IDataCouponByFilter } from "./FilterCouponDataTable"

import logo2x from "@/assets/images/logo/esim-logo.svg"

import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"

import { onFilterDataTable, onSearchDataTable } from "@/shared/helpers/hooks/useDataTableHelper"

interface Props {
  couponList: IDataListCoupon[]
  onShowCoupon: (coupon: ICouponData) => void
  onEdit: (couponId: string) => void
  onDelete: (couponId: string) => void
  loading?: boolean
}

export interface IDataListCoupon extends ICouponData {
  cantRest: number
}

const initFilterCoupon: IDataCouponByFilter = {
  code: "",
  enabled: "all",
  discount_percent: "",
  count: "",
  used_count: "",
  cantRest: "",
  created_at: "",
  updated_at: "",
}

const blobToDataURL = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })

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

export const ListCouponDataTable = ({ couponList, onShowCoupon, onEdit, onDelete, loading }: Props) => {
  const [filterCoupon, setFilterCoupon] = useState<IDataCouponByFilter>(initFilterCoupon)
  const [isDownloading, setIsDownloading] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  const {
    ListItemTable,
    ItemDataTable,
    onSearch,
    onSetFilter,
    onApplyFilter,
    onSelectItem,
    isSelectedItem,
    pagination,
    DataTableHead,
    selected,
    rows,
    dataByFilter,
  } = useDataTable<IDataListCoupon>(headCells, couponList, "code", {
    showCheckbocHead: true,
    onShow(values) {
      onShowCoupon(values[0])
    },
  })

  const stopRowClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const rowsForExport = useMemo(() => {
    const base = (couponList as any[]).map((item: any, idx) => ({ ...item, id_data_table: idx + 1 }))
    let result = base

    if (dataByFilter?.length) result = onFilterDataTable(result, dataByFilter as any)

    const q = (searchText || "").trim()
    if (q) {
      let fields: any[] = []
      headCells.forEach(({ id }) => fields.push(id))
      fields = [...fields, "cantRest"]
      result = onSearchDataTable(q, fields as any, result as any, "id_data_table")
    }

    return result as any as IDataListCoupon[]
  }, [couponList, dataByFilter, searchText])

  const handleDownloadPdf = async () => {
    try {
      if (!rowsForExport.length) return
      setIsDownloading(true)

      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" })
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()

      const marginX = 52
      const safeRight = pageWidth - marginX
      const generatedAt = new Date().toLocaleString()

      const logoUrl = typeof logo2x === "string" ? logo2x : (logo2x as any).src

      let logoDataUrl: string | null = null
      try {
        const blob = await fetch(logoUrl).then((r) => r.blob())
        logoDataUrl = await blobToDataURL(blob)
      } catch {
        logoDataUrl = null
      }

      const hr = (y: number) => {
        doc.setDrawColor(210)
        doc.setLineWidth(0.8)
        doc.line(marginX, y, safeRight, y)
      }

      const drawHeader = () => {
        const topY = 30

        if (logoDataUrl) doc.addImage(logoDataUrl, "PNG", marginX, topY, 110, 34)

        const textX = logoDataUrl ? marginX + 125 : marginX

        doc.setTextColor(0)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(13)
        doc.text("Listado de Cupones", textX, topY + 16)

        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
        doc.text(`Generado: ${generatedAt}`, textX, topY + 34)
        doc.text(`Registros: ${rowsForExport.length}`, textX, topY + 48)

        hr(topY + 64)
      }

      drawHeader()

      let y = 110

      autoTable(doc, {
        startY: y,
        margin: { left: marginX, right: marginX },
        theme: "grid",
        head: [
          [
            "Código",
            "% descuento",
            "Cantidad",
            "Cantidad usada",
            "Cantidad restante",
            "Habilitado",
            "Fecha creado",
            "Fecha actualizado",
          ],
        ],
        body: rowsForExport.map((r) => [
          String(r.code ?? ""),
          `${r.discount_percent ?? ""} %`,
          String(r.count ?? ""),
          String(r.used_count ?? ""),
          String(r.cantRest ?? ""),
          r.enabled ? "SI" : "NO",
          formatterDateDDMMYYYY(r.created_at),
          formatterDateDDMMYYYY(r.updated_at),
        ]),
        styles: { fontSize: 9, cellPadding: 5, overflow: "linebreak", valign: "middle" },
        headStyles: { fontStyle: "bold", fillColor: [28, 54, 128], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 252] },
        didDrawPage: () => drawHeader(),
      })

      doc.save(`cupones-${new Date().toISOString().slice(0, 10)}.pdf`)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSearchToolbar = (value: unknown) => {
    const v = typeof value === "string" ? value : String((value as any)?.target?.value ?? "")
    setSearchText(v)
    onSearch(v)
  }

  const codeOptions = useMemo(() => {
    return Array.from(
      new Set((couponList ?? []).map((c) => String(c.code ?? "").trim()).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b))
  }, [couponList])

  const numericOptions = useMemo(() => {
    const toInt = (v: any) => {
      const n = Number(v)
      return Number.isFinite(n) ? Math.trunc(n) : null
    }

    const uniqSorted = (arr: number[]) =>
      Array.from(new Set(arr))
        .sort((a, b) => a - b)
        .map(String)

    const counts: number[] = []
    const useds: number[] = []
    const rests: number[] = []

    ;(couponList ?? []).forEach((c: any) => {
      const a = toInt(c.count)
      if (a !== null) counts.push(a)

      const b = toInt(c.used_count)
      if (b !== null) useds.push(b)

      const r = toInt(c.cantRest)
      if (r !== null) rests.push(r)
    })

    return {
      countOptions: uniqSorted(counts),
      usedCountOptions: uniqSorted(useds),
      cantRestOptions: uniqSorted(rests),
    }
  }, [couponList])

  const activeFilterChips = useMemo(() => {
    const chips: { key: keyof IDataCouponByFilter; label: string }[] = []

    if (filterCoupon.code !== initFilterCoupon.code)
      chips.push({ key: "code", label: `Código: ${filterCoupon.code}` })
    if (filterCoupon.enabled !== initFilterCoupon.enabled)
      chips.push({ key: "enabled", label: `Habilitado: ${filterCoupon.enabled === "true" ? "SI" : "NO"}` })
    if (filterCoupon.discount_percent !== initFilterCoupon.discount_percent)
      chips.push({ key: "discount_percent", label: `Descuento: ${filterCoupon.discount_percent}%` })
    if (filterCoupon.count !== initFilterCoupon.count)
      chips.push({ key: "count", label: `Cantidad: ${filterCoupon.count}` })
    if (filterCoupon.used_count !== initFilterCoupon.used_count)
      chips.push({ key: "used_count", label: `Usada: ${filterCoupon.used_count}` })
    if (filterCoupon.cantRest !== initFilterCoupon.cantRest)
      chips.push({ key: "cantRest", label: `Restante: ${filterCoupon.cantRest}` })
    if (filterCoupon.created_at !== initFilterCoupon.created_at)
      chips.push({ key: "created_at", label: `Fecha creado: ${filterCoupon.created_at}` })
    if (filterCoupon.updated_at !== initFilterCoupon.updated_at)
      chips.push({ key: "updated_at", label: `Fecha actualizado: ${filterCoupon.updated_at}` })

    return chips
  }, [filterCoupon])

  const handleReset = () => {
    setFilterCoupon(initFilterCoupon)
    setSearchText("")
    onSearch("")

    onSetFilter("code" as any, "=", "")
    onSetFilter("enabled" as any, "=", "")
    onSetFilter("discount_percent" as any, "=", "")
    onSetFilter("count" as any, "=", "")
    onSetFilter("used_count" as any, "=", "")
    onSetFilter("cantRest" as any, "=", "")
    onSetFilter("created_at" as any, "date-from", "")
    onSetFilter("created_at" as any, "date-to", "")
    onSetFilter("updated_at" as any, "date-from", "")
    onSetFilter("updated_at" as any, "date-to", "")

    onApplyFilter([], true)
  }

  const handleFilterChange = (field: keyof IDataCouponByFilter, value: any) => {
    if (field === "code") {
      const v = value || ""
      const newFilter = [
        ...dataByFilter.filter(f => !(f.field === "code" && f.action === "=")),
        ...(v ? [{ field: "code", action: "=", value: v }] : [])
      ]
      onSetFilter("code" as any, "=", v)
      onApplyFilter(newFilter as any)
      setFilterCoupon(prev => ({ ...prev, code: v }))
      return
    }

    if (field === "enabled") {
      const filterVal = value === "all" ? "" : (value === "true" ? true : false)
      const newFilter = [
        ...dataByFilter.filter(f => !(f.field === "enabled" && f.action === "=")),
        ...(value !== "all" ? [{ field: "enabled", action: "=", value: filterVal }] : [])
      ]
      onSetFilter("enabled" as any, "=", value === "all" ? "" : filterVal)
      onApplyFilter(newFilter as any)
      setFilterCoupon(prev => ({ ...prev, enabled: value }))
      return
    }

    if (field === "discount_percent") {
      const numVal = value === "" ? "" : Number(value)
      const newFilter = [
        ...dataByFilter.filter(f => !(f.field === "discount_percent" && f.action === "=")),
        ...(value !== "" ? [{ field: "discount_percent", action: "=", value: numVal }] : [])
      ]
      onSetFilter("discount_percent" as any, "=", numVal)
      onApplyFilter(newFilter as any)
      setFilterCoupon(prev => ({ ...prev, discount_percent: value }))
      return
    }

    if (field === "count" || field === "used_count" || field === "cantRest") {
      const numVal = value === "" ? "" : Number(value)
      const newFilter = [
        ...dataByFilter.filter(f => !(f.field === field && f.action === "=")),
        ...(value !== "" ? [{ field, action: "=", value: numVal }] : [])
      ]
      onSetFilter(field as any, "=", numVal)
      onApplyFilter(newFilter as any)
      setFilterCoupon(prev => ({ ...prev, [field]: value }))
      return
    }

    if (field === "created_at") {
      const toNextDay = value ? addDaysYYYYMMDD(value, 1) : ""
      const newFilter = [
        ...dataByFilter.filter(f => f.field !== "created_at"),
        ...(value ? [
          { field: "created_at", action: "date-from", value },
          { field: "created_at", action: "date-to", value: toNextDay }
        ] : [])
      ]
      onSetFilter("created_at" as any, "date-from", value || "")
      onSetFilter("created_at" as any, "date-to", toNextDay || "")
      onApplyFilter(newFilter as any)
      setFilterCoupon(prev => ({ ...prev, created_at: value }))
      return
    }

    if (field === "updated_at") {
      const toNextDay = value ? addDaysYYYYMMDD(value, 1) : ""
      const newFilter = [
        ...dataByFilter.filter(f => f.field !== "updated_at"),
        ...(value ? [
          { field: "updated_at", action: "date-from", value },
          { field: "updated_at", action: "date-to", value: toNextDay }
        ] : [])
      ]
      onSetFilter("updated_at" as any, "date-from", value || "")
      onSetFilter("updated_at" as any, "date-to", toNextDay || "")
      onApplyFilter(newFilter as any)
      setFilterCoupon(prev => ({ ...prev, updated_at: value }))
      return
    }
  }

  const removeFilter = (key: keyof IDataCouponByFilter) => {
    handleFilterChange(key, initFilterCoupon[key])
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
                <LocalOffer sx={{ color: "white", fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
                  Listado de Cupones
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {couponList.length} cupones registrados
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
              <FilterCouponDataTable
                couponFilter={filterCoupon}
                codeOptions={codeOptions}
                countOptions={numericOptions.countOptions}
                usedCountOptions={numericOptions.usedCountOptions}
                cantRestOptions={numericOptions.cantRestOptions}
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
            onChangeSearch={handleSearchToolbar}
            searchPlaceholder="Buscar por codigo..."
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
                tableLayout: "fixed",
                width: "100%",
                "& th": {
                  fontWeight: 600,
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: "0.05em",
                  color: "text.secondary",
                  backgroundColor: (theme: any) => alpha(theme.palette.background.default, 0.6),
                },
                "& th, & td": {
                  textAlign: "left !important",
                  verticalAlign: "middle",
                },
                "& th.MuiTableCell-paddingCheckbox, & td.MuiTableCell-paddingCheckbox": {
                  width: 80,
                  minWidth: 80,
                  maxWidth: 80,
                  paddingRight: "8px",
                },
                "& td.MuiTableCell-paddingCheckbox": { paddingLeft: "12px" },
                "& th:nth-of-type(2), & td:nth-of-type(2)": { width: 140 },
                "& th:nth-of-type(3), & td:nth-of-type(3)": { width: 120 },
                "& th:nth-of-type(4), & td:nth-of-type(4)": { width: 110 },
                "& th:nth-of-type(5), & td:nth-of-type(5)": { width: 140 },
                "& th:nth-of-type(6), & td:nth-of-type(6)": { width: 160 },
                "& th:nth-of-type(7), & td:nth-of-type(7)": { width: 120 },
                "& th:nth-of-type(8), & td:nth-of-type(8)": { width: 140 },
                "& th:nth-of-type(9), & td:nth-of-type(9)": { width: 160 },
                "& tbody tr": {
                  transition: "all 0.15s ease",
                  "&:hover": {
                    backgroundColor: (theme: any) => alpha(theme.palette.primary.main, 0.04),
                  },
                },
              },
            }}
          >
            {rows.map((row, idx) => {
              const labelId = `enhanced-table-checkbox-${idx}`

              return (
                <ListItemTable
                  key={row.id_data_table}
                  id_data_table={row.id_data_table}
                  isHandleClick={false}
                  props={{
                    onClick: () => onEdit(row.id),
                    sx: {
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "action.hover" },
                    },
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
                        gap: 0.15,
                      }}
                    >
                      <Tooltip title="Editar" arrow>
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
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Eliminar" arrow>
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
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ItemDataTable>
                  <ItemDataTable component="th" id={labelId} scope="row">
                    {row.code}
                  </ItemDataTable>

                  <ItemDataTable align="left">{row.discount_percent} %</ItemDataTable>
                  <ItemDataTable align="left">{row.count}</ItemDataTable>
                  <ItemDataTable align="left">{row.used_count}</ItemDataTable>
                  <ItemDataTable align="left">{row.cantRest}</ItemDataTable>
                  <ItemDataTable align="left">{row.enabled ? "SI" : "NO"}</ItemDataTable>
                  <ItemDataTable align="left">{formatterDateDDMMYYYY(row.created_at)}</ItemDataTable>
                  <ItemDataTable align="left">{formatterDateDDMMYYYY(row.updated_at)}</ItemDataTable>
                </ListItemTable>
              )
            })}
          </DataTable>

          {rows.length === 0 && (
            <Box p={4} textAlign="center">
              <Typography fontWeight={600}>No hay datos registrados</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                No hay cupones para mostrar.
              </Typography>
            </Box>
          )}
        </PaperDataTable>
      </Box>
    </Fade>
  )
}

const headCells: DataTableHeadCellProps<IDataListCoupon>[] = [
  { id: "code", numeric: false, disablePadding: false, label: "Código" },
  { id: "discount_percent", numeric: false, disablePadding: false, label: "% descuento" },
  { id: "count", numeric: false, disablePadding: false, label: "Cantidad" },
  { id: "used_count", numeric: false, disablePadding: false, label: "Cantidad usada" },
  { id: "cantRest", numeric: false, disablePadding: false, label: "Cantidad restante" },
  { id: "enabled", numeric: false, disablePadding: false, label: "Habilitado" },
  { id: "created_at", numeric: false, disablePadding: false, label: "Fecha creado" },
  { id: "updated_at", numeric: false, disablePadding: false, label: "Fecha actualizado" },
]