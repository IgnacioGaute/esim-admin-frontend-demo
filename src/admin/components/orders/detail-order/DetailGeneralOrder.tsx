import { useMemo } from "react"
import { Box, Grid, Tooltip, Typography, Fade, alpha } from "@mui/material"
import { Receipt, TipsAndUpdates } from "@mui/icons-material"
import { IOrderDetail, TypeStateOrder } from "@/admin/utils/interfaces/order-data.interfaces"
import { formatterDateDDMMYYYY } from "@/shared/helpers/handligDateHelper"
import { ItemDetail } from "../../ItemDetail"

import { AlertColor } from "@mui/material"

const orderStateLabel: Record<TypeStateOrder, string> = {
  completed: "Completada",
  initialized: "En el Carrito",
  rejected: "Rechazada",
  pending: "Pendiente",
}

const orderStateSeverity: Record<TypeStateOrder, AlertColor> = {
  completed: "success",
  initialized: "info",
  rejected: "error",
  pending: "warning",
}

const orderStateTooltip: Record<TypeStateOrder, string> = {
  completed: "Esta orden fue completada con exito.",
  initialized: "Esta orden se anadio al carrito de compras, pero aun no se ha completado el pago.",
  rejected: "Esta orden fue rechazada.",
  pending: "Esta orden esta pendiente de confirmacion o procesamiento.",
}

interface Props {
  loading: boolean
  order?: IOrderDetail
}

export const DetailGeneralOrder = ({ loading, order }: Props) => {
  const amountDescuent = useMemo(() => {
    if (order && order.discount) {
      const price = order.sub_total
      const quantity = order.quantity
      const total = price * quantity
      const porDescuent = order.discount.discount_percent

      return (total * porDescuent) / 100
    }

    return 0
  }, [order])

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
            <Receipt sx={{ color: "white", fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
              Detalle General de Orden
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Informacion de la orden y pago
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
            Tip: revisa el estado de la orden y los detalles del pago para un seguimiento completo.
          </Typography>
        </Box>

        {/* Contenido */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ItemDetail
                loading={loading}
                label="Canal"
                description={order?.channel}
                alertProps={{ severity: "error", variant: "filled" }}
              />
              <ItemDetail
                loading={loading}
                label="Fecha orden"
                description={(order?.created_at && formatterDateDDMMYYYY(order.created_at)) || "--/--/--"}
                alertProps={{ severity: "success" }}
              />
              <ItemDetail
                loading={loading}
                label="Numero de orden"
                description={order?.buy_order || "Ninguno"}
                alertProps={{ severity: "info" }}
              />

              <ItemDetail
                loading={loading}
                label="Estado de orden"
                description={
                  order?.state_order ? (
                    <Tooltip title={orderStateTooltip[order.state_order]} arrow placement="top">
                      <Box component="span" sx={{ cursor: "help" }}>
                        {orderStateLabel[order.state_order]}
                      </Box>
                    </Tooltip>
                  ) : (
                    "-"
                  )
                }
                alertProps={{
                  severity: order?.state_order ? orderStateSeverity[order.state_order] : "info",
                  variant: "filled",
                }}
              />

              <ItemDetail loading={loading} label="Cantidad" description={order?.quantity.toFixed(2)} component="box" />
              <ItemDetail
                loading={loading}
                label={order?.discount && !loading ? "Sub Total" : "Total"}
                description={"$ " + ((order && order?.sub_total && order.sub_total.toFixed(2)) || "0.00")}
                alertProps={{ severity: "success" }}
              />
              <ItemDetail
                loading={loading}
                label="Codigo descuento"
                description={order?.discount_code || "Ninguno"}
                alertProps={{ severity: "info" }}
              />

              {order?.discount && !loading && (
                <>
                  <ItemDetail
                    loading={loading}
                    label="% descuento"
                    description={`${order.discount.discount_percent}%`}
                    alertProps={{ severity: "error" }}
                  />
                  <ItemDetail
                    loading={loading}
                    label="Monto descuento"
                    description={`$ ${amountDescuent.toFixed(2)}`}
                    alertProps={{ severity: "error" }}
                  />
                </>
              )}

              {order?.discount_code && !loading && (
                <ItemDetail
                  loading={loading}
                  label="Total"
                  description={"$ " + (order?.total ?? "Ninguno")}
                  alertProps={{ severity: "success" }}
                />
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography component="h6" variant="h6" fontWeight="600" mb={2.5} sx={{ letterSpacing: "-0.02em" }}>
                Detalles del pago
              </Typography>

              <ItemDetail
                loading={loading}
                label="Metodo de pago"
                description={order?.payment_type || "Ninguno"}
                alertProps={{ severity: "info" }}
              />
              <ItemDetail
                loading={loading}
                label="Resultado"
                description={
                  (order?.payment_result && typeof order?.payment_result === "string" && order.payment_result) ||
                  "-- --- --"
                }
                component="box"
              />

              {order?.exchange_rate && !loading && (
                <>
                  <ItemDetail
                    loading={loading}
                    label="Moneda de pago"
                    description={order.exchange_rate.to}
                    alertProps={{ severity: "warning" }}
                  />
                  <ItemDetail
                    loading={loading}
                    label="Fecha de cambio"
                    description={"" + order.exchange_rate.date}
                    component="box"
                  />
                  <ItemDetail
                    loading={loading}
                    label={`Monto de cambio (${order.exchange_rate.from} a ${order.exchange_rate.to})`}
                    description={`${order.exchange_rate.rate.toFixed(2)} ${order.exchange_rate.to}`}
                    alertProps={{ severity: "error" }}
                  />
                  <ItemDetail
                    loading={loading}
                    label={`Monto cancelado (${order.exchange_rate.to})`}
                    description={`${order.exchange_rate.result.toFixed(2)} ${order.exchange_rate.to}`}
                    alertProps={{ severity: "success" }}
                  />
                </>
              )}
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Fade>
  )
}