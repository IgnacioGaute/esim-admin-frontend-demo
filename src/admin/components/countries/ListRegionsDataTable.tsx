import React, { useMemo, useState } from "react"
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  FormControlLabel,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  alpha,
  Fade,
} from "@mui/material"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import MapOutlinedIcon from "@mui/icons-material/MapOutlined"
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined"
import ClearOutlinedIcon from "@mui/icons-material/ClearOutlined"
import TravelExploreOutlinedIcon from "@mui/icons-material/TravelExploreOutlined"

import { TipsAndUpdates } from "@mui/icons-material"

import { useDataTable } from "@/shared/hooks/useDataTable"
import { DataTableHeadCellProps } from "@/shared/interfaces/hooks/use-data-table.interface"
import { DataTable, DataTableToolbar, PaperDataTable } from "@/shared/components/data-table"
import {
  ICountryData,
  IRegionData,
  IUpdateRegionAvailabilityDto,
  TRegionApplyMode,
} from "@/admin/utils/interfaces/countries.interface"
import { FilterCountriesDataTable, IDataCountryByFilter } from "./FilterCountriesDataTable"

interface Props {
  regionsList: IRegionData[]
  countriesList: ICountryData[]
  loading?: boolean
  onUpdate: (code: string, dto: IUpdateRegionAvailabilityDto) => Promise<void>
}

