import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import {
  Alert, Avatar, Box, Breadcrumbs, Button, Chip, Container,
  Dialog, Divider, Grid, IconButton, Link, Paper, Typography, alpha,
} from '@mui/material';
import {
  AccountBalanceWalletOutlined, ArrowForwardOutlined,
  CheckCircleOutlined, Close as CloseIcon, InventoryOutlined,
  PaidOutlined, ShoppingBagOutlined, SimCardOutlined, StoreOutlined,
} from '@mui/icons-material';
import Logo2x from '@/assets/images/logo/logo-2x.png';
import { useFetch, useNotiAlert } from '@/shared/hooks';
import { BoxLoading } from '@/shared/components/BoxLoading';
import { useCart } from '../hooks';
import { ItemCart, ItemCeroCart } from '../components';
import { getDescriptionBundle, IWalletData, ICheckputProduct, ICheckoutDataSend } from '../utils';

const ACCENT = '#6671E2';

export const CheckoutPage = () => {
  const [load, setLoad]                     = useState({ loading: false, text: '' });
  const [dataCheckout, setDataCheckout]     = useState<ICheckoutDataSend | undefined>();
  const [openSuccessModal, setOpenSuccessModal] = useState(false);

  const navigate = useNavigate();
  const { snackBarAlert } = useNotiAlert();
  const { countCart, totalCart, itemsCart, removeItem, addNewItem, removeAllItems } = useCart();

  const { data: user } = useFetch<{ id: string }>('auth/me', 'get', { init: true });
  const { data: balance, loading: loadBalance } = useFetch<{ wallet: IWalletData }>(
    `wallets/reseller/${user?.id}`, 'get', { init: user !== undefined }
  );
  const { data, clearCache, error } = useFetch<any, ICheckoutDataSend>('checkout/create', 'post', {
    init: dataCheckout !== undefined,
    body: dataCheckout,
    cache: { enabled: false },
  });

  const wallet = useMemo(() => balance?.wallet, [balance]);

  const canBuy = wallet && countCart > 0;

  const hasEnoughBalance = wallet ? Number(wallet.balance) >= totalCart : false;

  useEffect(() => {
    setLoad({ loading: loadBalance, text: 'Obteniendo balance...' });
  }, [loadBalance]);

  const onCreateCheckout = () => {
    setLoad({ loading: true, text: 'Procesando compra...' });
    const products: ICheckputProduct[] = itemsCart.map(({ item: { name, price }, quantity }) => ({
      price, name, quantity,
    }));
    setDataCheckout({ esims: [], lang: 'es', channel: 'RESELLER', action: 'NEW', type: 'ESIM', products });
  };

  useEffect(() => {
    if (data) {
      setLoad(v => ({ ...v, loading: false }));
      snackBarAlert('Compra exitosa', { variant: 'success' });
      setTimeout(() => removeAllItems(), 1000);
      setOpenSuccessModal(true);
    }
    if (error) {
      setLoad(v => ({ ...v, loading: false }));
      setDataCheckout(undefined);
    }
    return () => { if (data) clearCache(); };
  }, [data, error]);

  return (
    <Box sx={{ minHeight: 'calc(100vh - 64px)', bgcolor: '#F4F6FB', py: 3 }}>
      <Container maxWidth="lg">

        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3, mb: 3, borderRadius: 3,
            border: '1px solid', borderColor: 'divider',
            display: 'flex', alignItems: 'center', gap: 3,
          }}
        >
          <Box height={44}>
            <img src={Logo2x} alt="eSIM Demo" style={{ height: '100%', objectFit: 'contain' }} />
          </Box>
          <Divider orientation="vertical" flexItem />
          <Breadcrumbs>
            <Link
              underline="hover"
              color="inherit"
              component="button"
              onClick={() => navigate(-1)}
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.85rem' }}
            >
              <StoreOutlined sx={{ fontSize: 16 }} />
              Tienda
            </Link>
            <Typography
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.85rem', color: ACCENT, fontWeight: 600 }}
            >
              <PaidOutlined sx={{ fontSize: 16 }} />
              Checkout
            </Typography>
          </Breadcrumbs>
        </Paper>

        <Grid container spacing={3} alignItems="flex-start">
          {/* Columna items */}
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              {/* Header items */}
              <Box
                sx={{
                  px: 2.5, py: 2,
                  background: `linear-gradient(135deg, #0F172A 0%, #1e1b4b 100%)`,
                  display: 'flex', alignItems: 'center', gap: 1.5,
                }}
              >
                <ShoppingBagOutlined sx={{ color: 'white', fontSize: 20 }} />
                <Typography fontWeight={700} color="white">
                  Tu pedido
                </Typography>
                {countCart > 0 && (
                  <Chip
                    label={`${countCart} ${countCart === 1 ? 'item' : 'items'}`}
                    size="small"
                    sx={{
                      height: 20, fontSize: '0.65rem', fontWeight: 700,
                      bgcolor: alpha(ACCENT, 0.5), color: 'white',
                    }}
                  />
                )}
              </Box>

              {/* Lista */}
              <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 420, overflowY: 'auto' }}>
                {countCart === 0 ? (
                  <ItemCeroCart />
                ) : (
                  itemsCart.map(({ item, quantity }, idx) => (
                    <ItemCart
                      key={idx}
                      img={item.country.flag}
                      countryName={item.country.name}
                      description={getDescriptionBundle(item)}
                      price={item.price}
                      quantity={quantity}
                      handleChangeQuantity={(action) => {
                        if (action === '-') { addNewItem(item, quantity - 1, '-'); return; }
                        addNewItem(item, quantity + 1, '+');
                      }}
                      onRemove={() => removeItem(item)}
                    />
                  ))
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Columna resumen */}
          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
              {/* Header resumen */}
              <Box
                sx={{
                  px: 2.5, py: 2,
                  background: `linear-gradient(135deg, #0F172A 0%, #1e1b4b 100%)`,
                }}
              >
                <Typography fontWeight={700} color="white">Resumen de compra</Typography>
              </Box>

              <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Balance */}
                <Box
                  sx={{
                    p: 2, borderRadius: 2.5,
                    bgcolor: alpha(ACCENT, 0.05),
                    border: '1.5px solid', borderColor: alpha(ACCENT, 0.15),
                    display: 'flex', alignItems: 'center', gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 42, height: 42, borderRadius: 2,
                      bgcolor: alpha('#26abe2', 0.15),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <AccountBalanceWalletOutlined sx={{ color: '#26abe2', fontSize: 22 }} />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      Balance disponible
                    </Typography>
                    <Typography fontWeight={800} fontSize="1.05rem" sx={{ lineHeight: 1.2 }}>
                      ${wallet?.balance ? Number(wallet.balance).toFixed(2) : '0.00'}
                      <span style={{ fontSize: '0.7rem', fontWeight: 400, color: '#888', marginLeft: 4 }}>USD</span>
                    </Typography>
                  </Box>
                  <Chip
                    label={wallet?.isActive ? 'Activo' : 'Inactivo'}
                    size="small"
                    sx={{
                      height: 22, fontSize: '0.7rem', fontWeight: 700,
                      bgcolor: wallet?.isActive ? alpha('#10B981', 0.1) : alpha('#ef4444', 0.1),
                      color: wallet?.isActive ? '#059669' : '#dc2626',
                    }}
                  />
                </Box>

                {/* Desglose */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {itemsCart.map(({ item, quantity }, idx) => (
                    <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: '65%' }}>
                        {item.country.name} × {quantity}
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        ${(item.price * quantity).toFixed(2)}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Divider />

                {/* Total */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography fontWeight={700} fontSize="1rem">Total</Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography fontWeight={800} fontSize="1.6rem" sx={{ color: ACCENT, lineHeight: 1 }}>
                      ${totalCart.toFixed(2)}
                    </Typography>
                    <Typography fontSize="0.7rem" color="text.secondary">USD</Typography>
                  </Box>
                </Box>

                {/* Alerta sin balance */}
                {!hasEnoughBalance && countCart > 0 && (
                  <Alert severity="warning" sx={{ borderRadius: 2, fontSize: '0.78rem', py: 0.5 }}>
                    Balance insuficiente para completar la compra.
                  </Alert>
                )}

                {/* Botón comprar */}
                <Button
                  fullWidth
                  size="large"
                  variant="contained"
                  disableElevation
                  disabled={!canBuy || !hasEnoughBalance}
                  endIcon={<ArrowForwardOutlined />}
                  onClick={onCreateCheckout}
                  sx={{
                    borderRadius: 2.5, textTransform: 'none',
                    fontWeight: 700, fontSize: '1rem',
                    bgcolor: ACCENT, '&:hover': { bgcolor: '#5560d0' },
                    '&.Mui-disabled': { bgcolor: alpha(ACCENT, 0.25), color: 'white' },
                  }}
                >
                  Comprar ahora
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <BoxLoading isLoading={load.loading} title={load.text} position="fixed" />

      {/* Modal éxito */}
      <Dialog
        open={openSuccessModal}
        onClose={() => setOpenSuccessModal(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, overflow: 'hidden' } }}
      >
        {/* Header verde */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
            px: 3, pt: 4, pb: 5, textAlign: 'center', position: 'relative',
          }}
        >
          <IconButton
            onClick={() => setOpenSuccessModal(false)}
            size="small"
            sx={{
              position: 'absolute', top: 12, right: 12,
              color: 'rgba(255,255,255,0.7)', bgcolor: 'rgba(255,255,255,0.15)',
              borderRadius: 2,
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
          <Box
            sx={{
              width: 64, height: 64, borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 2,
            }}
          >
            <CheckCircleOutlined sx={{ color: 'white', fontSize: 36 }} />
          </Box>
          <Typography fontWeight={800} fontSize="1.4rem" color="white">¡Compra exitosa!</Typography>
          <Typography fontSize="0.85rem" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
            Tus eSIMs ya están en tu inventario
          </Typography>
        </Box>

        {/* Acciones */}
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            variant="contained"
            fullWidth
            disableElevation
            startIcon={<SimCardOutlined />}
            onClick={() => { setOpenSuccessModal(false); navigate('/admin/esim-inventory'); }}
            sx={{
              borderRadius: 2.5, textTransform: 'none', fontWeight: 700,
              bgcolor: ACCENT, '&:hover': { bgcolor: '#5560d0' },
            }}
          >
            Ver mi inventario
          </Button>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<StoreOutlined />}
            onClick={() => { setOpenSuccessModal(false); navigate('/store'); }}
            sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 600, borderColor: alpha(ACCENT, 0.4), color: ACCENT }}
          >
            Seguir comprando
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
};
