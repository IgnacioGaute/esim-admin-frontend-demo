import React, { useEffect, useMemo, useState } from "react"
import { Avatar, Box, Button, Grid, LinearProgress, Typography, Fade, alpha } from "@mui/material"
import { SimCard, TipsAndUpdates } from "@mui/icons-material"
import { IDataBundle, Assignment } from "@/admin/utils/interfaces/bundle-data.interface"
import { getCountryByIso } from "@/shared/helpers/countryHelper"
import { ItemDetailAccordion } from "../../ItemDetailAccordion"
import { ItemDetail } from "../../ItemDetail"

interface Props {
  data: IDataBundle[]
  loading: boolean
  onResendEmail: (body: IDataBundle) => void
}

export const DetailBundlesOrder = ({ data, loading, onResendEmail }: Props) => {
  const [expanded, setExpanded] = useState<string[]>(["1"])

  useEffect(() => {
    if (data.length > 0) {
      setExpanded([data[0].iccid])
    }
  }, [data])

  const placeholderlist = useMemo(() => {
    return Array.from({ length: 1 }).map((_) => null)
  }, [])

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded((values) => {
      if (values.includes(panel)) return values.filter((value) => value !== panel)

      return [panel]
    })
  }

  const bundles = useMemo(() => {
    if (loading) return placeholderlist

    return data
  }, [data])

  const getCountry = (value: string) => {
    const arrString = value.split("_")
    let country: string | undefined

    arrString.forEach((value) => {
      const result = getCountryByIso(value)

      if (result) {
        country = result.name
      }
    })

    return country
  }

  const getCountryISO = (value: string) => {
    const arrString = value.split("_")
    let iso: string = ""

    arrString.forEach((value) => {
      const result = getCountryByIso(value)

      if (result) {
        iso = result.iso
      }
    })

    return iso
  }

  const getUsedAndTotal = (dataCon: Assignment) => {
    const { bundleState, unlimited, initialQuantity, remainingQuantity } = dataCon
    const resp = {
      total: "Ilimitado",
      used: "0 MB",
      prUsed: 0,
    }

    const totalUse = initialQuantity - remainingQuantity
    const totalDatos = initialQuantity / 1e9

    if (!unlimited) {
      resp.total = `${totalDatos} GB`
    }

    resp.prUsed = initialQuantity == remainingQuantity ? 0 : Math.round(totalUse / (initialQuantity / 100))
    resp.used = initialQuantity == remainingQuantity ? "0.0 MB" : CheckBytes(totalUse)

    return resp
  }

  const CheckBytes = (bytes: number) => {
    let units = ["Bytes", "KB", "MB", "GB", "TB"]
    let i

    for (i = 0; bytes >= 1024 && i < 4; i++) {
      bytes /= 1024
    }

    return bytes.toFixed(2) + " " + units[i]
  }

  return (
    <Fade in timeout={400}>
      <Box
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          backgroundColor: "background.paper",
        }}
      >
        {/* Header con titulo e icono */}
        <Box
          sx={{
            display: "flex",
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
            <SimCard sx={{ color: "white", fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
              Detalle de Bundles
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {data.length} bundle{data.length !== 1 ? "s" : ""} en esta orden
            </Typography>
          </Box>
        </Box>

        {/* Tip box */}
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
            Tip: haz click en cada bundle para expandir y ver los detalles completos.
          </Typography>
        </Box>

        {/* Contenido */}
        <Box sx={{ p: 3 }}>
          {bundles.length == 0 && (
            <Box mb={2} textAlign="center" py={4}>
              <Typography fontWeight={600} color="error.main">
                No hay mas datos.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                No hay bundles asociados a esta orden.
              </Typography>
            </Box>
          )}
          {bundles.map((bundle, idx) => (
            <ItemDetailAccordion
              key={idx}
              expanded={expanded.includes(bundle?.iccid || "1")}
              handleChange={handleChange(bundle?.iccid || "1")}
              label={bundle?.bundles && bundle.bundles.length > 0 ? bundle.bundles[0].description : "Producto"}
            >
              <Grid container spacing={2} marginLeft={0} marginTop={0} width={"100%"}>
                <Grid xs={12} md={6} sx={{ paddingRight: { md: 1 } }}>
                  <ItemDetail loading={loading} label="Bundle" description={bundle?.bundle} component="box" />
                  <ItemDetail
                    loading={loading}
                    label="Ubicacion"
                    description={
                      <Box display="flex" alignItems="center">
                        {bundle?.bundle && (
                          <Avatar
                            sx={{ width: 21, height: 21, mr: 1 }}
                            children={
                              <img
                                src={`https://flagsapi.com/${getCountryISO(bundle?.bundle)}/flat/32.png`}
                                style={{
                                  maxHeight: "100%",
                                  maxWidth: "100%",
                                  objectFit: "none",
                                }}
                              />
                            }
                          />
                        )}
                        <Typography>{bundle?.bundle ? getCountry(bundle.bundle) : ""}</Typography>
                      </Box>
                    }
                    component="box"
                  />
                  <ItemDetail loading={loading} label="Iccid" description={bundle?.iccid} component="box" />
                  <ItemDetail
                    loading={loading}
                    label="matchingId"
                    description={bundle?.matchingId}
                    alertProps={{ severity: "info" }}
                  />
                  <ItemDetail
                    loading={loading}
                    label="rspUrl"
                    description={bundle?.rspUrl}
                    alertProps={{ severity: "info" }}
                  />
                </Grid>
                <Grid xs={12} md={6} sx={{ paddingLeft: { md: 1 } }}>
                  {bundle?.bundles && bundle.bundles.length && bundle.bundles[0].assignments.length > 0 && (
                    <>
                      <ItemDetail
                        loading={loading}
                        label="Estado"
                        description={bundle.bundles[0].assignments[0].bundleState}
                        alertProps={{
                          severity:
                            bundle.bundles[0].assignments[0].bundleState == "expired" ||
                            bundle.bundles[0].assignments[0].bundleState == "revoked"
                              ? "error"
                              : bundle.bundles[0].assignments[0].bundleState == "active"
                                ? "success"
                                : "info",
                          variant: "filled",
                        }}
                      />
                      <ItemDetail
                        loading={loading}
                        label="Data total"
                        description={getUsedAndTotal(bundle.bundles[0].assignments[0]).total}
                        alertProps={{ severity: "success" }}
                      />
                      <ItemDetail
                        loading={loading}
                        label="Data usada"
                        description={getUsedAndTotal(bundle.bundles[0].assignments[0]).used}
                        alertProps={{ severity: "error" }}
                      />
                      <Box pt={1}>
                        <Box mb={1} display="flex" flexDirection="row" justifyContent="space-between">
                          <Typography color="text.secondary">
                            {getUsedAndTotal(bundle.bundles[0].assignments[0]).used}
                          </Typography>
                          <Typography color="text.primary" fontWeight={500}>
                            {getUsedAndTotal(bundle.bundles[0].assignments[0]).total}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={getUsedAndTotal(bundle.bundles[0].assignments[0]).prUsed}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                            "& .MuiLinearProgress-bar": {
                              borderRadius: 5,
                            },
                          }}
                        />
                      </Box>
                    </>
                  )}
                </Grid>
                {bundle && (
                  <Grid xs={12} md={12}>
                    <Button
                      color="primary"
                      variant="outlined"
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: 2,
                        mt: 2,
                        transition: "all 0.2s ease",
                        "&:hover": {
                          transform: "translateY(-1px)",
                        },
                      }}
                      onClick={() => onResendEmail(bundle)}
                      disabled={loading}
                    >
                      Reenviar correo
                    </Button>
                  </Grid>
                )}
              </Grid>
            </ItemDetailAccordion>
          ))}
        </Box>
      </Box>
    </Fade>
  )
}