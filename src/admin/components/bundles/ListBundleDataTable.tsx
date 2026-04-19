import { useMemo, useState } from "react"
import { Box, Button, Typography, Fade, alpha, Chip, Drawer, Stack, Divider, IconButton } from "@mui/material"
import { Inventory, TipsAndUpdates } from "@mui/icons-material"
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined"
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined"
import FilterListOffOutlinedIcon from "@mui/icons-material/FilterListOffOutlined"
import { useDataTable } from "@/shared/hooks/useDataTable"
import { DataTable, DataTableToolbar, PaperDataTable } from "@/shared/components/data-table"
import { DataTableHeadCellProps } from "@/shared/interfaces/hooks/use-data-table.interface"
import { BundleModule } from "@/admin/utils/interfaces/bundle-module-data.interface"
import { formatterDateDDMMYYYY } from "@/shared/helpers/handligDateHelper"
import { FilterBundle, IDataBundleyByFilter } from "./FilterBundle"

const initBundleFilter: IDataBundleyByFilter = {
  provider: "all",
  created_at: {
    from: "",
    to: "",
  },
}

interface Props {
  bundleList: BundleModule[]
  onShowBundle: (bundle: BundleModule) => void
  onEditPool: (poolId: string) => void
  loading?: boolean
  onShowPool?: (idPool: string) => void
}

