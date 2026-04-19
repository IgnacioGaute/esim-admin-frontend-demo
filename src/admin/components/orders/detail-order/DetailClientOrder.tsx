import { Box, Grid, Typography, Fade, alpha } from "@mui/material"
import { Person, TipsAndUpdates } from "@mui/icons-material"
import { UserOrder } from "@/admin/utils/interfaces/order-data.interfaces"
import { formatterDateDDMMYYYY } from "@/shared/helpers/handligDateHelper"
import { ItemDetail } from "../../ItemDetail"

interface Props {
  user?: UserOrder | null
  loading: boolean
}

export const DetailClientOrder = ({ loading, user }: Props) => {
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
            <Person sx={{ color: "white", fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.02em" }}>
              Datos del Cliente
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Informacion de contacto y registro
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
            Tip: los datos del cliente estan vinculados a la orden seleccionada.
          </Typography>
        </Box>

        {/* Contenido */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ItemDetail loading={loading} label="Nombres" description={user?.name} component="box" />
              <ItemDetail loading={loading} label="Apellidos" description={user?.surname} component="box" />
              <ItemDetail loading={loading} label="Correo electronico" description={user?.email} component="box" />
            </Grid>
            <Grid item xs={12} md={6}>
              <ItemDetail
                loading={loading}
                label="Numero de telefono"
                description={
                  user?.nro_phone
                    ? `${user?.code_nro_phone ? user?.code_nro_phone + " " : ""}` + `${user.nro_phone}`
                    : "Ninguno"
                }
                alertProps={{ severity: "info" }}
              />
              <ItemDetail
                loading={loading}
                label="Fecha Registro"
                description={(user?.created_at && formatterDateDDMMYYYY(user.created_at)) || "--/--/--"}
                alertProps={{ severity: "success" }}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Fade>
  )
}