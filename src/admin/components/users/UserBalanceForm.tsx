import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Paper,
  Typography,
  Autocomplete,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  FormHelperText,
  Tooltip,
  Fade,
  alpha,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import BusinessIcon from "@mui/icons-material/Business";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import { LayerCardForm } from "../LayerCardForm";
import { useFetch, useNotiAlert } from "@/shared/hooks";
import { IUserData } from "@/admin/utils/interfaces/user-data.interface";
import { ICompanyData } from "@/admin/utils/interfaces/company-data.interface";
import { Link as RouterLink } from "react-router-dom";

type Props = {
  title?: string;
  onBack: () => void;
  users: IUserData[];
  loading?: boolean;
  initialUserId?: string;
  isSuperAdmin: boolean;
  isAdmin: boolean;
};

export const UserBalanceForm = ({
  title = "Ajustar balances de usuario",
  onBack,
  users,
  loading = false,
  initialUserId = "",
}: Props) => {
  const { snackBarAlert } = useNotiAlert();

  const [userId, setUserId] = useState<string>(initialUserId);

  // Dialog
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<"add" | "subtract">("add");
  const [amount, setAmount] = useState("0");

  // pendiente (solo preview hasta enviar) -> SOLO 1 ajuste a la vez
  const [pendingSigned, setPendingSigned] = useState<number>(0);

  // loading botón enviar
  const [sending, setSending] = useState(false);

  const selectedUser = useMemo(() => {
    return users.find((u) => String(u.id) === String(userId)) ?? null;
  }, [users, userId]);

  // traer detalle del usuario (para balance real + companyId real)
  const shouldFetchUser = Boolean(userId);
  const {
    data: userDetail,
    loading: loadingUser,
    onFetch: onFetchUserApi,
    onRefresh: onRefreshUser,
  } = useFetch<IUserData & { amount?: number }>(`users/${userId}`, "GET", {
    init: shouldFetchUser,
    cache: { enabled: false },
  });

  const userCompanyId = useMemo(() => {
    return (
      (userDetail as any)?.companyId ??
      (userDetail as any)?.company?.id ??
      (selectedUser as any)?.companyId ??
      (selectedUser as any)?.company?.id ??
      null
    );
  }, [userDetail, selectedUser]);

  // traer detalle de compañía (para balance real company)
  const shouldFetchCompany = Boolean(userCompanyId);
  const {
    data: companyDetail,
    loading: loadingCompany,
    onRefresh: onRefreshCompany,
  } = useFetch<ICompanyData>(`companies/${String(userCompanyId)}`, "GET", {
    init: shouldFetchCompany,
    cache: { enabled: false },
  });

  // defaults: si viene solo 1 user y no hay id
  useEffect(() => {
    if (!userId && users?.length === 1) {
      setUserId(String(users[0].id));
    }
  }, [users, userId]);

  // balances "reales"
  const companyBalance = useMemo(() => {
    const v =
      (companyDetail as any)?.companyWallet?.wallet?.balance ??
      (companyDetail as any)?.amount ??
      0;

    const n = Number(v ?? 0);
    return Number.isFinite(n) ? n : 0;
  }, [companyDetail]);

  const userBalance = useMemo(() => {
    const v =
      (userDetail as any)?.resellerWallet?.wallet?.balance ??
      (userDetail as any)?.wallet?.balance ??
      (userDetail as any)?.amount ??
      0;

    const n = Number(v ?? 0);
    return Number.isFinite(n) ? n : 0;
  }, [userDetail]);

  const hasPending = pendingSigned !== 0;

  // preview del balance de usuario (pendiente)
  const previewUserBalance = useMemo(() => {
    const next = Number(userBalance ?? 0) + Number(pendingSigned ?? 0);
    return Number.isFinite(next) ? next : userBalance;
  }, [userBalance, pendingSigned]);

  // preview del balance de company (porque se mueve entre company<->user)
  const previewCompanyBalance = useMemo(() => {
    const next = Number(companyBalance ?? 0) - Number(pendingSigned ?? 0);
    return Number.isFinite(next) ? next : companyBalance;
  }, [companyBalance, pendingSigned]);

  const companyName = useMemo(() => {
    return (companyDetail as any)?.name ?? (userDetail as any)?.company?.name ?? null;
  }, [companyDetail, userDetail]);

  // abrir dialog: si hay pendiente NO dejamos abrir (solo cancelar o enviar)
  const openDialog = (next: "add" | "subtract") => {
    if (!userId) return;

    if (hasPending) {
      snackBarAlert("Ya hay un ajuste pendiente. Cancelalo o envialo antes de crear otro.", {
        variant: "warning",
      });
      return;
    }

    setAction(next);
    setAmount("0");
    setOpen(true);
  };

  const onCancelPending = () => {
    setPendingSigned(0);
    snackBarAlert("Ajuste pendiente cancelado.", { variant: "info" });
  };

  // Confirmar en dialog: deja pendiente, validando contra balances reales
  const onConfirmDialog = () => {
    const raw = Number(amount ?? 0);
    if (!Number.isFinite(raw) || raw <= 0) return;

    const signed = action === "subtract" ? -raw : raw;

    // reglas:
    // - add: company debe tener >= raw
    // - subtract: user debe tener >= raw
    if (signed > 0 && raw > companyBalance) {
      snackBarAlert("La empresa no tiene saldo suficiente para agregar ese monto al usuario.", {
        variant: "warning",
      });
      return;
    }

    if (signed < 0 && raw > userBalance) {
      snackBarAlert("El usuario no tiene saldo suficiente para restar ese monto.", {
        variant: "warning",
      });
      return;
    }

    setPendingSigned(signed);
    setOpen(false);
  };

  // Enviar: pega al backend (PATCH users/:id/balance)
  const onSendReceipt = async () => {
    if (!userId) return;

    const signed = Number(pendingSigned ?? 0);
    if (!Number.isFinite(signed) || signed === 0) {
      snackBarAlert("No hay cambios pendientes para enviar.", { variant: "warning" });
      return;
    }

    // revalidación rápida por si cambió el balance en paralelo
    if (signed > 0 && signed > companyBalance) {
      snackBarAlert("La empresa ya no tiene saldo suficiente para este ajuste.", {
        variant: "warning",
      });
      return;
    }
    if (signed < 0 && Math.abs(signed) > userBalance) {
      snackBarAlert("El usuario ya no tiene saldo suficiente para este ajuste.", {
        variant: "warning",
      });
      return;
    }

    setSending(true);

    const { ok } = await onFetchUserApi(`users/${userId}/balance`, "PATCH", {
      data: { amount: signed },
    });

    setSending(false);
    if (!ok) return;

    snackBarAlert(
      signed > 0
        ? `Se enviará comprobante: +${signed} USD a ${selectedUser?.email ?? "el usuario"}.`
        : `Se enviará comprobante: ${signed} USD a ${selectedUser?.email ?? "el usuario"}.`,
      { variant: "success" }
    );

    setPendingSigned(0);
    onRefreshUser();
    onRefreshCompany();
  };

  // habilitar acciones según balances + SIN pendiente
  const canAdd = Boolean(userId) && companyBalance > 0 && !hasPending;
  const canSubtract = Boolean(userId) && userBalance > 0 && !hasPending;

  const canSend = Boolean(userId) && hasPending && !sending;

  // tooltips
  const tooltipSubtract = !userId
    ? "Primero seleccioná un usuario."
    : hasPending
      ? "Ya hay un ajuste pendiente. Cancelalo o envialo."
      : userBalance <= 0
        ? "No podés restar porque el usuario no tiene saldo disponible."
        : "Restar balances al usuario: el monto se devuelve al balance de la empresa.";

  const tooltipAdd = !userId
    ? "Primero seleccioná un usuario."
    : hasPending
      ? "Ya hay un ajuste pendiente. Cancelalo o envialo."
      : companyBalance <= 0
        ? "No podés agregar porque la empresa no tiene saldo disponible."
        : "Agregar balances al usuario: el monto se descuenta del balance de la empresa.";

  const tooltipSend = !userId
    ? "Primero seleccioná un usuario."
    : !hasPending
      ? "No hay cambios pendientes. Usá Agregar o Restar y confirmá el monto."
      : sending
        ? "Enviando…"
        : "Guarda el ajuste pendiente y envía el comprobante al usuario.";

  const tooltipCancel = !hasPending
    ? "No hay un ajuste pendiente para cancelar."
    : "Cancela el ajuste pendiente antes de enviar.";

  // Estilos modernos
  const modernPaperSx = {
    p: 3,
    borderRadius: 3,
    border: '1px solid',
    borderColor: 'divider',
    transition: 'all 0.3s ease',
    '&:hover': {
      borderColor: 'primary.main',
      boxShadow: (theme: any) => `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
  };

  const balanceCardSx = (color: string) => ({
    p: 2.5,
    borderRadius: 3,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: (theme: any) => alpha(theme.palette[color].main, 0.03),
    transition: 'all 0.3s ease',
    '&:hover': {
      bgcolor: (theme: any) => alpha(theme.palette[color].main, 0.06),
      borderColor: `${color}.main`,
    },
  });

const modernButtonSx = (color: "primary" | "success" | "error" | "info" | "grey") => ({
  textTransform: "none",
  borderRadius: 2,
  px: 2.5,
  py: 1,
  fontWeight: 600,
  transition: "all 0.2s ease",
  "&:not(:disabled):hover": {
    transform: "translateY(-2px)",
    boxShadow: (theme: any) => {
      const shadowColor =
        color === "grey"
          ? alpha(theme.palette.grey[500], 0.28)
          : alpha(theme.palette[color].main, 0.4)

      return `0 4px 12px ${shadowColor}`
    },
  },
})

  return (
    <LayerCardForm title={title} loading={loading || loadingUser || loadingCompany || sending} onBack={onBack}>
      <Fade in timeout={400}>
        <Box pt={2.5}>
          <Paper variant="outlined" sx={modernPaperSx}>
            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
                  }}
                >
                  <PersonIcon sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography fontWeight={700} fontSize={18}>Usuario</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ajuste de balance individual
                  </Typography>
                </Box>
              </Box>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={onBack} 
                sx={{ 
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2,
                }}
              >
                Volver
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, px: 1 }}>
              Si el usuario no aparece en la lista, debe ser creado previamente{" "}
              <Box 
                component={RouterLink} 
                to="/admin/users" 
                sx={{ 
                  fontWeight: 700, 
                  textDecoration: 'none',
                  color: 'primary.main',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                aquí
              </Box>
              .
            </Typography>

            <Divider sx={{ my: 2 }} />

            {/* Selector user */}
            <Autocomplete
              options={users}
              value={selectedUser}
              loading={loading}
              isOptionEqualToValue={(o, v) => String(o.id) === String(v.id)}
              getOptionLabel={(o) => `${o?.name ?? "Usuario"} (${o?.email ?? "-"})`}
              onChange={(_, newVal) => {
                setUserId(String(newVal?.id ?? ""));
                setPendingSigned(0);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Seleccionar usuario"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  placeholder="Nombre o email…"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                        },
                      },
                      '&.Mui-focused': {
                        boxShadow: (theme) => `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
                      },
                    },
                  }}
                />
              )}
            />

            {/* Balance COMPANY */}
            <Box mt={3} sx={balanceCardSx('info')}>
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: (theme) => alpha(theme.palette.info.main, 0.15),
                  }}
                >
                  <BusinessIcon sx={{ color: 'info.main', fontSize: 20 }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Balance empresa {companyName ? `(${companyName})` : ""}
                </Typography>
              </Box>

              <Box display="flex" alignItems="baseline" gap={1} mt={1} flexWrap="wrap">
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 800, 
                    lineHeight: 1,
                    background: (theme) => `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {previewCompanyBalance.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  USD
                </Typography>

                {hasPending && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      ml: 1,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: (theme) => alpha(pendingSigned > 0 ? theme.palette.error.main : theme.palette.success.main, 0.1),
                      color: pendingSigned > 0 ? "error.main" : "success.main",
                    }}
                  >
                    {pendingSigned > 0 ? `(-${pendingSigned})` : `(+${Math.abs(pendingSigned)})`}
                  </Typography>
                )}
              </Box>

              <Typography variant="body2" color="text.secondary" mt={1.5} sx={{ fontSize: 13 }}>
                Para <b>agregar</b> al usuario, se descuenta de la empresa. Para <b>restar</b>, vuelve a la empresa.
              </Typography>
            </Box>

            {/* Balance USER */}
            <Box mt={2} sx={balanceCardSx('primary')}>
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
                  }}
                >
                  <AccountBalanceWalletIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Balance usuario
                </Typography>
              </Box>

              <Box display="flex" alignItems="baseline" gap={1} mt={1} flexWrap="wrap">
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 800, 
                    lineHeight: 1,
                    background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {previewUserBalance.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  USD
                </Typography>

                {hasPending && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 800,
                      ml: 1,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: (theme) => alpha(pendingSigned > 0 ? theme.palette.success.main : theme.palette.error.main, 0.1),
                      color: pendingSigned > 0 ? "success.main" : "error.main",
                    }}
                  >
                    {pendingSigned > 0 ? `(+${pendingSigned})` : `(${pendingSigned})`}
                  </Typography>
                )}
              </Box>

              {hasPending && (
                <FormHelperText 
                  sx={{ 
                    mt: 1.5, 
                    color: pendingSigned > 0 ? "success.main" : "error.main",
                    fontWeight: 500,
                  }}
                >
                  Cambio pendiente: <b>{pendingSigned > 0 ? `+${pendingSigned}` : `${pendingSigned}`}</b> USD. Se aplicará al
                  presionar <b>Guardar y Enviar Comprobante</b>.
                </FormHelperText>
              )}
            </Box>

            {/* Acciones */}
            <Box display="flex" gap={1.5} mt={3} justifyContent="flex-end" flexWrap="wrap">
              <Tooltip title={tooltipSubtract} arrow placement="top">
                <span>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<RemoveIcon />}
                    onClick={() => openDialog("subtract")}
                    disabled={!canSubtract}
                    sx={modernButtonSx('error')}
                  >
                    Restar
                  </Button>
                </span>
              </Tooltip>

              <Tooltip title={tooltipAdd} arrow placement="top">
                <span>
                  <Button
                    variant="contained"
                    color="success"
                    disableElevation
                    startIcon={<AddIcon />}
                    onClick={() => openDialog("add")}
                    disabled={!canAdd}
                    sx={modernButtonSx('success')}
                  >
                    Agregar
                  </Button>
                </span>
              </Tooltip>

              {/* cancelar pendiente */}
              <Tooltip title={tooltipCancel} arrow placement="top">
                <span>
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<CloseIcon />}
                    onClick={onCancelPending}
                    disabled={!hasPending}
                    sx={{
                      ...modernButtonSx('grey'),
                      borderColor: 'divider',
                    }}
                  >
                    Cancelar ajuste
                  </Button>
                </span>
              </Tooltip>

              <Tooltip title={tooltipSend} arrow placement="top">
                <span>
                  <Button
                    variant="contained"
                    color="info"
                    disableElevation
                    startIcon={<SendIcon />}
                    onClick={onSendReceipt}
                    disabled={!canSend}
                    sx={modernButtonSx('info')}
                  >
                    Guardar y Enviar Comprobante
                  </Button>
                </span>
              </Tooltip>
            </Box>

            {/* hints si está bloqueado */}
            {!canAdd && userId && !hasPending && companyBalance <= 0 && (
              <FormHelperText sx={{ mt: 2 }}>No podés agregar porque la empresa tiene balance 0.</FormHelperText>
            )}
            {!canSubtract && userId && !hasPending && userBalance <= 0 && (
              <FormHelperText sx={{ mt: 0.5 }}>No podés restar porque el usuario tiene balance 0.</FormHelperText>
            )}
            {hasPending && (
              <FormHelperText sx={{ mt: 2 }}>
                Ya existe un ajuste pendiente. Si querés cambiarlo, primero presioná <b>Cancelar ajuste</b>.
              </FormHelperText>
            )}
          </Paper>
        </Box>
      </Fade>

      {/* Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        fullWidth 
        maxWidth="xs"
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle 
          sx={{ 
            background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`,
            borderBottom: '1px solid',
            borderColor: 'divider',
            fontWeight: 700,
          }}
        >
          {action === "add" ? "Agregar balances al usuario" : "Restar balances al usuario"}
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Box mt={1}>
            <TextField
              autoFocus
              label={action === "add" ? "Monto a agregar" : "Monto a restar"}
              fullWidth
              size="small"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography fontWeight={600}>USD</Typography>
                  </InputAdornment>
                ),
              }}
              type="number"
              inputProps={{ step: "0.01", min: 0 }}
              helperText={
                action === "add"
                  ? `Disponible empresa: ${companyBalance.toLocaleString("en-US", { maximumFractionDigits: 2 })} USD`
                  : `Disponible usuario: ${userBalance.toLocaleString("en-US", { maximumFractionDigits: 2 })} USD`
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1 }}>
          <Button 
            onClick={() => setOpen(false)}
            sx={{ 
              textTransform: 'none',
              borderRadius: 2,
              px: 2,
            }}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={onConfirmDialog} 
            disabled={!userId}
            disableElevation
            sx={{ 
              textTransform: 'none',
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </LayerCardForm>
  );
};
