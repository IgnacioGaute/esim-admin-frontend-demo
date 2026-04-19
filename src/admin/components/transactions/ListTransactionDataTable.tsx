import React, { useMemo, useState } from "react"
import { Box, Button, Chip, Stack, Typography, Fade, alpha, Drawer, IconButton, Divider } from "@mui/material"
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined"
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined"
import FilterListOffOutlinedIcon from "@mui/icons-material/FilterListOffOutlined"
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"
import { Receipt, TipsAndUpdates } from "@mui/icons-material"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import logo2x from "@/assets/images/logo/esim-logo.svg"

import { useDataTable } from "@/shared/hooks/useDataTable"
import { DataTableHeadCellProps } from "@/shared/interfaces/hooks/use-data-table.interface"
import { formatterDateDDMMYYYY } from "@/shared/helpers/handligDateHelper"
import { DataTable, DataTableToolbar, PaperDataTable } from "@/shared/components/data-table"

import { ITransactionData, TRANSACTION_STATUS_RESP, TRANSACTION_TYPE_RESP } from "@/admin/utils"
import { FilterTranstDataTable, IDataTransactionByFilter } from "./FilterTranstDataTable"
import { onFilterDataTable } from "@/shared/helpers/hooks/useDataTableHelper"

interface Props {
  transactionsList: ITransactionData[]
  onShowTransaction: (order: ITransactionData) => void
  loading?: boolean
  isSuperAdmin?: boolean
}

