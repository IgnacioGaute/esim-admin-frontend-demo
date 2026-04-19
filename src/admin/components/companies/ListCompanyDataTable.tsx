import React, { useMemo, useState } from "react"
import {
  Box,
  Button,
  Checkbox,
  Typography,
  IconButton,
  Tooltip,
  Collapse,
  Divider,
  Chip,
  Fade,
  alpha,
  Drawer,
  Stack,
} from "@mui/material"
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import BusinessIcon from "@mui/icons-material/Business"
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates"
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
import { FilterCompanyDataTable, IDataCompanyByFilter } from "./FilterCompanyDataTable"

import { onFilterDataTable, onSearchDataTable } from "@/shared/helpers/hooks/useDataTableHelper"
import { ICompanyData } from "../../utils/interfaces/company-data.interface"

type CompanyPaymentType = "PRE_PAYMENT" | "POST_PAYMENT" | "UNDEFINED"

type CompanyUserMini = {
  id?: string
  name?: string
  email?: string
  type?: "ADMIN" | "SELLER" | "SUPER_ADMIN"
  amount?: number | null
}

export type ICompanyListRow = ICompanyData & {
  amount?: number | null
  users?: CompanyUserMini[]
  paymentType?: CompanyPaymentType | null
  adminEmails?: string

  paymentTypeNormalized?: CompanyPaymentType
  paymentTypeLabel?: string
  searchIndex?: string
}

interface Props {
  companyList: ICompanyListRow[]
  onShowCompany: (company: ICompanyListRow) => void
  onEdit: (companyId: string) => void
  onDelete: (companyId: string) => void
  loading?: boolean
}

const initFilterCompany: IDataCompanyByFilter = {
  companyId: "",
  created_at: "",
  updated_at: "",
  paymentType: "all",
  balanceMin: "",
}

const blobToDataURL = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })

const formatMoneySmart = (n: number, opts?: { hideZero?: boolean }) => {
  const num = Number.isFinite(n) ? n : 0
  if (opts?.hideZero && Math.abs(num) < 0.000001) return "$0"

  const rounded = Math.round(num * 100) / 100
  const hasDecimals = Math.abs(rounded % 1) > 0.000001

  const formatted = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(rounded)

  return `$ ${formatted}`
}

const normalizePaymentType = (t?: CompanyPaymentType | null): CompanyPaymentType => {
  if (t === "PRE_PAYMENT" || t === "POST_PAYMENT" || t === "UNDEFINED") return t
  return "UNDEFINED"
}

const mapPaymentTypeLabel = (t?: CompanyPaymentType | null) => {
  const v = normalizePaymentType(t)
  if (v === "PRE_PAYMENT") return "Prepago"
  if (v === "POST_PAYMENT") return "Postpago"
  return "Sin definir"
}

