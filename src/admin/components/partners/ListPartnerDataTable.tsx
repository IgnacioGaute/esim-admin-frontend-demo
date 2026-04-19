import React, { useMemo, useState } from "react"
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  Fade,
  alpha,
} from "@mui/material"
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined"
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined"
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

import { FilterPartnerDataTable, IDataPartnerByFilter } from "./FilterPartnerDataTable"
import {
  BusinessIntention,
  IPartnerData,
  RequestType,
  Status,
} from "@/admin/utils/interfaces/partners.interface"
import { TipsAndUpdates } from "@mui/icons-material"

interface Props {
  partnersList: IPartnerData[]
  loading?: boolean
  onShowPartner?: (partner: IPartnerData) => void
}

const initPartnerFilter: IDataPartnerByFilter = {
  name: "",
  country: "",
  email: "",
  ownerName: "",
  status: "all",
  requestType: "all",
  businessIntention: "all",
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
    doc.text("Listado de solicitudes", textX, topY + 16)

    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.text(`Generado: ${new Date().toLocaleString()}`, textX, topY + 34)
    doc.text(`Registros: ${totalRows}`, textX, topY + 48)

    hr(topY + 64)
  }
}

const getPartnerStatusLabel = (status: Status | string) => {
  switch (status) {
    case "PENDING":
      return "Pendiente"
    case "APPROVED":
      return "Aprobado"
    case "REJECTED":
      return "Rechazado"
    default:
      return String(status ?? "No disponible")
  }
}

const getPartnerStatusStyles = (status: Status | string) => {
  switch (status) {
    case "APPROVED":
      return { label: "Aprobado", color: "success" as const, variant: "filled" as const }
    case "PENDING":
      return { label: "Pendiente", color: "warning" as const, variant: "filled" as const }
    case "REJECTED":
      return { label: "Rechazado", color: "error" as const, variant: "filled" as const }
    default:
      return { label: String(status ?? "No disponible"), color: "default" as const, variant: "outlined" as const }
  }
}

const getRequestTypeLabel = (type: RequestType | string | null | undefined) => {
  switch (type) {
    case "OWN_USE":
      return "Personal individual"
    case "INFLUENCE":
      return "Influencer"
    case "TECH_COMPANY":
      return "Empresa Tech"
    case "TRAVEL_AGENCY":
      return "Agencia de viaje"
    case "OTHER":
      return "Otro"
    default:
      return "No disponible"
  }
}

const getBusinessIntentionLabel = (type: BusinessIntention | string | null | undefined) => {
  switch (type) {
    case "SELL_TO_END_CUSTOMERS":
      return "Vender eSIMs a clientes finales"
    case "RESELL_TO_AGENCIES":
      return "Revender / distribuir a otras agencias"
    case "BOTH":
      return "Ambas"
    default:
      return "No disponible"
  }
}

