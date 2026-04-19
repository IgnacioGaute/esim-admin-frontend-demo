import React, { useMemo, useState } from "react"
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Drawer,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  alpha,
  Fade,
} from "@mui/material"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined"
import SyncOutlinedIcon from "@mui/icons-material/SyncOutlined"
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined"
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined"
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined"
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined"
import FilterListOffOutlinedIcon from "@mui/icons-material/FilterListOffOutlined"
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined"
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined"

import { TipsAndUpdates } from "@mui/icons-material"

import { useDataTable } from "@/shared/hooks/useDataTable"
import { DataTableHeadCellProps } from "@/shared/interfaces/hooks/use-data-table.interface"
import { DataTable, DataTableToolbar, PaperDataTable } from "@/shared/components/data-table"
import {
  ICountryData,
  IUpdateCountryAvailabilityDto,
} from "@/admin/utils/interfaces/countries.interface"
import {
  FilterCountriesDataTable,
  IDataCountryByFilter,
} from "./FilterCountriesDataTable"

interface Props {
  countriesList: ICountryData[]
  loading?: boolean
  onUpdate: (iso: string, dto: IUpdateCountryAvailabilityDto) => Promise<void>
  onSync?: () => Promise<void>
}

const headCells: DataTableHeadCellProps<any>[] = [
  { id: "iso", numeric: false, disablePadding: false, label: "ISO" },
  { id: "name", numeric: false, disablePadding: false, label: "País" },
  { id: "region", numeric: false, disablePadding: false, label: "Región" },
  { id: "enabled", numeric: false, disablePadding: false, label: "Estado" },
  { id: "inheritedFrom", numeric: false, disablePadding: false, label: "Origen" },
  { id: "internalComment" as any, numeric: false, disablePadding: false, label: "Comentario interno" },
  { id: "updatedAtLabel" as any, numeric: false, disablePadding: false, label: "Actualizado" },
  { id: "actions" as any, numeric: false, disablePadding: false, label: "Acciones" },
]

const initFilter: IDataCountryByFilter = {
  enabled: "all",
  updatedBy: "",
}

const modernButtonSx = {
  borderRadius: 2,
  textTransform: "none" as const,
  fontWeight: 600,
  px: 2,
  py: 0.9,
  boxShadow: "none",
  "&:hover": { boxShadow: "none" },
}

const formatDate = (value?: string | Date | null) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const statusChipSx = {
  active: {
    background: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
    color: "#1B5E20",
    fontWeight: 700,
    border: "none",
    boxShadow: "0 2px 8px rgba(46,125,50,0.15)",
    minWidth: 76,
    borderRadius: 2,
    fontSize: "0.75rem",
  },
  inactive: {
    background: "linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)",
    color: "#B71C1C",
    fontWeight: 700,
    border: "none",
    boxShadow: "0 2px 8px rgba(211,47,47,0.15)",
    minWidth: 76,
    borderRadius: 2,
    fontSize: "0.75rem",
  },
}