const getPaymentTypeColor = (t?: CompanyPaymentType | null) => {
  const v = normalizePaymentType(t)
  if (v === "PRE_PAYMENT") return "success"
  if (v === "POST_PAYMENT") return "info"
  return "default"
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

// Estilos modernos
const modernPaperSx = {
  borderRadius: 3,
  overflow: "hidden",
  border: "1px solid",
  borderColor: "divider",
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: (theme: any) => `0 8px 32px ${alpha(theme.palette.primary.main, 0.08)}`,
  },
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

export const ListCompanyDataTable = ({
  companyList,
  loading,
  onShowCompany,
  onEdit,
  onDelete,
}: Props) => {
  const [filterCompany, setFilterCompany] = useState<IDataCompanyByFilter>(initFilterCompany)
  const [isDownloading, setIsDownloading] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [expandedAdminsByCompany, setExpandedAdminsByCompany] = useState<Record<string, boolean>>({})
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  const stopRowClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const toggleAdminsExpanded = (companyId: string) => (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setExpandedAdminsByCompany((prev) => ({ ...prev, [companyId]: !prev[companyId] }))
  }

  const normRole = (v: unknown) =>
    String(v ?? "")
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_")
      .replace(/__+/g, "_")

  const pickEmail = (u: any) =>
    String(u?.email ?? u?.user?.email ?? u?.admin?.email ?? "")
      .trim()
      .toLowerCase()

  const pickRole = (u: any) =>
    normRole(u?.type ?? u?.role ?? u?.user?.type ?? u?.user?.role)

  const isAdminLike = (role: string) => role === "ADMIN" || role === "SUPER_ADMIN"

  const companyListComputed = useMemo<ICompanyListRow[]>(() => {
    return companyList.map((item) => {
      const usersAny: any[] = Array.isArray((item as any).users) ? (item as any).users : []

      const adminEmailsArr = usersAny
        .map((u) => ({ role: pickRole(u), email: pickEmail(u) }))
        .filter((x) => isAdminLike(x.role))
        .map((x) => x.email)
        .filter(Boolean)

      const adminEmails = Array.from(new Set(adminEmailsArr)).join(" ")

      const paymentTypeNormalized = normalizePaymentType(item.paymentType as any)
      const searchIndex = `${String(item.name ?? "").trim().toLowerCase()} ${adminEmails}`.trim()

      return {
        ...item,
        adminEmails,
        searchIndex,
        paymentTypeNormalized,
        paymentTypeLabel: mapPaymentTypeLabel(paymentTypeNormalized),
      }
    })
  }, [companyList])

  const toNumSafe = (v: any) => {
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }

  const floorInt = (n: number) => (n >= 0 ? Math.floor(n) : Math.ceil(n))

  const buildMoneyOptionsSmart = (maxValue: number) => {
    const max = Math.max(0, floorInt(maxValue))
    if (max <= 0) return ["1"]

    const opts = new Set<number>()

    for (let i = 1; i <= Math.min(100, max); i++) opts.add(i)
    for (let i = 100; i <= Math.min(1000, max); i += 50) opts.add(i)
    for (let i = 1000; i <= Math.min(10000, max); i += 250) opts.add(i)
    for (let i = 10000; i <= Math.min(100000, max); i += 1000) opts.add(i)
    for (let i = 100000; i <= Math.min(1000000, max); i += 10000) opts.add(i)
    for (let i = 1000000; i <= max; i += 100000) opts.add(i)

    opts.add(max)

    return Array.from(opts)
      .filter((n) => n > 0)
      .sort((a, b) => a - b)
      .map(String)
  }

  const balanceOptions = useMemo(() => {
    const toInt = (v: any) => {
      const n = Number(v)
      return Number.isFinite(n) ? Math.trunc(n) : null
    }

    const uniqSorted = (arr: number[]) =>
      Array.from(new Set(arr))
        .sort((a, b) => a - b)
        .map(String)

    const vals: number[] = []
    ;(companyListComputed ?? []).forEach((c: any) => {
      const n = toInt(c?.amount)
      if (n !== null) vals.push(n)
    })

    return uniqSorted(vals)
  }, [companyListComputed])

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
    rows,
    dataByFilter,
    selected,
  } = useDataTable<ICompanyListRow>(headCells, companyListComputed, "searchIndex" as any, {
    showCheckbocHead: true,
    onShow(values) {
      onShowCompany(values[0])
    },
  })

  const getAdminEmails = (row: ICompanyListRow) => {
    const users = Array.isArray(row.users) ? row.users : []

    const emails = users
      .filter((u) => String(u?.type ?? "").trim().toUpperCase() === "ADMIN")
      .map((u) => String(u?.email ?? "").trim().toLowerCase())
      .filter(Boolean)

    return Array.from(new Set(emails))
  }

  const getCompanyBalance = (row: ICompanyListRow) => Number(row.amount ?? 0)

  const rowsForExport = useMemo(() => {
    const base = companyListComputed.map((item, idx) => ({
      ...item,
      id_data_table: idx + 1,
    }))

    let result = base
    if (dataByFilter?.length) result = onFilterDataTable(result, dataByFilter as any)

    const q = (searchText || "").trim().toLowerCase()
    if (q) {
      let fields: any[] = []
      headCells.forEach(({ id }) => fields.push(id))
      fields = [...fields, "adminEmails", "paymentTypeLabel", "paymentTypeNormalized", "amount"]
      result = onSearchDataTable(q, fields as any, result as any, "id_data_table")
    }

    return result as any as ICompanyListRow[]
  }, [companyListComputed, dataByFilter, searchText])

  const handleDownloadPdf = async () => {
    try {
      if (!rowsForExport.length) return
      setIsDownloading(true)

      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" })
      const pageWidth = doc.internal.pageSize.getWidth()

      const marginX = 52
      const safeRight = pageWidth - marginX
      const TOP_TABLE_Y = 110

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
        const topY = 26

        if (logoDataUrl) doc.addImage(logoDataUrl, "PNG", marginX, topY, 110, 34)

        const textX = logoDataUrl ? marginX + 125 : marginX

        doc.setTextColor(0)
        doc.setFont("helvetica", "bold")
        doc.setFontSize(13)
        doc.text("Listado de Empresas", textX, topY + 16)

        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
        doc.text(`Generado: ${new Date().toLocaleString()}`, textX, topY + 34)
        doc.text(`Registros: ${rowsForExport.length}`, textX, topY + 48)

        hr(topY + 64)
      }

      drawHeader()

      const head = [[
        "Nombre",
        "RUT",
        "Direccion",
        "Ciudad",
        "Pais",
        "Tipo de pago",
        "Correos (Admins)",
        "Balance",
        "Fecha creado",
      ]]

      const body = rowsForExport.map((row) => {
        const admins = getAdminEmails(row).join("\n") || "No hay admin/s en la empresa"
        const balance = formatMoneySmart(getCompanyBalance(row), { hideZero: true })
        const paymentType = row.paymentTypeLabel ?? mapPaymentTypeLabel(row.paymentType as any)

        return [
          String(row.name ?? "-"),
          row.rut == null ? "-" : String(row.rut),
          String(row.address ?? "-"),
          String(row.city ?? "-"),
          String(row.country ?? "-"),
          paymentType,
          admins,
          balance,
          formatterDateDDMMYYYY(row.created_at),
        ]
      })

      const tableWidth = pageWidth - marginX * 2

      const W_RUT = 60
      const W_CIUDAD = 60
      const W_PAIS = 60
      const W_TIPO = 60
      const W_BALANCE = 60
      const W_FC = 60
      const W_ADMINS = 140
      const W_DIRECCION = 120

      const fixedSum =
        W_RUT +
        W_CIUDAD +
        W_PAIS +
        W_TIPO +
        W_BALANCE +
        W_FC +
        W_ADMINS +
        W_DIRECCION

      const W_NOMBRE = Math.max(110, tableWidth - fixedSum)

      autoTable(doc, {
        head,
        body,
        startY: TOP_TABLE_Y,
        margin: { left: marginX, right: marginX, top: TOP_TABLE_Y },
        tableWidth,
        theme: "grid",
        styles: {
          fontSize: 7.6,
          cellPadding: 4,
          overflow: "linebreak",
          valign: "middle",
        },
        headStyles: {
          fontStyle: "bold",
          fillColor: [28, 54, 128],
          textColor: 255,
        },
        alternateRowStyles: { fillColor: [245, 247, 252] },
        columnStyles: {
          0: { cellWidth: W_NOMBRE },
          1: { cellWidth: W_RUT, halign: "right" },
          2: { cellWidth: W_DIRECCION },
          3: { cellWidth: W_CIUDAD },
          4: { cellWidth: W_PAIS },
          5: { cellWidth: W_TIPO },
          6: { cellWidth: W_ADMINS },
          7: { cellWidth: W_BALANCE, halign: "right" },
          8: { cellWidth: W_FC, halign: "right" },
        },
        pageBreak: "auto",
        rowPageBreak: "avoid",
        didDrawPage: () => drawHeader(),
      })

      doc.save(`empresas-resumen-${new Date().toISOString().slice(0, 10)}.pdf`)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSearch = (value: unknown) => {
    const v = typeof value === "string" ? value : String((value as any)?.target?.value ?? "")
    const v2 = v.trim().toLowerCase()
    setSearchText(v2)
    onSearch(v2)
  }

  const renderAdminsCell = (row: ICompanyListRow) => {
    const raw = String(row.adminEmails ?? "").trim()
    const emails = raw ? raw.split(/\s+/).filter(Boolean) : []

    const expanded = Boolean(expandedAdminsByCompany[row.id])

    if (!emails.length) {
      return (
        <Typography
          variant="body2"
          sx={{
            whiteSpace: "normal",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
            color: "text.secondary",
            fontStyle: "italic",
          }}
        >
          No existe admin/s en esta empresa
        </Typography>
      )
    }

    if (emails.length <= 2) {
      return (
        <Typography
          variant="body2"
          sx={{
            whiteSpace: "normal",
            wordBreak: "break-word",
            overflowWrap: "anywhere",
          }}
        >
          {emails.join(", ")}
        </Typography>
      )
    }

    const picked = emails[0]
    const restCount = emails.length - 1

    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          width: "100%",
          minWidth: 0,
        }}
      >
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {picked}
        </Typography>

        <Tooltip title={expanded ? "Ocultar correos" : `Ver ${emails.length} correos`}>
          <IconButton
            size="small"
            onClick={toggleAdminsExpanded(row.id)}
            onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            sx={{
              p: 0.25,
              borderRadius: 999,
              flexShrink: 0,
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
              },
            }}
          >
            {expanded ? <ArrowDropUpIcon fontSize="small" /> : <ArrowDropDownIcon fontSize="small" />}
          </IconButton>
        </Tooltip>

        <Chip
          label={`+${restCount} mas`}
          size="small"
          sx={{
            height: 20,
            fontSize: "0.7rem",
            fontWeight: 600,
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
            color: "primary.main",
            cursor: "help",
          }}
        />
      </Box>
    )
  }

  const COLSPAN = headCells.length + 1

  const companiesOptions = useMemo(() => {
    const list = companyListComputed
      .map((c) => ({ id: String(c.id), name: String(c.name ?? "-") }))
      .filter((x) => x.id && x.name)

    list.sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [companyListComputed])

  const activeFilterChips = useMemo(() => {
    const chips: { key: keyof IDataCompanyByFilter; label: string }[] = []

    if (filterCompany.companyId !== initFilterCompany.companyId) {
      const label = companiesOptions.find((c) => c.id === filterCompany.companyId)?.name ?? filterCompany.companyId
      chips.push({ key: "companyId", label: `Empresa: ${label}` })
    }
    if (filterCompany.created_at !== initFilterCompany.created_at)
      chips.push({ key: "created_at", label: `Fecha creado: ${filterCompany.created_at}` })
    if (filterCompany.updated_at !== initFilterCompany.updated_at)
      chips.push({ key: "updated_at", label: `Fecha actualizado: ${filterCompany.updated_at}` })
    if (filterCompany.paymentType !== initFilterCompany.paymentType)
      chips.push({ key: "paymentType", label: `Tipo pago: ${filterCompany.paymentType}` })
    if (filterCompany.balanceMin !== initFilterCompany.balanceMin)
      chips.push({ key: "balanceMin", label: `Balance: ${filterCompany.balanceMin}` })

    return chips
  }, [filterCompany, companiesOptions])

  const handleReset = () => {
    setFilterCompany(initFilterCompany)
    setSearchText("")

    onSetFilter("created_at" as any, "date-from", "")
    onSetFilter("created_at" as any, "date-to", "")
    onSetFilter("updated_at" as any, "date-from", "")
    onSetFilter("updated_at" as any, "date-to", "")
    onSetFilter("id" as any, "=", "")
    onSetFilter("paymentTypeNormalized" as any, "=", "")
    onSetFilter("amount" as any, ">=", "" as any)

    onApplyFilter([], true)
  }

  const handleFilterChange = (field: keyof IDataCompanyByFilter, value: any) => {
    if (field === "companyId") {
      const newFilter = [
        ...dataByFilter.filter(f => !(f.field === "id" && f.action === "=")),
        ...(value ? [{ field: "id", action: "=", value }] : [])
      ]
      onSetFilter("id" as any, "=", value || "")
      onApplyFilter(newFilter as any)
      setFilterCompany(prev => ({ ...prev, companyId: value }))
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
      setFilterCompany(prev => ({ ...prev, created_at: value }))
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
      setFilterCompany(prev => ({ ...prev, updated_at: value }))
      return
    }

    if (field === "balanceMin") {
      const num = value ? Number(value) : null
      const numVal = num !== null && Number.isFinite(num) ? num : null
      const newFilter = [
        ...dataByFilter.filter(f => f.field !== "amount"),
        ...(numVal !== null ? [{ field: "amount", action: ">=", value: numVal }] : [])
      ]
      onSetFilter("amount" as any, ">=", "" as any)
      if (numVal !== null) onSetFilter("amount" as any, ">=", numVal as any)
      onApplyFilter(newFilter as any)
      setFilterCompany(prev => ({ ...prev, balanceMin: value }))
      return
    }

    if (field === "paymentType") {
      const normalizedValue = value === "all" ? "" : value
      const newFilter = [
        ...dataByFilter.filter(f => !(f.field === "paymentTypeNormalized" && f.action === "=")),
        ...(normalizedValue ? [{ field: "paymentTypeNormalized", action: "=", value: normalizedValue }] : [])
      ]
      onSetFilter("paymentTypeNormalized" as any, "=", normalizedValue)
      onApplyFilter(newFilter as any)
      setFilterCompany(prev => ({ ...prev, paymentType: value as any }))
      return
    }
  }

  const removeFilter = (key: keyof IDataCompanyByFilter) => {
    handleFilterChange(key, initFilterCompany[key])
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
                <BusinessIcon sx={{ color: "white", fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
                  Listado de Empresas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {companyListComputed.length} empresas registradas
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
              <FilterCompanyDataTable
                companyFilter={filterCompany}
                companiesOptions={companiesOptions}
                balanceOptions={balanceOptions}
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
            searchPlaceholder="Buscar por nombre, correos (admins), balance..."
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
            <TipsAndUpdatesIcon sx={{ fontSize: 18, color: "info.main" }} />
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
                "& td, & th": {
                  verticalAlign: "middle",
                  textAlign: "left !important",
                  overflow: "hidden",
                },
                "& th": {
                  textAlign: "left !important",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: "0.05em",
                  color: "text.secondary",
                  backgroundColor: (theme: any) => alpha(theme.palette.background.default, 0.6),
                },
                "& th.MuiTableCell-paddingCheckbox, & td.MuiTableCell-paddingCheckbox": {
                  width: 120,
                  maxWidth: 120,
                  minWidth: 120,
                  paddingRight: "8px",
                },
                "& td.MuiTableCell-paddingCheckbox": {
                  paddingLeft: "12px",
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
            {rows.map((row, idx) => {
              const labelId = `enhanced-table-checkbox-${idx}`
              const emails = String(row.adminEmails ?? "")
                .trim()
                .split(/\s+/)
                .filter(Boolean)
              const expanded = Boolean(expandedAdminsByCompany[row.id])
              const shouldExpandRow = emails.length > 2

              const checked = isSelectedItem(row.id_data_table)

              return (
                <React.Fragment key={row.id_data_table}>
                  <ListItemTable
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
                          gap: 0.5,
                        }}
                      >
                        <Tooltip title="Editar">
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

                        <Tooltip title="Eliminar">
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

                    <ItemDataTable component="th" align="left" id={labelId} scope="row" sx={{ width: 220 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                            color: "primary.main",
                            flexShrink: 0,
                          }}
                        >
                          <BusinessIcon sx={{ fontSize: 18 }} />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {row.name}
                        </Typography>
                      </Box>
                    </ItemDataTable>

                    <ItemDataTable
                      align="left"
                      sx={{
                        width: 320,
                        maxWidth: 320,
                        overflow: "hidden",
                      }}
                    >
                      {renderAdminsCell(row)}
                    </ItemDataTable>

                    <ItemDataTable align="left" sx={{ width: 120, whiteSpace: "nowrap" }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: getCompanyBalance(row) > 0 ? "success.main" : "text.secondary",
                        }}
                      >
                        {formatMoneySmart(getCompanyBalance(row), { hideZero: true })}
                      </Typography>
                    </ItemDataTable>

                    <ItemDataTable align="left" sx={{ width: 120, whiteSpace: "nowrap" }}>
                      <Chip
                        label={row.paymentTypeLabel ?? mapPaymentTypeLabel(row.paymentType as any)}
                        size="small"
                        color={getPaymentTypeColor(row.paymentTypeNormalized) as any}
                        sx={{
                          fontWeight: 500,
                          fontSize: "0.75rem",
                        }}
                      />
                    </ItemDataTable>

                    <ItemDataTable align="left" sx={{ width: 130, whiteSpace: "nowrap" }}>
                      <Typography variant="body2" color="text.secondary">
                        {formatterDateDDMMYYYY(row.created_at)}
                      </Typography>
                    </ItemDataTable>

                    <ItemDataTable align="left" sx={{ width: 130, whiteSpace: "nowrap" }}>
                      <Typography variant="body2" color="text.secondary">
                        {formatterDateDDMMYYYY(row.updated_at)}
                      </Typography>
                    </ItemDataTable>
                  </ListItemTable>

                  {shouldExpandRow && (
                    <tr onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                      <ItemDataTable
                        colSpan={COLSPAN as any}
                        sx={{
                          p: 0,
                          borderTop: "0 !important",
                          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.02),
                        }}
                      >
                        <Collapse in={expanded} timeout={180} unmountOnExit>
                          <Box sx={{ px: 3, py: 2 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 700,
                                letterSpacing: "0.05em",
                                textTransform: "uppercase",
                                color: "primary.main",
                              }}
                            >
                              Correos ADMIN
                            </Typography>

                            <Divider sx={{ my: 1.5 }} />

                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                              {emails.map((email) => (
                                <Chip
                                  key={email}
                                  label={email}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 1.5,
                                    fontWeight: 500,
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </Collapse>
                      </ItemDataTable>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </DataTable>
        </PaperDataTable>
      </Box>
    </Fade>
  )
}

const headCells: DataTableHeadCellProps<ICompanyListRow>[] = [
  { id: "name", numeric: false, disablePadding: false, label: "Nombre" },
  { id: "adminEmails" as any, numeric: false, disablePadding: false, label: "Correo (Admins)" },
  { id: "amount" as any, numeric: true, disablePadding: false, label: "Balance" },
  { id: "paymentTypeLabel" as any, numeric: false, disablePadding: false, label: "Tipo de pago" },
  { id: "created_at", numeric: true, disablePadding: false, label: "Fecha creado" },
  { id: "updated_at", numeric: true, disablePadding: false, label: "Fecha actualizado" },
]
