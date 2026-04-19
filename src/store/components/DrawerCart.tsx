import { ReactNode } from 'react';
import {
  DeleteOutlineOutlined, CloseOutlined,
  ShoppingCartOutlined, ArrowForwardOutlined,
} from '@mui/icons-material';
import {
  Badge, Box, Button, Drawer, IconButton, Typography, alpha, Divider,
} from '@mui/material';
import { ItemCeroCart } from './ItemCeroCart';

const ACCENT = '#6671E2';

interface Props {
  open:          boolean;
  children?:     ReactNode;
  onClose:       () => void;
  isMobile?:     boolean;
  countCart:     number;
  total:         number;
  onRemoveItems: () => void;
  onCheckout:    () => void;
}

export const DrawerCart = ({
  open, children, onClose, isMobile,
  countCart, total, onRemoveItems, onCheckout,
}: Props) => {
  const drawerWidth = 400;

  return (
    <Drawer
      variant="temporary"
      anchor="right"
      open={open}
      sx={{
        '& .MuiDrawer-paper': {
          width: isMobile ? '100%' : drawerWidth,
          bgcolor: '#F8F9FF',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          background: `linear-gradient(135deg, #0F172A 0%, #1e1b4b 100%)`,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 38, height: 38, borderRadius: 2,
            bgcolor: alpha(ACCENT, 0.3),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <ShoppingCartOutlined sx={{ color: 'white', fontSize: 20 }} />
        </Box>
        <Box flex={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography fontWeight={700} fontSize="1rem" color="white">
              Carrito
            </Typography>
            {countCart > 0 && (
              <Box
                sx={{
                  px: 1, height: 20, borderRadius: '999px',
                  bgcolor: ACCENT, display: 'flex', alignItems: 'center',
                }}
              >
                <Typography fontSize="0.65rem" fontWeight={700} color="white">
                  {countCart} {countCart === 1 ? 'item' : 'items'}
                </Typography>
              </Box>
            )}
          </Box>
          {countCart > 0 && (
            <Typography fontSize="0.72rem" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              Total: ${total.toFixed(2)} USD
            </Typography>
          )}
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'rgba(255,255,255,0.7)',
            bgcolor: 'rgba(255,255,255,0.1)',
            borderRadius: 2,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)', color: 'white' },
          }}
        >
          <CloseOutlined fontSize="small" />
        </IconButton>
      </Box>

      {/* Items */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 2 }}>
        {countCart === 0 ? (
          <ItemCeroCart />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {children}
          </Box>
        )}
      </Box>

      {/* Footer */}
      {countCart > 0 && (
        <Box sx={{ flexShrink: 0, bgcolor: 'white', borderTop: '1px solid', borderColor: 'divider' }}>
          {/* Vaciar carrito */}
          {countCart > 3 && (
            <Box sx={{ px: 2.5, pt: 1.5 }}>
              <Button
                size="small"
                onClick={onRemoveItems}
                startIcon={<DeleteOutlineOutlined sx={{ fontSize: '15px !important' }} />}
                sx={{
                  textTransform: 'none', fontSize: '0.75rem', fontWeight: 600,
                  color: '#dc2626', bgcolor: alpha('#dc2626', 0.07),
                  borderRadius: 2, px: 1.5,
                  '&:hover': { bgcolor: alpha('#dc2626', 0.12) },
                }}
              >
                Vaciar carrito
              </Button>
            </Box>
          )}

          {/* Total */}
          <Box sx={{ px: 2.5, pt: 2, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Subtotal ({countCart} {countCart === 1 ? 'item' : 'items'})
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                ${total.toFixed(2)} USD
              </Typography>
            </Box>
            <Box
              sx={{
                display: 'flex', alignItems: 'baseline',
                justifyContent: 'space-between', mb: 2,
              }}
            >
              <Typography fontWeight={700} fontSize="1rem">Total</Typography>
              <Box sx={{ textAlign: 'right' }}>
                <Typography fontWeight={800} fontSize="1.5rem" sx={{ color: ACCENT, lineHeight: 1 }}>
                  ${total.toFixed(2)}
                </Typography>
                <Typography fontSize="0.7rem" color="text.secondary">USD</Typography>
              </Box>
            </Box>

            <Button
              size="large"
              variant="contained"
              fullWidth
              disableElevation
              endIcon={<ArrowForwardOutlined />}
              onClick={onCheckout}
              sx={{
                borderRadius: 2.5, textTransform: 'none', fontWeight: 700,
                fontSize: '0.95rem', mb: 1,
                bgcolor: ACCENT, '&:hover': { bgcolor: '#5560d0' },
              }}
            >
              Comprar ahora
            </Button>
            <Button
              size="medium"
              variant="text"
              fullWidth
              onClick={onClose}
              sx={{
                textTransform: 'none', fontWeight: 500,
                color: 'text.secondary', borderRadius: 2,
                '&:hover': { bgcolor: alpha('#000', 0.04) },
              }}
            >
              Continuar comprando
            </Button>
          </Box>
        </Box>
      )}
    </Drawer>
  );
};
