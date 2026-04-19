import CloseOutlined from "@mui/icons-material/CloseOutlined";
import {
  Dialog,
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  DialogActions,
  Button,
} from "@mui/material";

import { ITransactionDetailWalletData } from "@/admin/utils/interfaces/transaction.interface";
import { USER_TYPE_CONST, formatterDateDDMMYYYY } from "@/shared/helpers";
import { ItemDetail } from "../ItemDetail";

interface Props {
  opened: boolean;
  onClose: () => void;
  loading: boolean;
  detail?: ITransactionDetailWalletData;
}

export const DetailTransaction = ({
  opened,
  onClose,
  loading,
  detail,
}: Props) => {
  const isReseller = !!detail?.reseller;
  const isCompany = !!(detail as any)?.company; // si tu interface ya tiene company, sacá el any

  return (
    <Dialog open={opened} onClose={onClose} maxWidth="md" fullWidth>
      <Card elevation={0} sx={{ overflow: "auto" }}>
        <CardContent>
          <Box
            mb={2.5}
            display="flex"
            alignItems="center"
            flexDirection="row"
            width="100%"
          >
            <Typography component="h1" variant="h6" fontWeight="500" flex={1}>
              Detalle
            </Typography>

            <IconButton onClick={onClose}>
              <CloseOutlined fontSize="small" />
            </IconButton>
          </Box>

          <Grid container spacing={2}>
            {/* =======================
                Columna izquierda (Owner)
               ======================= */}
            <Grid item xs={12} md={6}>
              {isReseller && (
                <>
                  <ItemDetail
                    loading={loading}
                    label="Nombre & Apellido"
                    description={detail?.reseller?.name || ""}
                    component="box"
                  />
                  <ItemDetail
                    loading={loading}
                    label="E-mail"
                    description={detail?.reseller?.email || ""}
                    component="box"
                  />
                  <ItemDetail
                    loading={loading}
                    label="Tipo usuario"
                    description={
                      USER_TYPE_CONST[detail?.reseller?.type || "SUPER_ADMIN"]
                    }
                    alertProps={{ severity: "info" }}
                  />
                </>
              )}

              {isCompany && !isReseller && (
                <>
                  <ItemDetail
                    loading={loading}
                    label="Empresa"
                    description={(detail as any)?.company?.name || ""}
                    component="box"
                  />
                </>
              )}

              {!isReseller && !isCompany && (
                <ItemDetail
                  loading={loading}
                  label="Dueño"
                  description="No identificado"
                  component="box"
                  alertProps={{ severity: "warning" }}
                />
              )}
            </Grid>

            {/* =======================
                Columna derecha (Wallet)
               ======================= */}
            <Grid item xs={12} md={6}>
              <ItemDetail
                loading={loading}
                label="Estado wallet"
                description={detail?.wallet?.isActive ? "Activo" : "Desactivado"}
                alertProps={{
                  severity: detail?.wallet?.isActive ? "success" : "error",
                }}
              />

              <ItemDetail
                loading={loading}
                label="Balance"
                description={`$ ${Number(detail?.wallet?.balance || 0).toFixed(
                  2,
                )}`}
                alertProps={{ severity: "success" }}
              />

              <ItemDetail
                loading={loading}
                label="Ultima transaccion"
                description={
                  detail?.wallet?.lastTransactionAt
                    ? formatterDateDDMMYYYY(detail.wallet.lastTransactionAt)
                    : "--/--/--"
                }
                alertProps={{ severity: "info" }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <DialogActions>
        <Button
          variant="outlined"
          color="secondary"
          sx={{ textTransform: "capitalize", minWidth: "110px" }}
          onClick={onClose}
          disableElevation
        >
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
