import React, { useState } from 'react';
import {
  AddOutlined, AddShoppingCartOutlined, CalendarMonthOutlined,
  CellTower, CellWifi, ImportExport, RemoveOutlined, WifiOutlined,
  AllInclusiveOutlined, CheckOutlined,
} from '@mui/icons-material';
import { Badge, Box, Button, Chip, IconButton, Menu, Typography, alpha } from '@mui/material';
import { IBundleData } from '@/store/utils/interfaces/bundle.interface';

const ACCENT = '#6671E2';

interface Props {
  bundle:      IBundleData;
  onDetail:    (bundle: IBundleData) => void;
  addCartItem: (bundle: IBundleData, quantity: number) => void;
}

export const PlanCardBundle = ({ bundle, onDetail, addCartItem }: Props) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [qty, setQty]           = useState(1);
  const [added, setAdded]       = useState(false);
  const open = Boolean(anchorEl);

  const dataLabel = bundle.unlimited
    ? 'Ilimitados'
    : `${(bundle.dataAmount * 0.001).toFixed(bundle.dataAmount * 0.001 % 1 === 0 ? 0 : 1)} GB`;

  const speedLabel =
    bundle?.speed
      ? Array.isArray(bundle.speed) && bundle.speed.length > 0
        ? bundle.speed.join(', ')
        : String(bundle.speed)
      : 'N/A';

  const hasRoaming = bundle.roamingEnabled?.length > 0;

  const handleAdd = () => {
    addCartItem(bundle, qty);
    setAdded(true);
    setAnchorEl(null);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <Box
      onClick={() => onDetail(bundle)}
      sx={{
        position: 'relative',
        borderRadius: 3,
        border: '1.5px solid',
        borderColor: 'divider',
        bgcolor: 'white',
        overflow: 'hidden',
        cursor: 'pointer',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: ACCENT,
          boxShadow: `0 8px 24px ${alpha(ACCENT, 0.15)}`,
          transform: 'translateY(-2px)',
        },
      }}
    >
      {/* Top accent bar */}
      <Box
        sx={{
          height: 4,
          background: bundle.unlimited
            ? `linear-gradient(90deg, #10B981, #059669)`
            : `linear-gradient(90deg, ${ACCENT}, #4f5bd5)`,
        }}
      />

      {/* Header */}
      <Box sx={{ px: 2, pt: 1.75, pb: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
            <Typography fontWeight={800} fontSize="1.5rem" sx={{ color: bundle.unlimited ? '#059669' : ACCENT, lineHeight: 1 }}>
              ${bundle.price.toFixed(2)}
            </Typography>
            <Typography fontSize="0.7rem" color="text.secondary" fontWeight={500}>USD</Typography>
          </Box>
          {bundle.unlimited && (
            <Chip
              label="Ilimitado"
              size="small"
              icon={<AllInclusiveOutlined sx={{ fontSize: '12px !important' }} />}
              sx={{
                mt: 0.5, height: 20, fontSize: '0.65rem', fontWeight: 700,
                bgcolor: alpha('#10B981', 0.1), color: '#059669',
                border: `1px solid ${alpha('#10B981', 0.25)}`,
                '& .MuiChip-icon': { color: '#059669' },
              }}
            />
          )}
        </Box>

        {/* Cart button */}
        <Box onClick={(e) => e.stopPropagation()}>
          <IconButton
            size="small"
            id="cart-btn"
            aria-controls={open ? 'cart-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={(e) => { e.stopPropagation(); setAnchorEl(e.currentTarget); }}
            sx={{
              bgcolor: added ? alpha('#10B981', 0.12) : alpha(ACCENT, 0.08),
              color: added ? '#059669' : ACCENT,
              borderRadius: 2,
              transition: 'all 0.2s',
              '&:hover': { bgcolor: added ? alpha('#10B981', 0.18) : alpha(ACCENT, 0.15) },
            }}
          >
            <Badge
              badgeContent={qty > 1 ? qty : 0}
              color="info"
              sx={{ '& .MuiBadge-badge': { height: 14, minWidth: 14, fontSize: '0.52rem', p: 0 } }}
            >
              {added ? <CheckOutlined fontSize="small" /> : <AddShoppingCartOutlined fontSize="small" />}
            </Badge>
          </IconButton>

          <Menu
            id="cart-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={() => setAnchorEl(null)}
            onClick={(e) => e.stopPropagation()}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              elevation: 8,
              sx: {
                mt: 0.75, borderRadius: 2.5, border: '1px solid', borderColor: 'divider',
                minWidth: 200, overflow: 'visible',
                '&::before': {
                  content: '""', display: 'block', position: 'absolute',
                  top: -6, right: 12, width: 12, height: 12,
                  bgcolor: 'background.paper', transform: 'rotate(45deg)',
                  borderLeft: '1px solid', borderTop: '1px solid', borderColor: 'divider',
                },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing="0.05em">
                Cantidad
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, border: '1.5px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                <IconButton
                  size="small"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  sx={{ borderRadius: 0, p: 1, color: 'text.secondary', '&:hover': { bgcolor: alpha(ACCENT, 0.07) } }}
                >
                  <RemoveOutlined fontSize="small" />
                </IconButton>
                <Typography flex={1} textAlign="center" fontWeight={700} fontSize="0.95rem">{qty}</Typography>
                <IconButton
                  size="small"
                  onClick={() => setQty(qty + 1)}
                  sx={{ borderRadius: 0, p: 1, color: 'text.secondary', '&:hover': { bgcolor: alpha(ACCENT, 0.07) } }}
                >
                  <AddOutlined fontSize="small" />
                </IconButton>
              </Box>
              <Button
                variant="contained"
                fullWidth
                disableElevation
                onClick={handleAdd}
                sx={{
                  borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '0.82rem',
                  bgcolor: ACCENT, '&:hover': { bgcolor: '#5560d0' },
                }}
              >
                Agregar al carrito
              </Button>
            </Box>
          </Menu>
        </Box>
      </Box>

      {/* Divider */}
      <Box sx={{ mx: 2, borderBottom: '1px dashed', borderColor: alpha('#000', 0.08), mb: 1.25 }} />

      {/* Details — flex:1 para empujar y que todos los cards tengan igual alto */}
      <Box sx={{ px: 2, pb: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.75, justifyContent: 'flex-end' }}>
        <DetailRow
          icon={<ImportExport sx={{ fontSize: 14 }} />}
          label="Datos"
          value={dataLabel}
          highlight={bundle.unlimited}
        />
        <DetailRow
          icon={<CalendarMonthOutlined sx={{ fontSize: 14 }} />}
          label="Vigencia"
          value={`${bundle.duration} días`}
        />
        <DetailRow
          icon={<CellWifi sx={{ fontSize: 14 }} />}
          label="Red"
          value={speedLabel}
        />
        <DetailRow
          icon={<CellTower sx={{ fontSize: 14 }} />}
          label="Roaming"
          value={hasRoaming ? 'Sí' : 'No'}
          valueColor={hasRoaming ? '#059669' : undefined}
        />
      </Box>
    </Box>
  );
};

const DetailRow = ({
  icon, label, value, highlight, valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  valueColor?: string;
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
      {icon}
      <Typography variant="caption" color="text.secondary" fontWeight={500} fontSize="0.78rem">
        {label}
      </Typography>
    </Box>
    <Typography
      variant="caption"
      fontWeight={highlight ? 700 : 600}
      fontSize="0.78rem"
      sx={{ color: valueColor ?? (highlight ? '#059669' : 'text.primary') }}
    >
      {value}
    </Typography>
  </Box>
);
