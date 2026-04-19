import React, { useMemo, useState } from "react"
import {
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  alpha,
  Drawer,
  Divider,
} from "@mui/material"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined"
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined"
import FilterListOffOutlinedIcon from "@mui/icons-material/FilterListOffOutlined"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import logo2x from "@/assets/images/logo/esim-logo.svg"

import { useDataTable } from "@/shared/hooks/useDataTable"
import { DataTableHeadCellProps } from "@/shared/interfaces/hooks/use-data-table.interface"
import { formatterDateDDMMYYYY } from "@/shared/helpers/handligDateHelper"
import { DataTable, DataTableToolbar, PaperDataTable } from "@/shared/components/data-table"
import { onFilterDataTable } from "@/shared/helpers/hooks/useDataTableHelper"
import {
  CompanyTopupProvider,
  CompanyTopupStatus,
  ICompanyTopup,
} from "@/admin/utils/interfaces/company-topup.interface"
import CompanyTopupDetailDialog from "./CompanyTopupDetailDialog"
import {
  FilterCompanyTopupDataTable,
  IDataCompanyTopupFilter,
} from "./FilterCompanyTopupDataTable"
import { TipsAndUpdates } from "@mui/icons-material"

interface Props {
  paymentsList: ICompanyTopup[]
  loading?: boolean
  onRefresh: () => void
}

const initPaymentFilter: IDataCompanyTopupFilter = {
  provider: "all",
  status: "all",
  createdAt: "",
  amountUsd: "",
  company: "",
}

const blobToDataURL = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })

const getProviderLabel = (provider?: CompanyTopupProvider | null) => {
  if (provider === CompanyTopupProvider.WEBPAY) return "WebPay"
  if (provider === CompanyTopupProvider.KHIPU) return "Khipu"
  if (provider === CompanyTopupProvider.BANK_TRANSFER) return "Transferencia"
  return "No disponible"
}

const getProviderTooltip = (provider?: CompanyTopupProvider | null) => {
  if (provider === CompanyTopupProvider.WEBPAY) return "Pago realizado con WebPay"
  if (provider === CompanyTopupProvider.KHIPU) return "Pago realizado con Khipu"
  if (provider === CompanyTopupProvider.BANK_TRANSFER) return "Transferencia bancaria"
  return "Proveedor no disponible"
}

const getStatusLabel = (status?: CompanyTopupStatus | null) => {
  if (status === CompanyTopupStatus.INITIALIZED) return "Inicializado"
  if (status === CompanyTopupStatus.PENDING) return "Pendiente"
  if (status === CompanyTopupStatus.PENDING_BANK_TRANSFER) return "Pendiente"
  if (status === CompanyTopupStatus.PAID) return "Pagado"
  if (status === CompanyTopupStatus.REJECTED) return "Rechazado"
  if (status === CompanyTopupStatus.CANCELLED) return "Cancelado"
  return "No disponible"
}

const getStatusTooltip = (status?: CompanyTopupStatus | null) => {
  if (status === CompanyTopupStatus.PENDING_BANK_TRANSFER) return "Pendiente de aprobación"
  if (status === CompanyTopupStatus.PENDING) return "Pendiente"
  return getStatusLabel(status)
}

const getStatusChipProps = (status?: CompanyTopupStatus | null) => {
  const key = String(status ?? "").toLowerCase()

  if (key === CompanyTopupStatus.PAID) {
    return { label: getStatusLabel(status), color: "success" as const, variant: "filled" as const }
  }

  if (key === CompanyTopupStatus.PENDING || key === CompanyTopupStatus.PENDING_BANK_TRANSFER) {
    return { label: getStatusLabel(status), color: "warning" as const, variant: "filled" as const }
  }

  if (key === CompanyTopupStatus.REJECTED || key === CompanyTopupStatus.CANCELLED) {
    return { label: getStatusLabel(status), color: "error" as const, variant: "filled" as const }
  }

  return { label: getStatusLabel(status), color: "default" as const, variant: "outlined" as const }
}

const getProviderChipSx = (provider?: CompanyTopupProvider | null) => {
  if (provider === CompanyTopupProvider.BANK_TRANSFER) {
    return {
      bgcolor: alpha("#1976d2", 0.1),
      color: "primary.dark",
      fontWeight: 500,
      border: "1px solid",
      borderColor: alpha("#1976d2", 0.22),
    }
  }

  if (provider === CompanyTopupProvider.KHIPU) {
    return {
      bgcolor: alpha("#9c27b0", 0.1),
      color: "#7b1fa2",
      fontWeight: 500,
      border: "1px solid",
      borderColor: alpha("#9c27b0", 0.22),
    }
  }

  if (provider === CompanyTopupProvider.WEBPAY) {
    return {
      bgcolor: alpha("#2e7d32", 0.1),
      color: "success.dark",
      fontWeight: 500,
      border: "1px solid",
      borderColor: alpha("#2e7d32", 0.22),
    }
  }

  return {
    bgcolor: alpha("#616161", 0.08),
    color: "text.secondary",
    fontWeight: 500,
  }
}

