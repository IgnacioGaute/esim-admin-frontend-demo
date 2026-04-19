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
import BusinessIcon from "@mui/icons-material/Business";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

import { LayerCardForm } from "../LayerCardForm";
import { useFetch, useNotiAlert } from "@/shared/hooks";
import { ICompanyData } from "@/admin/utils/interfaces/company-data.interface";
import { Link as RouterLink } from "react-router-dom";

type Props = {
  title?: string;
  onBack: () => void;
  companies: ICompanyData[];
  loading?: boolean;
  initialCompanyId?: string;
  isSuperAdmin: boolean;
  isAdmin: boolean;
};

export const CompanyBalanceForm = ({
  title = "Ajustar balance de empresa",
  onBack,
  companies,
  loading = false,
  initialCompanyId = "",
  isSuperAdmin,
}: Props) => {
  const { snackBarAlert } = useNotiAlert();

  const [companyId, setCompanyId] = useState<string>(initialCompanyId);

  // Dialog
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<"add" | "subtract">("add");
  const [amount, setAmount] = useState("0");

  // monto pendiente (preview) -> SOLO 1 ajuste a la vez
  const [pendingSigned, setPendingSigned] = useState<number>(0);

  // loading botón enviar
  const [sending, setSending] = useState(false);

  // detalle de empresa seleccionada (balance real)
  const shouldFetchCompany = Boolean(companyId);
  const {
    data: companyDetail,
    loading: loadingCompany,
    onFetch,
    onRefresh,
  } = useFetch<ICompanyData>(`companies/${companyId}`, "GET", {
    init: shouldFetchCompany,
    cache: { enabled: false },
  });

  useEffect(() => {
    if (!companyId && companies?.length === 1) {
      setCompanyId(String(companies[0].id));
    }
  }, [companies, companyId]);

  const selectedCompany = useMemo(() => {
    return companies.find((c) => String(c.id) === String(companyId)) ?? null;
  }, [companies, companyId]);

  const balance = useMemo(() => {
    const v =
      (companyDetail as any)?.companyWallet?.wallet?.balance ??
      (companyDetail as any)?.amount ??
      0;

    const n = Number(v ?? 0);
    return Number.isFinite(n) ? n : 0;
  }, [companyDetail]);

  const previewBalance = useMemo(() => {
    const next = Number(balance ?? 0) + Number(pendingSigned ?? 0);
    return Number.isFinite(next) ? next : balance;
  }, [balance, pendingSigned]);

  const hasPending = pendingSigned !== 0;

  // helper: bloquea negativos y caracteres raros
  const sanitizeNonNegative = (raw: string) => {
    if (raw === "") return "";
    const normalized = raw.replace(",", ".");
    const n = Number(normalized);
    if (!Number.isFinite(n)) return "0";
    if (n < 0) return "0";
    return normalized;
  };

  // abrir dialog: si hay pendiente NO dejamos abrir (solo cancelar o enviar)
  const openDialog = (next: "add" | "subtract") => {
    if (!companyId) return;

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

  // Confirmar: valida monto y setea pendiente (uno solo)
  const onConfirmDialog = () => {
    const raw = Number(String(amount ?? "0").replace(",", "."));

    if (!Number.isFinite(raw)) {
      snackBarAlert("Monto inválido.", { variant: "warning" });
      return;
    }

    if (raw <= 0) {
      snackBarAlert("El monto debe ser mayor a 0.", { variant: "warning" });
      return;
    }

    const signed = action === "subtract" ? -raw : raw;

    // regla opcional: no permitir que el balance quede negativo al restar
    if (signed < 0 && raw > balance) {
      snackBarAlert("La empresa no tiene saldo suficiente para restar ese monto.", { variant: "warning" });
      return;
    }

    setPendingSigned(signed);
    setOpen(false);
  };

  const onSendReceipt = async () => {
    if (!companyId) return;

    const signed = Number(pendingSigned ?? 0);
    if (!Number.isFinite(signed) || signed === 0) {
      snackBarAlert("No hay cambios pendientes para enviar.", { variant: "warning" });
      return;
    }

    // revalidación rápida por si cambió el balance
    if (signed < 0 && Math.abs(signed) > balance) {
      snackBarAlert("La empresa ya no tiene saldo suficiente para este ajuste.", { variant: "warning" });
      return;
    }

    setSending(true);

    const { ok } = await onFetch(`companies/${companyId}/balance`, "PATCH", {
      data: { amount: signed },
    });

    setSending(false);
    if (!ok) return;

    snackBarAlert(
      signed > 0
        ? `Se enviará comprobante: +${signed} USD a ${selectedCompany?.name ?? "la empresa"}.`
        : `Se enviará comprobante: ${signed} USD a ${selectedCompany?.name ?? "la empresa"}.`,
      { variant: "success" }
    );

    setPendingSigned(0);
    onRefresh();
  };

  const canSend = Boolean(companyId) && hasPending && !sending;

  // habilitar acciones SIN pendiente
  const canAdd = Boolean(companyId) && !hasPending;
  const canSubtract = Boolean(companyId) && !hasPending && balance > 0;

  const tooltipSubtract = !companyId
    ? "Primero seleccioná una empresa."
    : hasPending
      ? "Ya hay un ajuste pendiente. Cancelalo o envialo."
      : balance <= 0
        ? "No podés restar porque la empresa tiene balance 0."
        : "Restar balance a la empresa: el ajuste quedará pendiente hasta enviar el comprobante.";

  const tooltipAdd = !companyId
    ? "Primero seleccioná una empresa."
    : hasPending
      ? "Ya hay un ajuste pendiente. Cancelalo o envialo."
      : "Agregar balance a la empresa: el ajuste quedará pendiente hasta enviar el comprobante.";

  const tooltipSend = !companyId
    ? "Primero seleccioná una empresa."
    : !hasPending
      ? "No hay cambios pendientes. Usá Agregar o Restar y confirmá el monto."
      : sending
        ? "Enviando…"
        : "Guarda el ajuste pendiente y envía el comprobante a la empresa.";

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

  const balanceCardSx = {
    p: 2.5,
    borderRadius: 3,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: (theme: any) => alpha(theme.palette.primary.main, 0.03),
    transition: 'all 0.3s ease',
    '&:hover': {
      bgcolor: (theme: any) => alpha(theme.palette.primary.main, 0.06),
      borderColor: 'primary.main',
    },
  };

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
    <LayerCardForm title={title} loading={loading || loadingCompany || sending} onBack={onBack}>
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
                  <BusinessIcon sx={{ color: 'white', fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography fontWeight={700} fontSize={18}>Empresa</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ajuste de balance corporativo
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
              Si la empresa no aparece en la lista, debe ser creada previamente{" "}
              <Box 
                component={RouterLink} 
                to="/admin/companies" 
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

            <Autocomplete
              options={companies}
              value={selectedCompany}
              loading={loading}
              isOptionEqualToValue={(o, v) => String(o.id) === String(v.id)}
              getOptionLabel={(o) => o?.name ?? "-"}
              onChange={(_, newVal) => {
                setCompanyId(String(newVal?.id ?? ""));
                setPendingSigned(0);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={isSuperAdmin ? "Seleccionar empresa" : "Mi empresa"}
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
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
              disabled={!isSuperAdmin && companies.length === 1}
            />

            {/* Balance */}
            <Box mt={3} sx={balanceCardSx}>
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
                  Balance actual
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
                  {previewBalance.toLocaleString("en-US", { maximumFractionDigits: 2 })}
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

              <Typography variant="body2" color="text.secondary" mt={1.5} sx={{ fontSize: 13 }}>
                Podés <b>agregar</b> o <b>restar</b> balance a la empresa seleccionada.
              </Typography>

              {hasPending && (
                <FormHelperText 
                  sx={{ 
                    mt: 1.5, 
                    color: pendingSigned > 0 ? "success.main" : "error.main",
                    fontWeight: 500,
                  }}
                >
                  Cambio pendiente: <b>{pendingSigned > 0 ? `+${pendingSigned}` : `${pendingSigned}`}</b> USD. Se aplicará
                  al presionar <b>Guardar y Enviar Comprobante</b>.
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
          {action === "add" ? "Agregar balance a la empresa" : "Restar balance a la empresa"}
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Box mt={1}>
            <TextField
              autoFocus
              label={action === "add" ? "Monto a agregar" : "Monto a restar"}
              fullWidth
              size="small"
              value={amount}
              onChange={(e) => setAmount(sanitizeNonNegative(e.target.value))}
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
                action === "subtract"
                  ? `Disponible empresa: ${balance.toLocaleString("en-US", { maximumFractionDigits: 2 })} USD`
                  : "Se aplicará al enviar el comprobante."
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
            disabled={!companyId}
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