const headCells: DataTableHeadCellProps<any>[] = [
  { id: "code", numeric: false, disablePadding: false, label: "Código" },
  { id: "name", numeric: false, disablePadding: false, label: "Región" },
  { id: "enabled", numeric: false, disablePadding: false, label: "Estado" },
  { id: "applyMode", numeric: false, disablePadding: false, label: "Modo" },
  { id: "countriesCount" as any, numeric: false, disablePadding: false, label: "Países" },
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

const enabledChipSx = {
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

export const ListRegionsDataTable = ({
  regionsList,
  countriesList,
  loading,
  onUpdate,
}: Props) => {
  const [rowUpdating, setRowUpdating] = useState<string | null>(null)

  const [editRegion, setEditRegion] = useState<IRegionData | null>(null)
  const [editEnabled, setEditEnabled] = useState(true)
  const [editComment, setEditComment] = useState("")
  const [editApplyMode, setEditApplyMode] = useState<TRegionApplyMode>("ONLY_REGION")
  const [editCustomCountries, setEditCustomCountries] = useState<string[]>([])
  const [countrySearch, setCountrySearch] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)

  const [filter, setFilter] = useState<IDataCountryByFilter>(initFilter)
  const [search, setSearch] = useState("")

  const regionCountries = (region: IRegionData | null) => {
    if (!region?.countryCodes?.length) return []

    const codes = new Set(
      region.countryCodes.map((iso) => String(iso ?? "").trim().toUpperCase())
    )

    return countriesList.filter((country) =>
      codes.has(String(country.iso ?? "").trim().toUpperCase())
    )
  }

  const regionsComputed = useMemo(() => {
    return [...(regionsList ?? [])]
      .sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")))
      .map((r, idx) => ({
        ...r,
        id_data_table: idx + 1,
        enabledLabel: r.enabled ? "true" : "false",
        updatedByLabel: String(r.updatedBy ?? "").trim(),
        updatedAtLabel: formatDate(r.updatedAt),
        countriesCount: Array.isArray(r.countryCodes) ? r.countryCodes.length : 0,
      }))
  }, [regionsList])

  const updatedByOptions = useMemo(() => {
    return Array.from(
      new Set(regionsComputed.map((r) => r.updatedByLabel).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b))
  }, [regionsComputed])

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
  } = useDataTable<any>(headCells, regionsComputed, "name", {})

  const handleSearchChange = (value: string) => {
    setSearch(value)
    onSearch(value)
  }

  const openEdit = (region: IRegionData) => {
    setEditRegion(region)
    setEditEnabled(region.enabled)
    setEditComment(region.internalComment ?? "")
    setEditApplyMode(region.applyMode ?? "ONLY_REGION")
    setEditCustomCountries(region.countryCodes ?? [])
    setCountrySearch("")
  }

  const closeEdit = () => setEditRegion(null)

  const handleSave = async () => {
    if (!editRegion) return
    try {
      setSavingEdit(true)
      await onUpdate(editRegion.code, {
        enabled: editEnabled,
        internalComment: editComment || undefined,
        ...(!editEnabled && {
          applyMode: editApplyMode,
          ...(editApplyMode === "CUSTOM" && { customCountryCodes: editCustomCountries }),
        }),
      })
      closeEdit()
    } finally {
      setSavingEdit(false)
    }
  }

  const handleQuickToggle = async (region: IRegionData, enabled: boolean) => {
    try {
      setRowUpdating(region.code)
      await onUpdate(region.code, {
        enabled,
        internalComment: region.internalComment || undefined,
        applyMode: enabled ? "ONLY_REGION" : region.applyMode || "ONLY_REGION",
      })
    } finally {
      setRowUpdating(null)
    }
  }

  const handleFilterChange = (key: keyof IDataCountryByFilter, value: any) => {
    setFilter((prev) => {
      if (key === "enabled") {
        onSetFilter("enabledLabel" as any, "=", value === "all" ? "" : value)
      }
      if (key === "updatedBy") {
        onSetFilter("updatedByLabel" as any, "=", value || "")
      }
      return { ...prev, [key]: value }
    })
  }

  const handleResetFilter = () => {
    setFilter(initFilter)
    onSetFilter("enabledLabel" as any, "=", "")
    onSetFilter("updatedByLabel" as any, "=", "")
    onApplyFilter([], true)
  }

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
              <MapOutlinedIcon sx={{ color: "secondary.main", fontSize: 22 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Regiones
              </Typography>
              <Chip
                label={`${regionsList.length} registros`}
                size="small"
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1),
                  color: "secondary.main",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                }}
              />
            </Box>
          </Box>

          <Box sx={{ px: 3, pt: 2.5, pb: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
            <TextField
              sx={{ width: { xs: "100%", md: "34%" }, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
              size="small"
              placeholder="Buscar por nombre o código..."
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

          <DataTableToolbar
            numSelected={selected.length}
            onApplyFilter={() => onApplyFilter(dataByFilter)}
            onResetFilter={handleResetFilter}
            showSearch
            filterChildren={
              <FilterCountriesDataTable
                filter={filter}
                updatedByOptions={updatedByOptions}
                onChange={handleFilterChange}
              />
            }
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
                    backgroundColor: (theme) => alpha(theme.palette.secondary.main, 0.04),
                  },
                },
              },
            }}
          >
            {rows.map((row: any, idx: number) => (
              <ListItemTable key={row.code ?? row.id_data_table} id_data_table={row.id_data_table}>
                <ItemDataTable component="th" id={`region-row-${idx}`} scope="row">
                  <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: "monospace" }}>
                    {row.code}
                  </Typography>
                </ItemDataTable>

                <ItemDataTable align="left">
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {row.name}
                  </Typography>
                </ItemDataTable>

                <ItemDataTable align="left">
                  <Chip
                    label={row.enabled ? "Activo" : "Inactivo"}
                    size="small"
                    sx={row.enabled ? enabledChipSx.active : enabledChipSx.inactive}
                  />
                </ItemDataTable>

                <ItemDataTable align="left">
                  {row.enabled ? (
                    <Chip
                      size="small"
                      label="Sin impacto"
                      sx={{
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: "0.72rem",
                        bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                        color: "success.dark",
                      }}
                    />
                  ) : row.applyMode === "ONLY_REGION" ? (
                    <Chip
                      size="small"
                      label="Solo región"
                      sx={{
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: "0.72rem",
                        bgcolor: (theme) => alpha(theme.palette.info.main, 0.1),
                        color: "info.dark",
                      }}
                    />
                  ) : row.applyMode === "ALL_COUNTRIES" ? (
                    <Chip
                      size="small"
                      label="Todos los países"
                      sx={{
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: "0.72rem",
                        bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                        color: "error.dark",
                      }}
                    />
                  ) : (
                    <Chip
                      size="small"
                      label="Custom"
                      sx={{
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: "0.72rem",
                        bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1),
                        color: "warning.dark",
                      }}
                    />
                  )}
                </ItemDataTable>

                <ItemDataTable align="left">
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      icon={<TravelExploreOutlinedIcon />}
                      label={`${row.countriesCount} países`}
                      sx={{ borderRadius: 2, fontWeight: 700, fontSize: "0.72rem" }}
                    />
                    {!row.enabled && row.applyMode === "ALL_COUNTRIES" && (
                      <Typography variant="caption" color="error.main" sx={{ fontWeight: 700 }}>
                        Todos afectados
                      </Typography>
                    )}
                    {!row.enabled && row.applyMode === "CUSTOM" && (
                      <Typography variant="caption" color="warning.main" sx={{ fontWeight: 700 }}>
                        Revisar overrides
                      </Typography>
                    )}
                  </Stack>
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
                    <Tooltip title={row.enabled ? "Desactivar solo región" : "Activar solo región"} arrow>
                      <span>
                        <Switch
                          size="small"
                          checked={Boolean(row.enabled)}
                          disabled={rowUpdating === row.code}
                          color={row.enabled ? "success" : "error"}
                          onChange={(e) => handleQuickToggle(row as IRegionData, e.target.checked)}
                        />
                      </span>
                    </Tooltip>

                    <Tooltip title="Editar disponibilidad de región" arrow>
                      <IconButton
                        size="small"
                        onClick={() => openEdit(row as IRegionData)}
                        sx={{
                          bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.08),
                          color: "secondary.main",
                          borderRadius: 2,
                          "&:hover": { bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.14) },
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
          open={Boolean(editRegion)}
          onClose={closeEdit}
          fullWidth
          maxWidth="sm"
          PaperProps={{ sx: { borderRadius: 3 } }}
        >
          <Box
            sx={{
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
              px: 3,
              py: 2.5,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <MapOutlinedIcon sx={{ color: "white", fontSize: 26 }} />
            <Box>
              <Typography variant="h6" sx={{ color: "white", fontWeight: 700 }}>
                Editar disponibilidad de la región
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.8)" }}>
                {editRegion?.name} ({editRegion?.code})
              </Typography>
            </Box>
          </Box>

          <DialogContent sx={{ pt: 3, pb: 1, display: "flex", flexDirection: "column", gap: 2.5 }}>
            {!!editRegion && (
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
                  <Chip size="small" label={`${regionCountries(editRegion).length} países asociados`} />
                  <Chip
                    size="small"
                    label={editRegion.enabled ? "Activa" : `Modo actual: ${editRegion.applyMode || "ONLY_REGION"}`}
                  />
                </Stack>
              </Box>
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={editEnabled}
                  onChange={(e) => {
                    setEditEnabled(e.target.checked)
                    if (e.target.checked) {
                      setEditApplyMode("ONLY_REGION")
                    }
                  }}
                  color="success"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {editEnabled ? "Región activa" : "Región inactiva"}
                </Typography>
              }
            />

            {!editEnabled && (
              <Box
                sx={{
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  p: 2,
                  bgcolor: (theme) => alpha(theme.palette.warning.main, 0.04),
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5 }}>
                  ¿Qué hacer con los países de esta región?
                </Typography>

                <RadioGroup
                  value={editApplyMode}
                  onChange={(e) => {
                    const mode = e.target.value as TRegionApplyMode
                    setEditApplyMode(mode)
                    if (mode === "CUSTOM") {
                      setEditCustomCountries(editRegion?.countryCodes ?? [])
                      setCountrySearch("")
                    }
                  }}
                >
                  <FormControlLabel
                    value="ONLY_REGION"
                    control={<Radio size="small" />}
                    label={<Typography variant="body2">Solo desactivar la región</Typography>}
                  />
                  <FormControlLabel
                    value="ALL_COUNTRIES"
                    control={<Radio size="small" />}
                    label={
                      <Typography variant="body2">
                        Desactivar región y todos sus países ({regionCountries(editRegion).length})
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    value="CUSTOM"
                    control={<Radio size="small" />}
                    label={
                      <Typography variant="body2">
                        Elegir qué países desactivar
                      </Typography>
                    }
                  />
                </RadioGroup>

                {editApplyMode === "CUSTOM" && (() => {
                  const allCountries = regionCountries(editRegion)
                  const filtered = countrySearch
                    ? allCountries.filter((c) =>
                        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                        c.iso.toLowerCase().includes(countrySearch.toLowerCase())
                      )
                    : allCountries

                  return (
                    <Box sx={{ mt: 1.5 }}>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="Buscar país..."
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        sx={{ mb: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5, px: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Se desactivarán <strong>{editCustomCountries.length}</strong> de {allCountries.length} países
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1.5 }}>
                          <Typography
                            variant="caption"
                            sx={{ cursor: "pointer", color: "error.main", fontWeight: 600 }}
                            onClick={() => setEditCustomCountries(allCountries.map((c) => c.iso))}
                          >
                            Todos
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ cursor: "pointer", color: "text.secondary", fontWeight: 600 }}
                            onClick={() => setEditCustomCountries([])}
                          >
                            Ninguno
                          </Typography>
                        </Box>
                      </Box>
                      <List dense disablePadding sx={{ maxHeight: 220, overflowY: "auto", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                        {filtered.map((country) => {
                          const checked = editCustomCountries.includes(country.iso)
                          return (
                            <ListItem key={country.iso} disablePadding>
                              <ListItemButton
                                dense
                                onClick={() =>
                                  setEditCustomCountries((prev) =>
                                    checked ? prev.filter((c) => c !== country.iso) : [...prev, country.iso]
                                  )
                                }
                                sx={{ py: 0.5 }}
                              >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <Checkbox
                                    size="small"
                                    edge="start"
                                    checked={checked}
                                    tabIndex={-1}
                                    disableRipple
                                    color="error"
                                  />
                                </ListItemIcon>
                                <ListItemText
                                  primary={<Typography variant="body2">{country.name}</Typography>}
                                  secondary={<Typography variant="caption" color="text.secondary">{country.iso}</Typography>}
                                />
                                {!country.enabled && (
                                  <Chip label="Ya inactivo" size="small" sx={{ fontSize: "0.68rem", height: 18, bgcolor: (t) => alpha(t.palette.error.main, 0.1), color: "error.main" }} />
                                )}
                              </ListItemButton>
                            </ListItem>
                          )
                        })}
                        {filtered.length === 0 && (
                          <ListItem>
                            <ListItemText primary={<Typography variant="body2" color="text.secondary">Sin resultados</Typography>} />
                          </ListItem>
                        )}
                      </List>
                    </Box>
                  )
                })()}

                <Box
                  sx={{
                    mt: 1.5,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    p: 1.5,
                    bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.75 }}>
                    Resumen de impacto
                  </Typography>

                  {editApplyMode === "ONLY_REGION" && (
                    <Typography variant="body2" color="text.secondary">
                      La región quedará inactiva, pero sus países seguirán con su configuración actual.
                    </Typography>
                  )}

                  {editApplyMode === "ALL_COUNTRIES" && (
                    <Typography variant="body2" color="text.secondary">
                      La región y todos sus países quedarán inactivos por herencia.
                    </Typography>
                  )}

                  {editApplyMode === "CUSTOM" && (
                    <Typography variant="body2" color="text.secondary">
                      La región quedará inactiva. Luego podrás activar manualmente algunos países desde la tabla de países.
                    </Typography>
                  )}
                </Box>
              </Box>
            )}

            <TextField
              label="Comentario interno"
              placeholder="Nota interna sobre el estado de esta región."
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