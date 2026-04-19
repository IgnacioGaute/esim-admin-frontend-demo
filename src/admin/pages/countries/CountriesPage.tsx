import { useState } from "react"
import { Box, Tab, Tabs, Typography, alpha } from "@mui/material"
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined"
import MapOutlinedIcon from "@mui/icons-material/MapOutlined"

import { useFetch } from "@/shared/hooks"
import { useNotiAlert } from "@/shared/hooks"
import {
  ILocationsAdminAllData,
  IUpdateCountryAvailabilityDto,
  IUpdateRegionAvailabilityDto,
} from "@/admin/utils/interfaces/countries.interface"
import { IUserData } from "@/admin/utils/interfaces"
import { ListCountriesDataTable } from "@/admin/components/countries/ListCountriesDataTable"
import { ListRegionsDataTable } from "@/admin/components/countries/ListRegionsDataTable"

export const CountriesPage = () => {
  const { snackBarAlert } = useNotiAlert()
  const [activeTab, setActiveTab] = useState(0)

  const { data: me } = useFetch<IUserData>("users/me", "GET", {
    init: true,
    cache: { enabled: false },
  })

  const { data: locationsResp, loading, onRefresh } = useFetch<{ data: ILocationsAdminAllData }>(
    "countries/admin/all",
    "GET",
    { init: true, instance: "storeApi", showMessageError: true }
  )

  const countries = locationsResp?.data?.countries ?? []
  const regions = locationsResp?.data?.regions ?? []

  const { onFetch: patchLocation } = useFetch<any>("", "PATCH", {
    init: false,
    instance: "storeApi",
    showMessageError: true,
  })

  const { onFetch: syncCountries } = useFetch<any>("", "GET", {
    init: false,
    instance: "storeApi",
    showMessageError: true,
  })

  const handleUpdateCountry = async (code: string, dto: IUpdateCountryAvailabilityDto) => {
    const updatedBy = me?.name || me?.email || undefined
    const resp = await patchLocation(`countries/admin/country/${code}`, "PATCH", { data: { ...dto, updatedBy } }, "storeApi")
    if (resp?.ok) {
      snackBarAlert("País actualizado correctamente", { variant: "success" })
      onRefresh()
    }
  }

  const handleUpdateRegion = async (code: string, dto: IUpdateRegionAvailabilityDto) => {
    const updatedBy = me?.name || me?.email || undefined
    const resp = await patchLocation(`countries/admin/region/${code}`, "PATCH", { data: { ...dto, updatedBy } }, "storeApi")
    if (resp?.ok) {
      snackBarAlert("Región actualizada correctamente", { variant: "success" })
      onRefresh()
    }
  }

  const handleSync = async () => {
    const resp = await syncCountries("countries/admin/sync", "GET", {}, "storeApi")
    if (resp?.ok) {
      snackBarAlert("Países sincronizados correctamente", { variant: "success" })
      onRefresh()
    }
  }

  return (
    <Box>
      {/* Header con tabs */}
      <Box
        sx={{
          mb: 2.5,
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <Box
          sx={{
            px: 3,
            pt: 2.5,
            pb: 0,
            background: (theme) =>
              `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(theme.palette.secondary.main, 0.04)} 100%)`,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            Gestión de disponibilidad
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Activá o desactivá países y regiones para controlar la disponibilidad en la plataforma.
          </Typography>

          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            sx={{
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
              },
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.875rem",
                minHeight: 44,
                px: 2,
                gap: 1,
                "&.Mui-selected": { fontWeight: 700 },
              },
            }}
          >
            <Tab
              icon={<PublicOutlinedIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  Países
                  <Box
                    sx={{
                      px: 1,
                      py: 0.2,
                      borderRadius: 10,
                      bgcolor: activeTab === 0
                        ? (theme) => alpha(theme.palette.primary.main, 0.12)
                        : (theme) => alpha(theme.palette.text.secondary, 0.1),
                      color: activeTab === 0 ? "primary.main" : "text.secondary",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      lineHeight: 1.6,
                      minWidth: 28,
                      textAlign: "center",
                    }}
                  >
                    {countries.length}
                  </Box>
                </Box>
              }
            />
            <Tab
              icon={<MapOutlinedIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  Regiones
                  <Box
                    sx={{
                      px: 1,
                      py: 0.2,
                      borderRadius: 10,
                      bgcolor: activeTab === 1
                        ? (theme) => alpha(theme.palette.secondary.main, 0.12)
                        : (theme) => alpha(theme.palette.text.secondary, 0.1),
                      color: activeTab === 1 ? "secondary.main" : "text.secondary",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      lineHeight: 1.6,
                      minWidth: 28,
                      textAlign: "center",
                    }}
                  >
                    {regions.length}
                  </Box>
                </Box>
              }
            />
          </Tabs>
        </Box>
      </Box>

      {/* Contenido de tabs */}
      {activeTab === 0 && (
        <ListCountriesDataTable
          countriesList={countries}
          loading={loading}
          onUpdate={handleUpdateCountry}
          onSync={handleSync}
        />
      )}

      {activeTab === 1 && (
        <ListRegionsDataTable
          regionsList={regions}
          countriesList={countries}
          loading={loading}
          onUpdate={handleUpdateRegion}
        />
      )}
    </Box>
  )
}