export const ListBundleDataTable = ({ bundleList, onEditPool, loading, onShowPool }: Props) => {
  const {
    ListItemTable,
    ItemDataTable,
    onSearch,
    onGetItemSelectd,
    pagination,
    DataTableHead,
    rows,
    onApplyFilter,
    dataByFilter,
    onSetFilter,
  } = useDataTable<BundleModule>(headCells, bundleList, "name", {
    showCheckbocHead: false,
  })

  const [filterBundle, setFilterBundle] = useState<IDataBundleyByFilter>(initBundleFilter)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)

  const activeFilterChips = useMemo(() => {
    const chips: { key: string; label: string }[] = []

    if (filterBundle.provider !== initBundleFilter.provider)
      chips.push({ key: "provider", label: `Proveedor: ${filterBundle.provider}` })
    if (filterBundle.created_at.from !== initBundleFilter.created_at.from)
      chips.push({ key: "created_at_from", label: `Desde: ${filterBundle.created_at.from}` })
    if (filterBundle.created_at.to !== initBundleFilter.created_at.to)
      chips.push({ key: "created_at_to", label: `Hasta: ${filterBundle.created_at.to}` })

    return chips
  }, [filterBundle])

  const handleReset = () => {
    setFilterBundle({ ...initBundleFilter, created_at: { from: "", to: "" } })
    onApplyFilter([], true)
  }

  const handleFilterChange = (field: string, value: string, at_field?: string) => {
    if (at_field && typeof value === "string" && value !== "all") {
      if (field === "created_at") {
        const action = at_field === "from" ? "date-from" : "date-to"
        const newFilter = [
          ...dataByFilter.filter(f => !(f.field === "created_at" && f.action === action)),
          ...(value ? [{ field: "created_at" as any, action: action as "date-from" | "date-to", value }] : [])
        ]
        onSetFilter(field as any, action as any, value)
        onApplyFilter(newFilter as any)
        setFilterBundle(prev => ({ ...prev, created_at: { ...prev.created_at, [at_field]: value } }))
      }
      return
    }

    const filterVal = value === "all" ? "" : value
    const newFilter = [
      ...dataByFilter.filter(f => !(f.field === field && f.action === "=")),
      ...(filterVal ? [{ field: "enabledLabel" as any, action: "=" as const, value: filterVal }] : [])
    ]
    onSetFilter(field as any, "=", value)
    onApplyFilter(newFilter)
    setFilterBundle(prev => ({ ...prev, [field]: value }))
  }

  const removeFilter = (key: string) => {
    if (key === "provider") {
      const newFilter = dataByFilter.filter(f => !(f.field === "provider" && f.action === "="))
      onSetFilter("provider" as any, "=", "all")
      onApplyFilter(newFilter as any)
      setFilterBundle(prev => ({ ...prev, provider: "all" }))
    } else if (key === "created_at_from") {
      const newFilter = dataByFilter.filter(f => !(f.field === "created_at" && f.action === "date-from"))
      onSetFilter("created_at" as any, "date-from", "")
      onApplyFilter(newFilter as any)
      setFilterBundle(prev => ({ ...prev, created_at: { ...prev.created_at, from: "" } }))
    } else if (key === "created_at_to") {
      const newFilter = dataByFilter.filter(f => !(f.field === "created_at" && f.action === "date-to"))
      onSetFilter("created_at" as any, "date-to", "")
      onApplyFilter(newFilter as any)
      setFilterBundle(prev => ({ ...prev, created_at: { ...prev.created_at, to: "" } }))
    }
  }

  return (
    <Fade in timeout={400}>
      <Box>
        <PaperDataTable>
          {/* Header con titulo e icono */}
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
                <Inventory sx={{ color: "white", fontSize: 26 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
                  Listado de Paquetes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {bundleList.length} paquetes registrados
                </Typography>
              </Box>
            </Box>
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
              <FilterBundle
                onChange={handleFilterChange}
                bundleFilter={filterBundle}
              />
            </Box>
            <Divider />
            <Box sx={{ px: 3, py: 2, display: "flex", gap: 1.5, flexShrink: 0 }}>
              <Button fullWidth variant="outlined" onClick={handleReset} disabled={activeFilterChips.length === 0} startIcon={<FilterListOffOutlinedIcon />} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}>Limpiar filtros</Button>
              <Button fullWidth variant="contained" onClick={() => setFilterDrawerOpen(false)} sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700, boxShadow: "none" }}>Listo</Button>
            </Box>
          </Drawer>

          <DataTableToolbar
            onChangeSearch={onSearch}
            searchPlaceholder="Buscar por nombre, pais, descripcion..."
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
            loading={{
              load: loading || false,
              cell: headCells.length + 1,
            }}
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
              const labelId = `enhanced-table-checkbox-${idx}`
              return (
                <ListItemTable key={row.id_data_table} id_data_table={row.id_data_table}>
                  <ItemDataTable component="th" id={labelId} scope="row">
                    {row.name}
                  </ItemDataTable>
                  <ItemDataTable align="left">{row.countries[0].name}</ItemDataTable>
                  <ItemDataTable align="left">{row.description}</ItemDataTable>
                  <ItemDataTable align="left">{row.provider}</ItemDataTable>
                  <ItemDataTable align="right">{row?.speed && row.speed.join(", ")}</ItemDataTable>
                  <ItemDataTable align="right">
                    {row?.created_at ? formatterDateDDMMYYYY(row.created_at) : "--/--/--"}
                  </ItemDataTable>
                  <ItemDataTable align="right">
                    <Box flexDirection="row" gap={2} alignItems="center">
                      {row.provider !== "ESIMGO" && (
                        <Button
                          variant="outlined"
                          color="primary"
                          sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: 2,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              transform: "translateY(-1px)",
                            },
                          }}
                          size="small"
                          onClick={() => onEditPool(row._id)}
                        >
                          Editar Pool
                        </Button>
                      )}
                    </Box>
                  </ItemDataTable>
                </ListItemTable>
              )
            })}
          </DataTable>

          {rows.length === 0 && (
            <Box p={4} textAlign="center">
              <Typography fontWeight={600}>No hay datos registrados</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                No hay bundles para mostrar.
              </Typography>
            </Box>
          )}
        </PaperDataTable>
      </Box>
    </Fade>
  )
}

const headCells: DataTableHeadCellProps<BundleModule>[] = [
  {
    id: "name",
    numeric: false,
    disablePadding: false,
    label: "Nombre",
  },
  {
    id: "countries",
    numeric: false,
    disablePadding: false,
    label: "Pais",
  },
  {
    id: "description",
    numeric: false,
    disablePadding: false,
    label: "Descripcion",
  },
  {
    id: "provider",
    numeric: false,
    disablePadding: false,
    label: "Proveedor",
  },
  {
    id: "speed",
    numeric: true,
    disablePadding: false,
    label: "Speed",
  },
  {
    id: "created_at",
    numeric: true,
    disablePadding: false,
    label: "Creacion",
  },
  {
    id: "created_at",
    numeric: true,
    disablePadding: false,
    label: "",
  },
]