const initTransactionFilter: IDataTransactionByFilter = {
  type: "all",
  status: "all",
  createdAt: "",
  amountMin: "",
  owner: "",
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
    doc.text("Listado de Transacciones", textX, topY + 16)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Generado: ${new Date().toLocaleString()}`, textX, topY + 34)
    doc.text(`Registros: ${totalRows}`, textX, topY + 48)

    hr(topY + 64)
  }
}

type TxTypeKey = keyof typeof TRANSACTION_TYPE_RESP
type TxStatusKey = keyof typeof TRANSACTION_STATUS_RESP

const getTxTypeLabel = (type: unknown) => {
  const key = String(type ?? "") as TxTypeKey
  return TRANSACTION_TYPE_RESP[key] ?? String(type ?? "No disponible")
}

const getTxStatusLabel = (status: unknown) => {
  const key = String(status ?? "") as TxStatusKey
  return TRANSACTION_STATUS_RESP[key] ?? String(status ?? "No disponible")
}

const getOwnerLabel = (row: any) => {
  return (
    row?.walletOwner?.name ??
    row?.walletOwner?.companyId ??
    row?.walletOwner?.resellerId ??
    "No disponible"
  )
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

const getAmountTone = (type: string) => {
  const key = String(type ?? "").toUpperCase()

  if (
    key.includes("SUBTRACT") ||
    key.includes("REMOVE") ||
    key.includes("DISCOUNT") ||
    key.includes("DEBIT") ||
    key.includes("PAYMENT")
  ) {
    return "error.main"
  }

  return "success.main"
}

const getStatusChipProps = (status: unknown) => {
  const key = String(status ?? "").toUpperCase()

  if (key === "COMPLETED" || key === "CAPTURED" || key === "AUTHORIZED") {
    return {
      label: getTxStatusLabel(status),
      color: "success" as const,
      variant: "filled" as const,
    }
  }

  if (key === "PENDING") {
    return {
      label: getTxStatusLabel(status),
      color: "warning" as const,
      variant: "filled" as const,
    }
  }

  if (key === "REJECTED" || key === "FAILED" || key === "CANCELLED") {
    return {
      label: getTxStatusLabel(status),
      color: "error" as const,
      variant: "filled" as const,
    }
  }

  return {
    label: getTxStatusLabel(status),
    color: "default" as const,
    variant: "outlined" as const,
  }
}

const getTypeChipProps = (type: unknown) => {
  const key = String(type ?? "").toUpperCase()

  if (key.includes("ADD") || key.includes("TOPUP")) {
    return {
      label: getTxTypeLabel(type),
      sx: {
        bgcolor: "rgba(46,125,50,0.10)",
        color: "success.dark",
        fontWeight: 400,
      },
    }
  }

  if (key.includes("SUBTRACT") || key.includes("REMOVE") || key.includes("PAYMENT")) {
    return {
      label: getTxTypeLabel(type),
      sx: {
        bgcolor: "rgba(211,47,47,0.10)",
        color: "error.dark",
        fontWeight: 400,
      },
    }
  }

  return {
    label: getTxTypeLabel(type),
    sx: {
      bgcolor: "rgba(25,118,210,0.10)",
      color: "primary.dark",
      fontWeight: 400,
    },
  }
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

export const ListTransactionDataTable = ({ transactionsList, onShowTransaction, loading, isSuperAdmin }: Props) => {
  const [filterTransaction, setFilterTransaction] = useState<IDataTransactionByFilter>(initTransactionFilter)
  const [isDownloading, setIsDownloading] = useState(false)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
const superAdminColumnIds = new Set(["getOwnerLabel"])
    const activeHeadCells = isSuperAdmin
    ? headCells
    : headCells.filter((c) => !superAdminColumnIds.has(String(c.id)))

  const transactionsComputed = useMemo(() => {
    return (transactionsList ?? []).map((t: any) => ({
      ...t,
      ownerLabel: String(getOwnerLabel(t)).trim(),
    }))
  }, [transactionsList])

  const {
    ListItemTable,
    ItemDataTable,
    pagination,
    DataTableHead,
    selected,
    rows,
    onApplyFilter,
    dataByFilter,
    onSetFilter,
  } = useDataTable<any>(headCells, transactionsComputed, "createdAt", {
    onShow(values) {
      onShowTransaction(values[0])
    },
  })

  const amountOptions = useMemo(() => {
    const toInt = (v: any) => {
      const n = Number(v)
      return Number.isFinite(n) ? Math.trunc(n) : null
    }

    const vals: number[] = []
    ;(transactionsComputed ?? []).forEach((t: any) => {
      const n = toInt(t?.amount)
      if (n !== null) vals.push(n)
    })

    return Array.from(new Set(vals))
      .sort((a, b) => a - b)
      .map(String)
  }, [transactionsComputed])

  const ownerOptions = useMemo(() => {
    const blocked = new Set(["-", "no disponible", "no disponible.", "n/a", "na", "null", "undefined", ""])
    const vals: string[] = []

    ;(transactionsComputed ?? []).forEach((t: any) => {
      const s = String(t?.ownerLabel ?? "").trim()
      if (!s) return
      const key = s.toLowerCase()
      if (blocked.has(key)) return
      vals.push(s)
    })

    return Array.from(new Set(vals)).sort((a, b) => a.localeCompare(b))
  }, [transactionsComputed])

  const rowsForExport = useMemo(() => {
    const base = transactionsComputed.map((item: any, idx: number) => ({ ...item, id_data_table: idx + 1 }))
    let result = base
    if (dataByFilter?.length) result = onFilterDataTable(result, dataByFilter as any)
    return result as any as ITransactionData[]
  }, [transactionsComputed, dataByFilter])

  const activeFilterChips = useMemo(() => {
    const chips: { key: keyof IDataTransactionByFilter; label: string }[] = []

    if (filterTransaction.owner !== initTransactionFilter.owner)
      chips.push({ key: "owner", label: `Usuario: ${filterTransaction.owner}` })
    if (filterTransaction.type !== initTransactionFilter.type)
      chips.push({ key: "type", label: `Tipo: ${filterTransaction.type}` })
    if (filterTransaction.status !== initTransactionFilter.status)
      chips.push({ key: "status", label: `Estado: ${filterTransaction.status}` })
    if (filterTransaction.amountMin !== initTransactionFilter.amountMin)
      chips.push({ key: "amountMin", label: `Monto: ${filterTransaction.amountMin}` })
    if (filterTransaction.createdAt !== initTransactionFilter.createdAt)
      chips.push({ key: "createdAt", label: `Fecha: ${filterTransaction.createdAt}` })

    return chips
  }, [filterTransaction])

  const handleReset = () => {
    setFilterTransaction(initTransactionFilter)

    onSetFilter("createdAt" as any, "date-from", "")
    onSetFilter("createdAt" as any, "date-to", "")
    onSetFilter("type" as any, "=", "")
    onSetFilter("status" as any, "=", "")
    onSetFilter("amount" as any, "=", "" as any)
    onSetFilter("ownerLabel" as any, "=", "")

    onApplyFilter([], true)
  }

  const handleFilterChange = (field: keyof IDataTransactionByFilter, value: any) => {
    if (field === "createdAt") {
      const ymd = String(value ?? "")
      const nextDay = ymd ? addDaysYYYYMMDD(ymd, 1) : ""
      const newFilter = [
        ...dataByFilter.filter(f => f.field !== "createdAt"),
        ...(ymd ? [
          { field: "createdAt", action: "date-from", value: ymd },
          { field: "createdAt", action: "date-to", value: nextDay }
        ] : [])
      ]
      onSetFilter("createdAt" as any, "date-from", ymd || "")
      onSetFilter("createdAt" as any, "date-to", nextDay || "")
      onApplyFilter(newFilter as any)
      setFilterTransaction(prev => ({ ...prev, createdAt: ymd }))
      return
    }

    if (field === "amountMin") {
      const v = String(value ?? "")
      const num = v ? Number(v) : null
      const numVal = num !== null && Number.isFinite(num) ? num : null
      const newFilter = [
        ...dataByFilter.filter(f => f.field !== "amount"),
        ...(numVal !== null ? [{ field: "amount", action: "=", value: numVal }] : [])
      ]
      onSetFilter("amount" as any, "=", "" as any)
      if (numVal !== null) onSetFilter("amount" as any, "=", numVal as any)
      onApplyFilter(newFilter as any)
      setFilterTransaction(prev => ({ ...prev, amountMin: v }))
      return
    }

    if (field === "owner") {
      const v = String(value ?? "")
      const newFilter = [
        ...dataByFilter.filter(f => !(f.field === "ownerLabel" && f.action === "=")),
        ...(v ? [{ field: "ownerLabel", action: "=", value: v }] : [])
      ]
      onSetFilter("ownerLabel" as any, "=", v || "")
      onApplyFilter(newFilter as any)
      setFilterTransaction(prev => ({ ...prev, owner: v }))
      return
    }

    if (field === "type" || field === "status") {
      const normalizedValue = value === "all" ? "" : value
      const newFilter = [
        ...dataByFilter.filter(f => !(f.field === field && f.action === "=")),
        ...(normalizedValue ? [{ field, action: "=", value: normalizedValue }] : [])
      ]
      onSetFilter(field as any, "=", normalizedValue)
      onApplyFilter(newFilter as any)
      setFilterTransaction(prev => ({ ...prev, [field]: value }))
      return
    }
  }

  const removeFilter = (key: keyof IDataTransactionByFilter) => {
    handleFilterChange(key, initTransactionFilter[key])
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

      const head = [["Usuario/Empresa", "Tipo", "Monto", "Balance", "Estado", "Fecha"]]

      const body = rowsForExport.map((row: any) => [
        getOwnerLabel(row),
        String(getTxTypeLabel(row.type)),
        `${Number(row.amount ?? 0).toFixed(2)} USD`,
        `${Number(row.balanceAfter ?? 0).toFixed(2)} USD`,
        String(getTxStatusLabel(row.status)),
        formatterDateDDMMYYYY(row.createdAt),
      ])

      const tableWidth = pageWidth - 52 * 2

      const W_FECHA = 120
      const W_MONTO = 110
      const W_BAL = 110
      const W_ESTADO = 140
      const W_OWNER = 160

      const remaining = tableWidth - (W_FECHA + W_MONTO + W_BAL + W_ESTADO + W_OWNER)
      const W_TIPO = Math.max(160, remaining)

      autoTable(doc, {
        head,
        body,
        startY: TOP_TABLE_Y,
        margin: { left: 52, right: 52, top: TOP_TABLE_Y },
        tableWidth,
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 5, overflow: "linebreak", valign: "middle" },
        headStyles: { fontStyle: "bold", fillColor: [28, 54, 128], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 252] },
        columnStyles: {
          0: { cellWidth: W_OWNER },
          1: { cellWidth: W_TIPO },
          2: { cellWidth: W_MONTO, halign: "right" },
          3: { cellWidth: W_BAL, halign: "right" },
          4: { cellWidth: W_ESTADO },
          5: { cellWidth: W_FECHA, halign: "right" },
        },
        pageBreak: "auto",
        rowPageBreak: "avoid",
        didDrawPage: () => drawHeader(),
      })

      doc.save(`transactions-resumen-${new Date().toISOString().slice(0, 10)}.pdf`)
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
                <Receipt sx={{ color: "white", fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
                  Listado de Transacciones
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {transactionsComputed.length} transacciones registradas
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
              <FilterTranstDataTable
                transactionFilter={filterTransaction}
                amountOptions={amountOptions}
                ownerOptions={ownerOptions}
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
            showSearch={false}
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
            loading={{ load: loading || false, cell: headCells.length }}
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
                "& thead th": {
                  textAlign: "left !important",
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
            {!loading && rows.length === 0 ? (
              <ListItemTable id_data_table={0}>
                <ItemDataTable
                  align="center"
                  colSpan={headCells.length}
                  sx={{
                    py: 6,
                    textAlign: "center !important",
                  }}
                >
                  <Typography fontWeight={600}>No hay datos registrados</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    No se encontraron transacciones con los filtros aplicados.
                  </Typography>
                </ItemDataTable>
              </ListItemTable>
            ) : (
              rows.map((row: any, idx: number) => {
                const labelId = `enhanced-table-${idx}`
                const statusChip = getStatusChipProps(row.status)
                const typeChip = getTypeChipProps(row.type)
                const amountTone = getAmountTone(row.type)

                return (
                  <ListItemTable key={row.id_data_table} id_data_table={row.id_data_table}>
                    <ItemDataTable component="th" id={labelId} scope="row">
                      <Typography fontWeight={400}>{getOwnerLabel(row)}</Typography>
                    </ItemDataTable>

                    <ItemDataTable align="left">
                      <Chip
                        label={typeChip.label}
                        size="small"
                        sx={{
                          borderRadius: 2,
                          ...typeChip.sx,
                        }}
                      />
                    </ItemDataTable>

                    <ItemDataTable align="left">
                      <Stack spacing={0.25}>
                        <Typography fontWeight={500} color={amountTone}>
                          {Number(row.amount ?? 0).toFixed(2)} USD
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Movimiento
                        </Typography>
                      </Stack>
                    </ItemDataTable>

                    <ItemDataTable align="left">
                      <Stack spacing={0.25}>
                        <Typography fontWeight={500}>
                          {Number(row.balanceAfter ?? 0).toFixed(2)} USD
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Balance final
                        </Typography>
                      </Stack>
                    </ItemDataTable>

                    <ItemDataTable align="left">
                      <Chip
                        label={statusChip.label}
                        color={statusChip.color}
                        variant={statusChip.variant}
                        size="small"
                        sx={{
                          borderRadius: 2,
                          fontWeight: 400,
                          minWidth: 110,
                        }}
                      />
                    </ItemDataTable>

                    <ItemDataTable align="left">
                      <Typography fontWeight={400}>
                        {formatterDateDDMMYYYY(row.createdAt)}
                      </Typography>
                    </ItemDataTable>
                  </ListItemTable>
                )
              })
            )}
          </DataTable>
        </PaperDataTable>
      </Box>
    </Fade>
  )
}

const headCells: DataTableHeadCellProps<any>[] = [
  { id: "ownerLabel" as any, numeric: false, disablePadding: false, label: "Usuario/Empresa" },
  { id: "type", numeric: false, disablePadding: false, label: "Tipo" },
  { id: "amount", numeric: true, disablePadding: false, label: "Monto" },
  { id: "balanceAfter", numeric: true, disablePadding: false, label: "Balance" },
  { id: "status", numeric: false, disablePadding: false, label: "Estado" },
  { id: "createdAt", numeric: true, disablePadding: false, label: "Fecha" },
]