export const ListCountriesDataTable = ({
  countriesList,
  loading,
  onUpdate,
  onSync,
}: Props) => {
  const [syncLoading, setSyncLoading] = useState(false)
  const [rowUpdating, setRowUpdating] = useState<string | null>(null)

  const [editCountry, setEditCountry] = useState<ICountryData | null>(null)
  const [editEnabled, setEditEnabled] = useState(true)
  const [editMessage, setEditMessage] = useState("")
  const [editComment, setEditComment] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)

  const [filter, setFilter] = useState<IDataCountryByFilter>(initFilter)
  const [search, setSearch] = useState("")
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  const countriesComputed = useMemo(() => {
    return [...(countriesList ?? [])]
      .sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")))
      .map((c, idx) => ({
        ...c,
        id_data_table: idx + 1,
        enabledLabel: c.enabled ? "true" : "false",
        updatedByLabel: String(c.updatedBy ?? "").trim(),
        updatedAtLabel: formatDate(c.updatedAt),
        inheritedFromLabel:
          c.inheritedFrom === "REGION"
            ? "Región"
            : c.inheritedFrom === "COUNTRY"
            ? "Manual"
            : "Default",
      }))
  }, [countriesList])

  const updatedByOptions = useMemo(() => {
    return Array.from(
      new Set(countriesComputed.map((c) => c.updatedByLabel).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b))
  }, [countriesComputed])

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
    onSearch,
  } = useDataTable<any>(headCells, countriesComputed, "name", {})

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onSearch(value)
  }

  const openEdit = (country: ICountryData) => {
    setEditCountry(country)
    setEditEnabled(country.enabled)
    setEditMessage(country.unavailableMessage ?? "")
    setEditComment(country.internalComment ?? "")
  }

  const closeEdit = () => setEditCountry(null)

  const handleSave = async () => {
    if (!editCountry) return

    try {
      setSavingEdit(true)
      await onUpdate(editCountry.iso, {
        enabled: editEnabled,
        unavailableMessage: editMessage || undefined,
        internalComment: editComment || undefined,
      })
      closeEdit()
    } finally {
      setSavingEdit(false)
    }
  }

  const handleQuickToggle = async (country: ICountryData, enabled: boolean) => {
    try {
      setRowUpdating(country.iso)
      await onUpdate(country.iso, {
        enabled,
        unavailableMessage: country.unavailableMessage || undefined,
        internalComment: country.internalComment || undefined,
      })
    } finally {
      setRowUpdating(null)
    }
  }

  const handleSync = async () => {
    if (!onSync) return
    try {
      setSyncLoading(true)
      await onSync()
    } finally {
      setSyncLoading(false)
    }
  }

  const handleFilterChange = (key: keyof IDataCountryByFilter, value: any) => {
    if (key === "enabled") {
      const filterVal = value === "all" ? "" : value
      const newFilter = [
        ...dataByFilter.filter((f) => !(f.field === "enabledLabel" && f.action === "=")),
        ...(filterVal
          ? [{ field: "enabledLabel" as any, action: "=" as const, value: filterVal }]
          : []),
      ]
      onSetFilter("enabledLabel" as any, "=", filterVal)
      onApplyFilter(newFilter)
      setFilter((prev) => ({ ...prev, enabled: value }))
      return
    }

    if (key === "updatedBy") {
      const v = value || ""
      const newFilter = [
        ...dataByFilter.filter((f) => !(f.field === "updatedByLabel" && f.action === "=")),
        ...(v
          ? [{ field: "updatedByLabel" as any, action: "=" as const, value: v }]
          : []),
      ]
      onSetFilter("updatedByLabel" as any, "=", v)
      onApplyFilter(newFilter)
      setFilter((prev) => ({ ...prev, updatedBy: v }))
      return
    }
  }

  const handleReset = () => {
    setFilter(initFilter)
    onSetFilter("enabledLabel" as any, "=", "")
    onSetFilter("updatedByLabel" as any, "=", "")
    onApplyFilter([], true)
  }

  const removeFilter = (key: keyof IDataCountryByFilter) =>
    handleFilterChange(key, initFilter[key])

  const activeFilterChips = useMemo(() => {
    const chips: { key: keyof IDataCountryByFilter; label: string }[] = []

    if (filter.enabled !== "all") {
      chips.push({
        key: "enabled",
        label: `Estado: ${filter.enabled === "true" ? "Activo" : "Inactivo"}`,
      })
    }

    if (filter.updatedBy !== "") {
      chips.push({
        key: "updatedBy",
        label: `Actualizado por: ${filter.updatedBy}`,
      })
    }

    return chips
  }, [filter])

  return (
    <Fade in timeout={400}>
      <Box>
        <PaperDataTable>
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
              backgroundColor: "background.paper",
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PublicOutlinedIcon sx={{ color: "primary.main", fontSize: 22 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Países disponibles
              </Typography>
              <Chip
                label={`${countriesList.length} registros`}
                size="small"
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                }}
              />
            </Box>

            {onSync && (
              <Button
                variant="outlined"
                startIcon={<SyncOutlinedIcon />}
                disabled={syncLoading}
                onClick={handleSync}
                sx={{ ...modernButtonSx }}
              >
                {syncLoading ? "Sincronizando..." : "Sincronizar países y regiones"}
              </Button>
            )}
          </Box>

          <Box
            sx={{
              px: 3,
              pt: 2.5,
              pb: 1.5,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <TextField
              sx={{ width: { xs: "100%", md: "34%" }, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              size="small"
              placeholder="Buscar por nombre o ISO..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchOutlinedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => handleSearchChange("")}>
                      <ClearOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              }}
            />
          </Box>

          <DataTableToolbar numSelected={selected.length} showSearch />

          <Box
            sx={{
              px: 3,
              py: 1.25,
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              borderBottom: "1px solid",
              borderColor: "divider",
              minHeight: 52,
              bgcolor:
                activeFilterChips.length > 0
                  ? (theme) => alpha(theme.palette.primary.main, 0.02)
                  : "background.paper",
            }}
          >
            <Button
              size="small"
              variant={activeFilterChips.length > 0 ? "contained" : "outlined"}
              startIcon={<TuneOutlinedIcon sx={{ fontSize: "16px !important" }} />}
              onClick={() => setFilterDrawerOpen(true)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.8rem",
                px: 1.5,
                py: 0.6,
                boxShadow: "none",
                "&:hover": { boxShadow: "none" },
                flexShrink: 0,
              }}
            >
              Filtros{activeFilterChips.length > 0 ? ` (${activeFilterChips.length})` : ""}
            </Button>

            {activeFilterChips.map((chip) => (
              <Chip
                key={chip.key}
                label={chip.label}
                size="small"
                onDelete={() => removeFilter(chip.key)}
                sx={{
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  height: 26,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  color: "primary.main",
                  border: "1px solid",
                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                }}
              />
            ))}

            {activeFilterChips.length > 0 && (
              <Button
                size="small"
                startIcon={<FilterListOffOutlinedIcon sx={{ fontSize: "16px !important" }} />}
                onClick={handleReset}
                sx={{
                  textTransform: "none",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "text.secondary",
                  borderRadius: 2,
                  px: 1,
                  "&:hover": {
                    color: "error.main",
                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.06),
                  },
                }}
              >
                Limpiar todo
              </Button>
            )}
          </Box>

          <Drawer
            anchor="right"
            open={filterDrawerOpen}
            onClose={() => setFilterDrawerOpen(false)}
            PaperProps={{
              sx: {
                width: { xs: "100vw", sm: 440 },
                borderRadius: { xs: "20px 20px 0 0", sm: "20px 0 0 20px" },
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                height: "auto",
                maxHeight: "82vh",
                my: "auto",
                top: 0,
                bottom: 0,
                margin: "auto 0",
              },
            }}
          >
            <Box
              sx={{
                px: 3,
                py: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <TuneOutlinedIcon sx={{ color: "white", fontSize: 22 }} />
                <Box>
                  <Typography variant="h6" sx={{ color: "white", fontWeight: 700, lineHeight: 1.2 }}>
                    Filtros
                  </Typography>
                  {activeFilterChips.length > 0 && (
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)" }}>
                      {activeFilterChips.length} filtro{activeFilterChips.length > 1 ? "s" : ""} activo
                      {activeFilterChips.length > 1 ? "s" : ""}
                    </Typography>
                  )}
                </Box>
              </Stack>

              <IconButton
                onClick={() => setFilterDrawerOpen(false)}
                sx={{
                  color: "white",
                  bgcolor: "rgba(255,255,255,0.12)",
                  borderRadius: 2,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.22)" },
                }}
                size="small"
              >
                <CloseOutlinedIcon fontSize="small" />
              </IconButton>
            </Box>

            {activeFilterChips.length > 0 && (
              <Box
                sx={{
                  px: 3,
                  py: 1.5,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 0.75,
                }}
              >
                {activeFilterChips.map((chip) => (
                  <Chip
                    key={chip.key}
                    label={chip.label}
                    size="small"
                    onDelete={() => removeFilter(chip.key)}
                    sx={{
                      borderRadius: "8px",
                      fontWeight: 600,
                      fontSize: "0.72rem",
                      height: 24,
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                      color: "primary.main",
                    }}
                  />
                ))}
              </Box>
            )}

            <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 2.5 }}>
              <FilterCountriesDataTable
                filter={filter}
                updatedByOptions={updatedByOptions}
                onChange={handleFilterChange}
              />
            </Box>

            <Divider />

            <Box sx={{ px: 3, py: 2, display: "flex", gap: 1.5, flexShrink: 0 }}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleReset}
                disabled={activeFilterChips.length === 0}
                startIcon={<FilterListOffOutlinedIcon />}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
              >
                Limpiar filtros
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={() => setFilterDrawerOpen(false)}
                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, boxShadow: "none" }}
              >
                Listo
              </Button>
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
              Tip: puedes ordenar los datos haciendo click en las flechas de cada columna y cambiar el estado rápido desde la tabla.
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
                "& th, & td": { textAlign: "left !important", verticalAlign: "middle" },
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
            {rows.map((row: any, idx: number) => (
              <ListItemTable key={row.iso ?? row.id_data_table} id_data_table={row.id_data_table}>
                <ItemDataTable component="th" id={`country-row-${idx}`} scope="row">
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "monospace" }}>
                    {row.iso}
                  </Typography>
                </ItemDataTable>

                <ItemDataTable align="left">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {row.name}
                  </Typography>
                </ItemDataTable>

                <ItemDataTable align="left">
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.82rem" }}>
                    {row.region || "—"}
                  </Typography>
                </ItemDataTable>

                <ItemDataTable align="left">
                  <Chip
                    label={row.enabled ? "Activo" : "Inactivo"}
                    size="small"
                    sx={row.enabled ? statusChipSx.active : statusChipSx.inactive}
                  />
                </ItemDataTable>

                <ItemDataTable align="left">
                  {row.inheritedFrom === "REGION" ? (
                    <Tooltip
                      title={
                        row.inheritedByRegionApplyMode === "ALL_COUNTRIES"
                          ? "Heredado desde la región en modo: todos los países"
                          : row.inheritedByRegionApplyMode === "CUSTOM"
                          ? "Heredado desde la región en modo: custom"
                          : "Heredado desde la región"
                      }
                      arrow
                    >
                      <Chip
                        size="small"
                        icon={<AccountTreeOutlinedIcon />}
                        label={
                          row.inheritedByRegionApplyMode === "CUSTOM"
                            ? "Región / Custom"
                            : row.inheritedByRegionApplyMode === "ALL_COUNTRIES"
                            ? "Región / Todos"
                            : "Región"
                        }
                        sx={{
                          borderRadius: 2,
                          fontWeight: 700,
                          fontSize: "0.72rem",
                          bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                          color: "warning.dark",
                        }}
                      />
                    </Tooltip>
                  ) : row.inheritedFrom === "COUNTRY" ? (
                    <Chip
                      size="small"
                      label="Manual"
                      sx={{
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: "0.72rem",
                        bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                        color: "success.dark",
                      }}
                    />
                  ) : (
                    <Chip
                      size="small"
                      label="Default"
                      sx={{
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: "0.72rem",
                        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.12),
                        color: "text.secondary",
                      }}
                    />
                  )}
                </ItemDataTable>

                <ItemDataTable
                  align="left"
                  sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  <Tooltip title={row.internalComment || ""} arrow>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: "0.8rem",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        maxWidth: 180,
                      }}
                    >
                      {row.internalComment || "—"}
                    </Typography>
                  </Tooltip>
                </ItemDataTable>

                <ItemDataTable align="left">
                  <Stack spacing={0.25}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                      {row.updatedByLabel || "—"}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {row.updatedAtLabel}
                    </Typography>
                  </Stack>
                </ItemDataTable>

                <ItemDataTable align="center">
                  <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                    <Tooltip title={row.enabled ? "Desactivar país" : "Activar país"} arrow>
                      <span>
                        <Switch
                          size="small"
                          checked={Boolean(row.enabled)}
                          disabled={rowUpdating === row.iso}
                          onChange={(e) => handleQuickToggle(row as ICountryData, e.target.checked)}
                          color={row.enabled ? "success" : "error"}
                        />
                      </span>
                    </Tooltip>

                    <Tooltip title="Editar disponibilidad" arrow>
                      <IconButton
                        size="small"
                        onClick={() => openEdit(row as ICountryData)}
                        sx={{
                          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                          color: "primary.main",
                          borderRadius: 2,
                          "&:hover": { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.14) },
                        }}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </ItemDataTable>
              </ListItemTable>
            ))}
          </DataTable>
        </PaperDataTable>

        <Dialog
          open={Boolean(editCountry)}
          onClose={closeEdit}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <Box
            sx={{
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              px: 3,
              py: 2.5,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <PublicOutlinedIcon sx={{ color: "white", fontSize: 26 }} />
            <Box>
              <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
                Editar disponibilidad del país
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                {editCountry?.name} ({editCountry?.iso})
              </Typography>
            </Box>
          </Box>

          <DialogContent sx={{ pt: 3, pb: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>
            {!!editCountry && (
              <Box
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 1.5,
                  bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Chip size="small" label={`Región: ${editCountry.region || "—"}`} />
                  {editCountry.inheritedFrom === "REGION" ? (
                    <Chip size="small" icon={<AccountTreeOutlinedIcon />} label="Heredado desde región" />
                  ) : editCountry.inheritedFrom === "COUNTRY" ? (
                    <Chip size="small" label="Configuración manual" />
                  ) : (
                    <Chip size="small" label="Configuración default" />
                  )}
                </Stack>
              </Box>
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={editEnabled}
                  onChange={(e) => setEditEnabled(e.target.checked)}
                  color="success"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {editEnabled ? "País activo" : "País inactivo"}
                </Typography>
              }
            />

            {!editEnabled && (
              <Box
                sx={{
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  p: 1.5,
                  bgcolor: (theme) => alpha(theme.palette.error.main, 0.04),
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Qué verá el usuario
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Si este país queda inactivo, la vista en la web publica de este pais se visualizara como desactivada.
                </Typography>
              </Box>
            )}

            <TextField
              label="Comentario interno"
              placeholder="Nota interna sobre el estado de este país."
              fullWidth
              size="small"
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              multiline
              minRows={2}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
            <Button onClick={closeEdit} variant="outlined" sx={{ ...modernButtonSx }}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              variant="contained"
              disabled={savingEdit}
              sx={{
                ...modernButtonSx,
                bgcolor: editEnabled ? "#2e7d32" : "#d32f2f",
                boxShadow: `0 4px 14px ${alpha(editEnabled ? "#2e7d32" : "#d32f2f", 0.35)}`,
                "&:hover": { bgcolor: editEnabled ? "#1b5e20" : "#c62828" },
              }}
            >
              {savingEdit ? "Guardando..." : "Guardar"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  )
}