const modernButtonSx = {
  borderRadius: 2,
  textTransform: "none",
  fontWeight: 500,
  px: 2,
  py: 0.9,
  boxShadow: "none",
  "&:hover": {
    boxShadow: "none",
    transform: "none",
  },
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

export const ListCompanyTopupDataTable = ({
  paymentsList,
  loading,
  onRefresh,
}: Props) => {
  const [filterPayment, setFilterPayment] = useState<IDataCompanyTopupFilter>(initPaymentFilter)
  const [isDownloading, setIsDownloading] = useState(false)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<ICompanyTopup | null>(null)

  const paymentsComputed = useMemo(() => {
    const safeList = Array.isArray(paymentsList) ? paymentsList : []

    return safeList.map((p) => ({
      ...p,
      companyLabel: String(p.company?.name ?? p.companyId ?? "No disponible").trim(),
      amountUsdInt: Number.isFinite(Number(p.amountUsd)) ? String(Math.trunc(Number(p.amountUsd))) : "",
      createdByLabel: p.createdByUser?.email ?? p.createdByUser?.name ?? "Sin usuario",
    }))
  }, [paymentsList])

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
  } = useDataTable<any>(headCells, paymentsComputed, "createdAt")

  const companyOptions = useMemo(() => {
    const vals: string[] = []
    ;(paymentsComputed ?? []).forEach((p: any) => {
      const s = String(p?.companyLabel ?? "").trim()
      if (s) vals.push(s)
    })
    return Array.from(new Set(vals)).sort((a, b) => a.localeCompare(b))
  }, [paymentsComputed])

  const amountOptions = useMemo(() => {
    const vals: number[] = []
    ;(paymentsComputed ?? []).forEach((p: any) => {
      const n = Number(p?.amountUsd)
      if (Number.isFinite(n)) vals.push(Math.trunc(n))
    })

    return Array.from(new Set(vals))
      .sort((a, b) => a - b)
      .map(String)
  }, [paymentsComputed])

  const rowsForExport = useMemo(() => {
    const base = paymentsComputed.map((item: any, idx: number) => ({ ...item, id_data_table: idx + 1 }))
    let result = base
    if (dataByFilter?.length) result = onFilterDataTable(result, dataByFilter as any)
    return result as any as ICompanyTopup[]
  }, [paymentsComputed, dataByFilter])

  const activeFilterChips = useMemo(() => {
    const chips: { key: keyof IDataCompanyTopupFilter; label: string }[] = []

    if (filterPayment.company !== initPaymentFilter.company)
      chips.push({ key: "company", label: `Empresa: ${filterPayment.company}` })
    if (filterPayment.provider !== initPaymentFilter.provider)
      chips.push({ key: "provider", label: `Proveedor: ${filterPayment.provider}` })
    if (filterPayment.status !== initPaymentFilter.status)
      chips.push({ key: "status", label: `Estado: ${filterPayment.status}` })
    if (filterPayment.amountUsd !== initPaymentFilter.amountUsd)
      chips.push({ key: "amountUsd", label: `Monto USD: ${filterPayment.amountUsd}` })
    if (filterPayment.createdAt !== initPaymentFilter.createdAt)
      chips.push({ key: "createdAt", label: `Fecha: ${filterPayment.createdAt}` })

    return chips
  }, [filterPayment])

  const handleReset = () => {
    setFilterPayment(initPaymentFilter)

    onSetFilter("companyLabel" as any, "=", "")
    onSetFilter("provider" as any, "=", "")
    onSetFilter("status" as any, "=", "")
    onSetFilter("amountUsd" as any, "=", "" as any)
    onSetFilter("createdAt" as any, "date-from", "")
    onSetFilter("createdAt" as any, "date-to", "")

    onApplyFilter([], true)
  }

  const handleFilterChange = (field: keyof IDataCompanyTopupFilter, value: any) => {
    if (field === "company") {
      const v = String(value ?? "")
      const newFilter = [
        ...dataByFilter.filter(f => !(f.field === "companyLabel" && f.action === "=")),
        ...(v ? [{ field: "companyLabel", action: "=", value: v }] : [])
      ]
      onSetFilter("companyLabel" as any, "=", v || "")
      onApplyFilter(newFilter as any)
      setFilterPayment(prev => ({ ...prev, company: v }))
      return
    }

    if (field === "provider") {
      const v = value as IDataCompanyTopupFilter["provider"]
      const filterVal = v === "all" ? "" : v
      const newFilter = [
        ...dataByFilter.filter(f => !(f.field === "provider" && f.action === "=")),
        ...(filterVal ? [{ field: "provider", action: "=", value: filterVal }] : [])
      ]
      onSetFilter("provider" as any, "=", filterVal)
      onApplyFilter(newFilter as any)
      setFilterPayment(prev => ({ ...prev, provider: v }))
      return
    }

    if (field === "status") {
      const v = value as IDataCompanyTopupFilter["status"]
      const filterVal = v === "all" ? "" : v
      const newFilter = [
        ...dataByFilter.filter(f => !(f.field === "status" && f.action === "=")),
        ...(filterVal ? [{ field: "status", action: "=", value: filterVal }] : [])
      ]
      onSetFilter("status" as any, "=", filterVal)
      onApplyFilter(newFilter as any)
      setFilterPayment(prev => ({ ...prev, status: v }))
      return
    }

    if (field === "amountUsd") {
      const v = String(value ?? "")
      const num = v ? Number(v) : null
      const numVal = num !== null && Number.isFinite(num) ? num : null
      const newFilter = [
        ...dataByFilter.filter(f => f.field !== "amountUsd"),
        ...(numVal !== null ? [{ field: "amountUsd", action: "=", value: numVal }] : [])
      ]
      onSetFilter("amountUsd" as any, "=", "" as any)
      if (numVal !== null) onSetFilter("amountUsd" as any, "=", numVal as any)
      onApplyFilter(newFilter as any)
      setFilterPayment(prev => ({ ...prev, amountUsd: v }))
      return
    }

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
      setFilterPayment(prev => ({ ...prev, createdAt: ymd }))
      return
    }
  }

  const removeFilter = (key: keyof IDataCompanyTopupFilter) => {
    handleFilterChange(key, initPaymentFilter[key])
  }

  const handleDownloadPdf = async () => {
    try {
      if (!rowsForExport.length) return
      setIsDownloading(true)

      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" })

      const logoUrl = typeof logo2x === "string" ? logo2x : (logo2x as any).src

      let logoDataUrl: string | null = null
      try {
        const blob = await fetch(logoUrl).then((r) => r.blob())
        logoDataUrl = await blobToDataURL(blob)
      } catch {
        logoDataUrl = null
      }

      const pageWidth = doc.internal.pageSize.getWidth()
      const marginX = 52
      const safeRight = pageWidth - marginX

      const drawHeader = () => {
        const topY = 26

        if (logoDataUrl) doc.addImage(logoDataUrl, "PNG", marginX, topY, 110, 34)

        const textX = logoDataUrl ? marginX + 125 : marginX

        doc.setTextColor(0)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(13)
        doc.text("Listado de pagos de empresas", textX, topY + 16)

        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
        doc.text(`Generado: ${new Date().toLocaleString()}`, textX, topY + 34)
        doc.text(`Registros: ${rowsForExport.length}`, textX, topY + 48)

        doc.setDrawColor(210)
        doc.setLineWidth(0.8)
        doc.line(marginX, topY + 64, safeRight, topY + 64)
      }

      drawHeader()

      const head = [["Empresa", "Proveedor", "Estado", "Monto USD", "Monto CLP", "Fecha"]]

      const body = rowsForExport.map((row) => [
        row.company?.name ?? row.companyId,
        getProviderLabel(row.provider),
        getStatusLabel(row.status),
        `${Number(row.amountUsd ?? 0).toFixed(2)} USD`,
        `${Number(row.amountClp ?? 0).toFixed(0)} CLP`,
        formatterDateDDMMYYYY(row.createdAt),
      ])

      autoTable(doc, {
        head,
        body,
        startY: 110,
        margin: { left: 52, right: 52, top: 110 },
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 5, overflow: "linebreak", valign: "middle" },
        headStyles: { fontStyle: "bold", fillColor: [28, 54, 128], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 252] },
        didDrawPage: () => drawHeader(),
      })

      doc.save(`company-topups-${new Date().toISOString().slice(0, 10)}.pdf`)
    } finally {
      setIsDownloading(false)
    }
  }

  const openDetail = (row: ICompanyTopup) => {
    setSelectedPayment(row)
    setDetailOpen(true)
  }

  return (
    <>
      <PaperDataTable>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 2,
            px: 3,
            py: 2.5,
            borderBottom: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          <Button
            onClick={handleDownloadPdf}
            variant="contained"
            startIcon={<PictureAsPdfIcon />}
            disabled={isDownloading || !rowsForExport.length}
            sx={{
              ...modernButtonSx,
              bgcolor: "#E60023",
              "&:hover": {
                bgcolor: "#C4001E",
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
            <FilterCompanyTopupDataTable
              paymentFilter={filterPayment}
              companyOptions={companyOptions}
              amountOptions={amountOptions}
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
                textAlign: "left !important",
                verticalAlign: "middle",
                bgcolor: "transparent",
                fontWeight: 600,
                textTransform: "uppercase",
                fontSize: "0.72rem",
                letterSpacing: "0.4px",
                color: "text.secondary",
                borderBottom: "1px solid",
                borderColor: "divider",
                py: 1.8,
              },
              "& td": {
                textAlign: "left !important",
                verticalAlign: "middle",
                borderBottom: "1px solid",
                borderColor: "divider",
                py: 1.8,
              },
              "& tr": {
                transition: "background-color 0.2s ease-in-out",
                "&:hover": {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.025),
                },
              },
            },
          }}
        >
          {!loading && rows.length === 0 ? (
            <ListItemTable id_data_table={0}>
              <ItemDataTable align="center" colSpan={headCells.length} sx={{ py: 8 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      bgcolor: (theme) => alpha(theme.palette.text.secondary, 0.08),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ReceiptLongIcon sx={{ fontSize: 36, color: "text.secondary" }} />
                  </Box>

                  <Typography fontWeight={600} color="text.primary">
                    No hay pagos registrados
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    No se encontraron pagos con los filtros aplicados.
                  </Typography>
                </Box>
              </ItemDataTable>
            </ListItemTable>
          ) : (
            rows.map((row: any, idx: number) => {
              const labelId = `enhanced-table-${idx}`
              const statusChip = getStatusChipProps(row.status)

              return (
                <ListItemTable key={row.id_data_table} id_data_table={row.id_data_table}>
                  <ItemDataTable component="th" id={labelId} scope="row">
                    <Typography fontWeight={500} color="text.primary">
                      {row.company?.name ?? row.companyId}
                    </Typography>
                  </ItemDataTable>

                  <ItemDataTable align="left">
                    <Tooltip title={getProviderTooltip(row.provider)} arrow>
                      <Chip
                        label={getProviderLabel(row.provider)}
                        size="small"
                        sx={{
                          borderRadius: 2,
                          maxWidth: 150,
                          ...getProviderChipSx(row.provider),
                          "& .MuiChip-label": {
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          },
                        }}
                      />
                    </Tooltip>
                  </ItemDataTable>

                  <ItemDataTable align="left">
                    <Tooltip title={getStatusTooltip(row.status)} arrow>
                      <Chip
                        label={statusChip.label}
                        color={statusChip.color}
                        variant={statusChip.variant}
                        size="small"
                        sx={{
                          borderRadius: 2,
                          fontWeight: 500,
                          minWidth: 105,
                        }}
                      />
                    </Tooltip>
                  </ItemDataTable>

                  <ItemDataTable align="left">
                    <Typography fontWeight={400} color="text.primary">
                      {Number(row.amountUsd ?? 0).toFixed(2)}
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                        USD
                      </Typography>
                    </Typography>
                  </ItemDataTable>

                  <ItemDataTable align="left">
                    <Typography fontWeight={400} color="text.primary">
                      {Number(row.amountClp ?? 0).toLocaleString("es-CL")}
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                        CLP
                      </Typography>
                    </Typography>
                  </ItemDataTable>

                  <ItemDataTable align="left">
                    <Typography variant="body2" fontWeight={400} color="text.primary">
                      {formatterDateDDMMYYYY(row.createdAt)}
                    </Typography>
                  </ItemDataTable>

                  <ItemDataTable align="left">
                    <IconButton
                      onClick={() => openDetail(row)}
                      sx={{
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                        color: "primary.main",
                        borderRadius: 2,
                        "&:hover": {
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14),
                        },
                      }}
                    >
                      <VisibilityOutlinedIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </ItemDataTable>
                </ListItemTable>
              )
            })
          )}
        </DataTable>
      </PaperDataTable>

      <CompanyTopupDetailDialog
        open={detailOpen}
        payment={selectedPayment}
        onClose={() => {
          setDetailOpen(false)
          setSelectedPayment(null)
        }}
        onRefresh={onRefresh}
        getProviderLabel={getProviderLabel}
        getStatusLabel={getStatusLabel}
        getStatusChipProps={getStatusChipProps}
      />
    </>
  )
}

const headCells: DataTableHeadCellProps<any>[] = [
  { id: "companyLabel" as any, numeric: false, disablePadding: false, label: "Empresa" },
  { id: "provider", numeric: false, disablePadding: false, label: "Proveedor" },
  { id: "status", numeric: false, disablePadding: false, label: "Estado" },
  { id: "amountUsd", numeric: true, disablePadding: false, label: "Monto USD" },
  { id: "amountClp", numeric: true, disablePadding: false, label: "Monto CLP" },
  { id: "createdAt", numeric: true, disablePadding: false, label: "Fecha" },
  { id: "id" as any, numeric: false, disablePadding: false, label: "Acciones" },
]

export default ListCompanyTopupDataTable