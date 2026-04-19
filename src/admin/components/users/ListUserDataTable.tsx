import React, { useMemo, useState } from "react"
import { Box, Button, IconButton, Tooltip, Typography, Chip, Fade, alpha, Drawer, Stack, Divider } from "@mui/material"
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined"
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined"
import FilterListOffOutlinedIcon from "@mui/icons-material/FilterListOffOutlined"
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"
import { RuleSharp, DiscountOutlined, Edit, DeleteOutline, Person, TipsAndUpdates } from "@mui/icons-material"

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

import logo2x from "@/assets/images/logo/esim-logo.svg"

import { useDataTable } from "@/shared/hooks/useDataTable"
import { USER_TYPE_CONST } from "@/shared/helpers/const/UserTypeConst"
import { DataTable, DataTableToolbar, PaperDataTable } from "@/shared/components/data-table"
import { DataTableHeadCellProps } from "@/shared/interfaces/hooks/use-data-table.interface"
import { formatterDateDDMMYYYY } from "@/shared/helpers/handligDateHelper"
import { FilterUserDataTable, IDataUserByFilter } from "./FilterUserDataTable"

import { onFilterDataTable, onSearchDataTable } from "@/shared/helpers/hooks/useDataTableHelper"

import { IUserData } from "@/admin/utils/interfaces/user-data.interface"

type Role = "SUPER_ADMIN" | "ADMIN" | "SELLER"

interface CurrentUser {
  id: string
  type: Role
  companyId?: string | null
}

interface Props {
  userList: IUserData[]
  currentUser?: CurrentUser | null
  onShowUser: (user: IUserData) => void
  onEdit: (userId: string) => void
  onDelete: (userId: string) => void
  loading?: boolean
  onRuleUser?: (idReseller: string, name: string) => void
  onCodeReferral?: (userId: string, name: string) => void
}

const initUserFilter: IDataUserByFilter = {
  name: "",
  type: "all",
  companyId: "",
  companyName: "",
  created_at: "",
}