export const ListPartnerDataTable = ({
  partnersList,
  loading,
  onShowPartner,
}: Props) => {
  const [filterPartner, setFilterPartner] = useState<IDataPartnerByFilter>(initPartnerFilter)
  const [isDownloading, setIsDownloading] = useState(false)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  const partnersComputed = useMemo(() => {
    return (partnersList ?? []).map((p, idx) => ({
      ...p,
      id_data_table: idx + 1,
      companyNameLabel: String(p?.name ?? "").trim(),
      countryLabel: String(p?.country ?? "").trim(),
      emailLabel: String(p?.email ?? "").trim(),
      ownerNameLabel: String(p?.ownerName ?? "").trim(),
      cityLabel: String(p?.city ?? "").trim(),
      requestTypeLabel: getRequestTypeLabel(p?.requestType),
      businessIntentionLabel: getBusinessIntentionLabel(p?.businessIntention),
      updatedByLabel: String(
        (p as any)?.updatedBy ??
          (p as any)?.updated_by ??
          (p as any)?.updateBy ??
          ""
      ).trim(),
      updatedAtLabel: p?.updated_at ?? null,
    }))
  }, [partnersList])

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
  } = useDataTable<any>(headCells, partnersComputed, "created_at", {
    onShow(values) {
      onShowPartner?.(values[0])
    },
  })

  const companyNameOptions = useMemo(() => {
    return Array.from(
      new Set(
        partnersComputed
          .map((p) => String(p?.companyNameLabel ?? "").trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b))
  }, [partnersComputed])

  const countryOptions = useMemo(() => {
    return Array.from(
      new Set(
        partnersComputed
          .map((p) => String(p?.countryLabel ?? "").trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b))
  }, [partnersComputed])

  const emailOptions = useMemo(() => {
    return Array.from(
      new Set(
        partnersComputed
          .map((p) => String(p?.emailLabel ?? "").trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b))
  }, [partnersComputed])

  const ownerNameOptions = useMemo(() => {
    return Array.from(
      new Set(
        partnersComputed
          .map((p) => String(p?.ownerNameLabel ?? "").trim())
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b))
  }, [partnersComputed])

  const rowsForExport = useMemo(() => {
    const base = partnersComputed.map((item: any, idx: number) => ({
      ...item,
      id_data_table: idx + 1,
    }))

    let result = base
    if (dataByFilter?.length) result = onFilterDataTable(result, dataByFilter as any)
    return result as any as IPartnerData[]
  }, [partnersComputed, dataByFilter])

  const handleFilterChange = (field: keyof IDataPartnerByFilter, value: any) => {
    if (field === "name") {
      const v = String(value ?? "")
      const newFilter = [
        ...dataByFilter.filter(f => !(f.field === "companyNameLabel" && f.action === "=")),
        ...(v ? [{ field: "companyNameLabel", action: "=", value: v }] : [])
      ]
      onSetFilter("companyNameLabel" as any, "=", v || "")
      onApplyFilter(newFilter as any)
      setFilterPartner(prev => ({ ...prev, name: v }))
      return
    }

    if (field === "country") {
      const v = String(value ?? "")
      const newFilter = [
        ...dataByFilter.filter(f => !(f.field === "countryLabel" && f.action === "=")),
        ...(v ? [{ field: "countryLabel", action: "=", value: v }] : [])
      ]
      onSetFilter("countryLabel" as any, "=", v || "")
      onApplyFilter(newFilter as any)
      setFilterPartner(prev => ({ ...prev, country: v }))
      return
    }

    if (field === "email") {
      const v = String(value ?? "")
      const newFilter = [
        ...dataByFilter.filter(f => !(f.field === "emailLabel" && f.action === "=")),
        ...(v ? [{ field: "emailLabel", action: "=", value: v }] : [])
      ]
      onSetFilter("emailLabel" as any, "=", v || "")
      onApplyFilter(newFilter as any)
      setFilterPartner(prev => ({ ...prev, email: v }))
      return
    }

    if (field === "ownerName") {
      const v = String(value ?? "")
      const newFilter = [
        ...dataByFilter.filter(f => !(f.field === "ownerNameLabel" && f.action === "=")),
        ...(v ? [{ field: "ownerNameLabel", action: "=", value: v }] : [])
      ]
      onSetFilter("ownerNameLabel" as any, "=", v || "")
      onApplyFilter(newFilter as any)
      setFilterPartner(prev => ({ ...prev, ownerName: v }))
      return
    }

    if (field === "status") {
      const normalizedValue = value === "all" ? "" : value
      const newFilter = [
        ...dataByFilter.filter(f => !(f.field === "status" && f.action === "=")),
        ...(normalizedValue ? [{ field: "status", action: "=", value: normalizedValue }] : [])
      ]
      onSetFilter("status" as any, "=", normalizedValue)
      onApplyFilter(newFilter as any)
      setFilterPartner(prev => ({ ...prev, status: value }))
      return
    }

    if (field === "requestType") {
      const normalizedValue = value === "all" ? "" : value
      const newFilter = [
        ...dataByFilter.filter(f => !(f.field === "requestType" && f.action === "=")),
        ...(normalizedValue ? [{ field: "requestType", action: "=", value: normalizedValue }] : [])
      ]
      onSetFilter("requestType" as any, "=", normalizedValue)
      onApplyFilter(newFilter as any)
      setFilterPartner(prev => ({ ...prev, requestType: value }))
      return
    }

    if (field === "businessIntention") {
      const normalizedValue = value === "all" ? "" : value
      const newFilter = [
        ...dataByFilter.filter(f => !(f.field === "businessIntention" && f.action === "=")),
        ...(normalizedValue ? [{ field: "businessIntention", action: "=", value: normalizedValue }] : [])
      ]
      onSetFilter("businessIntention" as any, "=", normalizedValue)
      onApplyFilter(newFilter as any)
      setFilterPartner(prev => ({ ...prev, businessIntention: value }))
      return
    }
  }

  const handleReset = () => {
    setFilterPartner(initPartnerFilter)

    onSetFilter("companyNameLabel" as any, "=", "")
    onSetFilter("countryLabel" as any, "=", "")
    onSetFilter("emailLabel" as any, "=", "")
    onSetFilter("ownerNameLabel" as any, "=", "")
    onSetFilter("status" as any, "=", "")
    onSetFilter("requestType" as any, "=", "")
    onSetFilter("businessIntention" as any, "=", "")

    onApplyFilter([], true)
  }

  const removeFilter = (key: keyof IDataPartnerByFilter) => handleFilterChange(key, initPartnerFilter[key])

  const activeFilterChips = useMemo(() => {
    const chips: { key: keyof IDataPartnerByFilter; label: string }[] = []

    if (filterPartner.name !== initPartnerFilter.name)
      chips.push({ key: "name", label: `Nombre: ${filterPartner.name}` })
    if (filterPartner.country !== initPartnerFilter.country)
      chips.push({ key: "country", label: `País: ${filterPartner.country}` })
    if (filterPartner.email !== initPartnerFilter.email)
      chips.push({ key: "email", label: `Email: ${filterPartner.email}` })
    if (filterPartner.ownerName !== initPartnerFilter.ownerName)
      chips.push({ key: "ownerName", label: `Dueño: ${filterPartner.ownerName}` })
    if (filterPartner.status !== initPartnerFilter.status)
      chips.push({ key: "status", label: `Estado: ${filterPartner.status}` })
    if (filterPartner.requestType !== initPartnerFilter.requestType)
      chips.push({ key: "requestType", label: `Tipo solicitud: ${filterPartner.requestType}` })
    if (filterPartner.businessIntention !== initPartnerFilter.businessIntention)
      chips.push({ key: "businessIntention", label: `Intención: ${filterPartner.businessIntention}` })

    return chips
  }, [filterPartner])

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

      const head = [[
        "Empresa",
        "Pais",
        "Ciudad",
        "Usuario",
        "Email",
        "Tipo solicitud",
        "Tipo intencion",
        "Actualizado por",
        "Rubro",
        "Estado",
        "Fecha creacion",
      ]]

      const body = rowsForExport.map((row: any) => [
        String(row.name ?? "No disponible"),
        String(row.country ?? "No disponible"),
        String(row.city ?? "No disponible"),
        String(row.ownerName ?? "No disponible"),
        String(row.email ?? "No disponible"),
        getRequestTypeLabel(row.requestType),
        getBusinessIntentionLabel(row.businessIntention),
        String(row.updatedByLabel ?? "No disponible"),
        String(row.commercialTour ?? "No disponible"),
        getPartnerStatusLabel(row.status),
        formatterDateDDMMYYYY(row.created_at),
      ])

      const tableWidth = pageWidth - marginX * 2

      autoTable(doc, {
        head,
        body,
        startY: TOP_TABLE_Y,
        margin: { left: marginX, right: marginX, top: TOP_TABLE_Y },
        tableWidth,
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 5,
          overflow: "linebreak",
          valign: "middle",
        },
        headStyles: {
          fontStyle: "bold",
          fillColor: [28, 54, 128],
          textColor: 255,
        },
        alternateRowStyles: { fillColor: [245, 247, 252] },
        pageBreak: "auto",
        rowPageBreak: "avoid",
        didDrawPage: () => drawHeader(),
      })

      doc.save(`partners-resumen-${new Date().toISOString().slice(0, 10)}.pdf`)
    } finally {
      setIsDownloading(false)
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

  return (
    <Fade in timeout={400}>
      <Box>
        <PaperDataTable
        >
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

          <DataTableToolbar
            numSelected={selected.length}
            showSearch={false}
          />

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
            {/* Header */}
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
            {/* Active chips inside drawer */}
            {activeFilterChips.length > 0 && (
              <Box sx={{ px: 3, py: 1.5, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04), borderBottom: "1px solid", borderColor: "divider", display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {activeFilterChips.map((chip) => (
                  <Chip key={chip.key} label={chip.label} size="small" onDelete={() => removeFilter(chip.key)} sx={{ borderRadius: "8px", fontWeight: 600, fontSize: "0.72rem", height: 24, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1), color: "primary.main" }} />
                ))}
              </Box>
            )}
            {/* Scrollable content */}
            <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2.5 }}>
              <FilterPartnerDataTable
                partnerFilter={filterPartner}
                companyNameOptions={companyNameOptions}
                countryOptions={countryOptions}
                emailOptions={emailOptions}
                ownerNameOptions={ownerNameOptions}
                onChange={handleFilterChange}
              />
            </Box>
            {/* Footer */}
            <Divider />
            <Box sx={{ px: 3, py: 2, display: "flex", gap: 1.5, flexShrink: 0 }}>
              <Button fullWidth variant="outlined" onClick={handleReset} disabled={activeFilterChips.length === 0} startIcon={<FilterListOffOutlinedIcon />} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}>Limpiar filtros</Button>
              <Button fullWidth variant="contained" onClick={() => setFilterDrawerOpen(false)} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, boxShadow: "none" }}>Listo</Button>

            </Box>
          </Drawer>

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
                "& th, & td": {
                  textAlign: "left !important",
                  verticalAlign: "middle",
                },
                "& thead th": {
                  textAlign: "left !important",
                  textTransform: "uppercase",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  color: "text.secondary",
                  backgroundColor: (theme) => alpha(theme.palette.background.default, 0.6),
                  borderBottom: "2px solid",
                  borderColor: "divider",
                },
                "& tbody tr": {
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
                  },
                },
              },
            }}
          >
            {rows.map((row: any, idx: number) => {
              const labelId = `enhanced-table-${idx}`
              const statusConfig = getPartnerStatusStyles(row.status)

              return (
                <ListItemTable key={row.id_data_table} id_data_table={row.id_data_table}>
                  <ItemDataTable component="th" id={labelId} scope="row">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {row.name || "No disponible"}
                      </Typography>
                    </Box>
                  </ItemDataTable>

                  <ItemDataTable align="left">
                    <Typography variant="body2">{row.country || "No disponible"}</Typography>
                  </ItemDataTable>

                  <ItemDataTable align="left">
                    <Typography variant="body2">{row.ownerName || "No disponible"}</Typography>
                  </ItemDataTable>

                  <ItemDataTable
                    align="left"
                    sx={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <Tooltip title={row.email ? `Enviar email a ${row.email}` : "No disponible"} arrow>
                      <Box
                        component={row.email ? "a" : "span"}
                        href={row.email ? `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(row.email)}` : undefined}
                        target={row.email ? "_blank" : undefined}
                        rel={row.email ? "noopener noreferrer" : undefined}
                        onClick={row.email ? (e: React.MouseEvent) => e.stopPropagation() : undefined}
                        sx={{
                          display: "block",
                          width: "100%",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontSize: "0.875rem",
                          color: row.email ? "primary.main" : "inherit",
                          textDecoration: row.email ? "underline" : "none",
                          cursor: row.email ? "pointer" : "default",
                        }}
                      >
                        {row.email || "No disponible"}
                      </Box>
                    </Tooltip>
                  </ItemDataTable>

                  <ItemDataTable align="left">
                    <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                      {getRequestTypeLabel(row.requestType)}
                    </Typography>
                  </ItemDataTable>

                  <ItemDataTable align="left">
                    <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                      {getBusinessIntentionLabel(row.businessIntention)}
                    </Typography>
                  </ItemDataTable>

                  <ItemDataTable align="left">
                    <Chip
                      label={statusConfig.label}
                      color={statusConfig.color}
                      variant={statusConfig.variant}
                      size="small"
                      sx={{ borderRadius: 2, fontWeight: 500, minWidth: 100 }}
                    />
                  </ItemDataTable>

                  <ItemDataTable align="left">
                    <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                      {row.updatedByLabel || "No disponible"}
                    </Typography>
                  </ItemDataTable>

                  <ItemDataTable align="left">
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                      {formatterDateDDMMYYYY(row.created_at)}
                    </Typography>
                  </ItemDataTable>

                  <ItemDataTable align="center">
                    <Tooltip title="Ver detalle" arrow>
                      <IconButton
                        onClick={() => onShowPartner?.(row)}
                      sx={{
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                        color: "primary.main",
                        borderRadius: 2,
                        "&:hover": {
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14),
                        },
                      }}
                      >
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ItemDataTable>
                </ListItemTable>
              )
            })}
          </DataTable>
        </PaperDataTable>
      </Box>
    </Fade>
  )
}

const headCells: DataTableHeadCellProps<any>[] = [
  { id: "companyNameLabel" as any, numeric: false, disablePadding: false, label: "Empresa" },
  { id: "countryLabel" as any, numeric: false, disablePadding: false, label: "Pais" },
  { id: "ownerNameLabel" as any, numeric: false, disablePadding: false, label: "Usuario" },
  { id: "emailLabel" as any, numeric: false, disablePadding: false, label: "Email" },
  { id: "requestTypeLabel" as any, numeric: false, disablePadding: false, label: "Tipo solicitud" },
  { id: "businessIntentionLabel" as any, numeric: false, disablePadding: false, label: "Tipo intencion" },
  { id: "status", numeric: false, disablePadding: false, label: "Estado" },
  { id: "updatedByLabel" as any, numeric: false, disablePadding: false, label: "Actualizado por" },
  { id: "created_at", numeric: true, disablePadding: false, label: "Fecha de creacion" },
  { id: "actions" as any, numeric: false, disablePadding: false, label: "Acciones" },
]