const getCompanyIdFromUser = (u: any): string | null => {
  return u?.companyId ?? u?.company?.id ?? null
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

    if (logoDataUrl) {
      doc.addImage(logoDataUrl, "PNG", marginX, topY, 110, 34)
    }

    const textX = logoDataUrl ? marginX + 125 : marginX

    doc.setTextColor(0)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(13)
    doc.text("Listado de Usuarios", textX, topY + 16)

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

const getUserTypeColor = (type: string) => {
  switch (type) {
    case "SUPER_ADMIN":
      return "error"
    case "ADMIN":
      return "primary"
    case "SELLER":
      return "success"
    default:
      return "default"
  }
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

export const ListUserDataTable = ({
  userList,
  currentUser,
  loading,
  onShowUser,
  onEdit,
  onDelete,
  onRuleUser,
  onCodeReferral,
}: Props) => {
  if (!currentUser) return null
  if (currentUser.type === "SELLER") return null

  const [filterUser, setFilterUser] = useState<IDataUserByFilter>(initUserFilter)
  const [isDownloading, setIsDownloading] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  const stopRowClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  type UserTypeKey = keyof typeof USER_TYPE_CONST

  const getUserTypeLabel = (type: unknown) => {
    const key = String(type ?? "") as UserTypeKey
    return USER_TYPE_CONST[key] ?? "-"
  }

  const visibleUsers = useMemo(() => {
    if (currentUser.type === "SUPER_ADMIN") return userList

    const myCompanyId = currentUser.companyId ?? null

    return userList.filter((u: any) => {
      const isMe = u?.id === currentUser.id
      const isSuperAdmin = u?.type === "SUPER_ADMIN"

      const uCompanyId = getCompanyIdFromUser(u)
      const sameCompany = Boolean(myCompanyId && uCompanyId && String(uCompanyId) === String(myCompanyId))

      const isAdminOrSeller = u?.type === "ADMIN" || u?.type === "SELLER"

      return isMe || isSuperAdmin || (sameCompany && isAdminOrSeller)
    })
  }, [userList, currentUser])

  const normalizedUsers = useMemo(() => {
    return visibleUsers.map((u: any) => ({
      ...u,
      companyId: getCompanyIdFromUser(u) ?? "",
      companyName:
        u?.companyName ??
        u?.company?.name ??
        u?.company?.businessName ??
        u?.company?.legalName ??
        "No tiene empresa",
    }))
  }, [visibleUsers])

  const nameOptions = useMemo(() => {
    return Array.from(new Set((normalizedUsers as any[]).map((u) => String(u?.name ?? "").trim()).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b))
  }, [normalizedUsers])

  const companyOptions = useMemo(() => {
    const map = new Map<string, string>()
    ;(normalizedUsers as any[]).forEach((u) => {
      const id = String(u?.companyId ?? "").trim()
      const nm = String(u?.companyName ?? "").trim()
      if (id) map.set(id, nm || "Sin nombre")
    })
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [normalizedUsers])

  const {
    ListItemTable,
    ItemDataTable,
    onSearch,
    onSetFilter,
    onApplyFilter,
    pagination,
    DataTableHead,
    rows,
    dataByFilter,
  } = useDataTable<IUserData>(headCells, normalizedUsers as any, "name", {
    showCheckbocHead: false,
    onShow(values) {
      onShowUser(values[0])
    },
  })

  const rowsForExport = useMemo(() => {
    const base = (normalizedUsers as any[]).map((item: any, idx) => ({ ...item, id_data_table: idx + 1 }))
    let result = base

    if (dataByFilter?.length) result = onFilterDataTable(result, dataByFilter as any)

    const q = (searchText || "").trim()
    if (q) {
      let fields: any[] = []
      headCells.forEach(({ id }) => fields.push(id))
      fields = [...fields, "companyId", "companyName", "coupons"]
      result = onSearchDataTable(q, fields as any, result as any, "id_data_table")
    }

    return result as any as IUserData[]
  }, [normalizedUsers, dataByFilter, searchText])

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

      const head = [["Nombre", "Correo", "Tipo", "Compania", "Cupones", "Fecha creado"]]

      const body = rowsForExport.map((row: any) => [
        String(row.name ?? "-"),
        String(row.email ?? "-"),
        String(USER_TYPE_CONST[String(row.type ?? "") as keyof typeof USER_TYPE_CONST] ?? String(row.type ?? "-")),
        String(row.companyName ?? "No tiene empresa"),
        String((row?.coupons && row.coupons.length) || 0),
        formatterDateDDMMYYYY(row.created_at),
      ])

      const tableWidth = pageWidth - marginX * 2

      const W_CUPONES = 80
      const W_FECHA = 120
      const W_TIPO = 120

      const remaining = tableWidth - (W_CUPONES + W_FECHA + W_TIPO)
      const W_NOMBRE = Math.max(120, Math.floor(remaining * 0.28))
      const W_CORREO = Math.max(120, Math.floor(remaining * 0.34))
      const W_COMP = Math.max(120, remaining - (W_NOMBRE + W_CORREO))

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
          0: { cellWidth: W_NOMBRE },
          1: { cellWidth: W_CORREO },
          2: { cellWidth: W_TIPO },
          3: { cellWidth: W_COMP },
          4: { cellWidth: W_CUPONES, halign: "right" },
          5: { cellWidth: W_FECHA, halign: "right" },
        },
        pageBreak: "auto",
        rowPageBreak: "avoid",
        didDrawPage: () => drawHeader(),
      })

      doc.save(`users-resumen-${new Date().toISOString().slice(0, 10)}.pdf`)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSearch = (value: unknown) => {
    const v = typeof value === "string" ? value : String((value as any)?.target?.value ?? "")
    setSearchText(v)
    onSearch(v)
  }

  const activeFilterChips = useMemo(() => {
    const chips: { key: keyof IDataUserByFilter; label: string }[] = []

    if (filterUser.name !== initUserFilter.name)
      chips.push({ key: "name", label: `Nombre: ${filterUser.name}` })
    if (filterUser.companyId !== initUserFilter.companyId) {
      const label = companyOptions.find((c) => c.id === filterUser.companyId)?.name ?? filterUser.companyName
      chips.push({ key: "companyId", label: `Empresa: ${label}` })
    }
    if (filterUser.type !== initUserFilter.type)
      chips.push({ key: "type", label: `Tipo: ${filterUser.type}` })
    if (filterUser.created_at !== initUserFilter.created_at)
      chips.push({ key: "created_at", label: `Fecha: ${filterUser.created_at}` })

    return chips
  }, [filterUser, companyOptions])

  const handleReset = () => {
    setFilterUser(initUserFilter)
    setSearchText("")

    onSetFilter("created_at" as any, "date-from", "")
    onSetFilter("created_at" as any, "date-to", "")
    onSetFilter("type" as any, "=", "")
    onSetFilter("companyId" as any, "=", "")
    onSetFilter("name" as any, "=", "")

    onApplyFilter([], true)
  }

  const handleFilterChange = (field: keyof IDataUserByFilter, value: any) => {
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
      setFilterUser(prev => ({ ...prev, created_at: value }))
      return
    }

    if (field === "name") {
      const v = value || ""
      const newFilter = [
        ...dataByFilter.filter(f => !(f.field === "name" && f.action === "=")),
        ...(v ? [{ field: "name", action: "=", value: v }] : [])
      ]
      onSetFilter("name" as any, "=", v)
      onApplyFilter(newFilter as any)
      setFilterUser(prev => ({ ...prev, name: v }))
      return
    }

    if (field === "companyId") {
      const v = value || ""
      const newFilter = [
        ...dataByFilter.filter(f => !(f.field === "companyId" && f.action === "=")),
        ...(v ? [{ field: "companyId", action: "=", value: v }] : [])
      ]
      onSetFilter("companyId" as any, "=", v)
      onApplyFilter(newFilter as any)
      setFilterUser(prev => ({ ...prev, companyId: v }))
      return
    }

    if (field === "type") {
      const normalizedValue = value === "all" ? "" : value
      const newFilter = [
        ...dataByFilter.filter(f => !(f.field === "type" && f.action === "=")),
        ...(normalizedValue ? [{ field: "type", action: "=", value: normalizedValue }] : [])
      ]
      onSetFilter("type" as any, "=", normalizedValue)
      onApplyFilter(newFilter as any)
      setFilterUser(prev => ({ ...prev, type: value as any }))
      return
    }
  }

  const removeFilter = (key: keyof IDataUserByFilter) => {
    handleFilterChange(key, initUserFilter[key])
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
                <Person sx={{ color: "white", fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
                  Listado de Usuarios
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {normalizedUsers.length} usuarios registrados
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
              <FilterUserDataTable
                userFilter={filterUser}
                nameOptions={nameOptions}
                companyOptions={companyOptions}
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
            numSelected={0}
            onChangeSearch={handleSearch}
            searchPlaceholder="Buscar por nombre, correo, empresa..."
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
            {rows.map((row, idx) => {
              const labelId = `enhanced-table-row-${idx}`

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
                    padding="none"
                    align="center"
                    sx={{
                      width: 90,
                      minWidth: 90,
                      maxWidth: 90,
                      px: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                      <Tooltip title="Editar usuario" placement="top" arrow>
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

                      <Tooltip title="Eliminar usuario" placement="top" arrow>
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

                      {row.type === "SELLER" && onRuleUser && (
                        <Tooltip title="Generar nueva regla para el usuario" placement="top" arrow>
                          <IconButton
                            size="small"
                            sx={{
                              p: 0.5,
                              borderRadius: 1.5,
                              transition: "all 0.2s ease",
                              "&:hover": {
                                backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.1),
                                color: "warning.main",
                              },
                            }}
                            onClick={(e) => {
                              stopRowClick(e)
                              onRuleUser(row.id, row.name)
                            }}
                          >
                            <RuleSharp fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}

                      {row.type === "SELLER" && onCodeReferral && (
                        <Tooltip title="Generar nuevo codigo para el usuario" placement="top" arrow>
                          <IconButton
                            size="small"
                            sx={{
                              p: 0.5,
                              borderRadius: 1.5,
                              transition: "all 0.2s ease",
                              "&:hover": {
                                backgroundColor: (theme) => alpha(theme.palette.success.main, 0.1),
                                color: "success.main",
                              },
                            }}
                            onClick={(e) => {
                              stopRowClick(e)
                              onCodeReferral(row.id, row.name)
                            }}
                          >
                            <DiscountOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </ItemDataTable>

                  <ItemDataTable align="left" component="th" id={labelId} scope="row">
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
                        <Person sx={{ fontSize: 18 }} />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {row.name}
                      </Typography>
                    </Box>
                  </ItemDataTable>

                  <ItemDataTable align="left">
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      {row.email}
                    </Typography>
                  </ItemDataTable>

                  <ItemDataTable align="left">
                    <Chip
                      label={getUserTypeLabel(row.type)}
                      size="small"
                      color={getUserTypeColor(row.type as string) as any}
                      sx={{
                        fontWeight: 500,
                        fontSize: "0.75rem",
                      }}
                    />
                  </ItemDataTable>

                  <ItemDataTable align="left">
                    <Typography variant="body2">{(row as any).companyName}</Typography>
                  </ItemDataTable>

                  <ItemDataTable align="center">
                    <Chip
                      label={((row as any)?.coupons && (row as any).coupons.length) || 0}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontWeight: 600,
                        minWidth: 32,
                      }}
                    />
                  </ItemDataTable>

                  <ItemDataTable align="center" sx={{ whiteSpace: "nowrap" }}>
                    <Typography variant="body2" color="text.secondary">
                      {formatterDateDDMMYYYY(row.created_at)}
                    </Typography>
                  </ItemDataTable>
                </ListItemTable>
              )
            })}
          </DataTable>

          {rows.length === 0 && (
            <Box
              sx={{
                p: 4,
                textAlign: "center",
                borderTop: "1px dashed",
                borderColor: "divider",
              }}
            >
              <Person sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                No hay usuarios para mostrar.
              </Typography>
            </Box>
          )}
        </PaperDataTable>
      </Box>
    </Fade>
  )
}

const headCells: DataTableHeadCellProps<IUserData & { actions?: any }>[] = [
  { id: "actions" as any, numeric: false, disablePadding: true, label: "" as any },
  { id: "name", numeric: false, disablePadding: false, label: "Nombre" as any },
  { id: "email", numeric: false, disablePadding: false, label: "Correo electronico" as any },
  { id: "type", numeric: false, disablePadding: false, label: "Tipo" as any },
  { id: "companyName", numeric: false, disablePadding: false, label: "Empresa" as any },
  { id: "coupons", numeric: true, disablePadding: false, label: "Cupones asociados" as any },
  { id: "created_at", numeric: true, disablePadding: false, label: "Fecha creado" as any },
]
