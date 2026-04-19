import {
  AddOutlined, AllInclusiveOutlined, CalendarMonthOutlined,
  CellTower, CellWifi, CloseOutlined, ImportExport,
  RemoveOutlined, ShoppingCartOutlined, PublicOutlined,
  CheckOutlined,
} from '@mui/icons-material';
import {
  Avatar, Box, Button, Chip, Dialog, Divider,
  IconButton, Slide, Tooltip, Typography, alpha,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import { IBundleData, ICountryData } from '@/store/utils/interfaces';
import React, { useState } from 'react';

const ACCENT = '#6671E2';

interface Props {
  opened:      boolean;
  handleClose: () => void;
  country?:    ICountryData | null;
  bundle?:     IBundleData | null;
  addCartItem: (bundle: IBundleData, quantity: number) => void;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement<any, any> },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const INFO_ITEMS = [
  { emoji: '⚙️', text: 'Configuración rápida y sencilla' },
  { emoji: '🚫', text: 'Sin cargos adicionales' },
  { emoji: '📦', text: 'Entrega inmediata' },
  { emoji: '👫', text: 'Podés compartir internet' },
  { emoji: '📱', text: 'Conservás tu número de WhatsApp' },
];

export const PlanBundleDesp = ({ opened, handleClose, country, bundle, addCartItem }: Props) => {
  const [qty,     setQty]     = useState(1);
  const [added,   setAdded]   = useState(false);
  const [showAll, setShowAll] = useState(false);

  const dataLabel = bundle?.unlimited
    ? 'Ilimitados'
    : bundle?.dataAmount
    ? `${(bundle.dataAmount * 0.001).toFixed(bundle.dataAmount * 0.001 % 1 === 0 ? 0 : 1)} GB`
    : 'N/A';

  const speedLabel = bundle?.speed
    ? Array.isArray(bundle.speed) && bundle.speed.length > 0
      ? bundle.speed.join(', ')
      : String(bundle.speed)
    : 'N/A';

  const hasRoaming   = (bundle?.roamingEnabled?.length ?? 0) > 0;
  const roamingCount = bundle?.roamingEnabled?.length ?? 0;

  const handleAdd = () => {
    if (!bundle) return;
    addCartItem(bundle, qty);
    setAdded(true);
    setTimeout(() => { setAdded(false); handleClose(); }, 1200);
  };

  return (
    <Dialog
      open={opened}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header con gradiente */}
      <Box
        sx={{
          background: bundle?.unlimited
            ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
            : `linear-gradient(135deg, #0F172A 0%, #1c1200 50%, ${ACCENT} 100%)`,
          px: 3,
          pt: 3,
          pb: 3,
          position: 'relative',
        }}
      >
        {/* Close */}
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            position: 'absolute', top: 12, right: 12,
            color: 'rgba(255,255,255,0.7)',
            bgcolor: 'rgba(255,255,255,0.1)',
            borderRadius: 2,
            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)', color: 'white' },
          }}
        >
          <CloseOutlined fontSize="small" />
        </IconButton>

        {/* País */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Avatar src={country?.flag} sx={{ width: 36, height: 36, border: '2px solid rgba(255,255,255,0.4)' }} />
          <Typography fontWeight={700} fontSize="1rem" color="white">
            {country?.name}
          </Typography>
        </Box>

        {/* Precio */}
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
          <Typography fontWeight={800} fontSize="2.4rem" color="white" lineHeight={1}>
            ${bundle?.price?.toFixed(2)}
          </Typography>
          <Typography fontSize="0.8rem" color="rgba(255,255,255,0.6)" mb={0.5}>USD</Typography>
        </Box>

        {bundle?.unlimited && (
          <Chip
            label="Datos Ilimitados"
            size="small"
            icon={<AllInclusiveOutlined sx={{ fontSize: '12px !important', color: '#059669 !important' }} />}
            sx={{
              mt: 1, height: 22, fontSize: '0.7rem', fontWeight: 700,
              bgcolor: 'rgba(255,255,255,0.9)', color: '#059669',
            }}
          />
        )}
      </Box>

      {/* Contenido scrollable */}
      <Box sx={{ overflowY: 'auto', flex: 1 }}>

      {/* Detalles */}
      <Box sx={{ px: 3, pt: 2, pb: 1 }}>
        <Box
          sx={{
            bgcolor: 'white',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
          }}
        >
          <DetailRow
            icon={<ImportExport sx={{ fontSize: 16, color: ACCENT }} />}
            label="Datos"
            value={dataLabel}
            highlight={bundle?.unlimited}
          />
          <Divider />
          <DetailRow
            icon={<CalendarMonthOutlined sx={{ fontSize: 16, color: ACCENT }} />}
            label="Vigencia"
            value={bundle?.duration ? `${bundle.duration} días` : 'N/A'}
          />
          <Divider />
          <DetailRow
            icon={<CellWifi sx={{ fontSize: 16, color: ACCENT }} />}
            label="Red"
            value={speedLabel}
          />
          <Divider />
          <DetailRow
            icon={<CellTower sx={{ fontSize: 16, color: ACCENT }} />}
            label="Roaming"
            value={hasRoaming ? `Sí (${roamingCount} países)` : 'No'}
            valueColor={hasRoaming ? '#059669' : undefined}
          />

          {/* Países con roaming */}
          {hasRoaming && (
            <Box sx={{ px: 2, pb: 1.5, pt: 0.5 }}>
              <Button
                size="small"
                startIcon={<PublicOutlined sx={{ fontSize: '14px !important' }} />}
                onClick={() => setShowAll(!showAll)}
                sx={{
                  textTransform: 'none', fontSize: '0.75rem', fontWeight: 600,
                  color: ACCENT, p: 0, mb: showAll ? 1 : 0,
                  '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' },
                }}
              >
                {showAll ? 'Ocultar países' : `Ver los ${roamingCount} países`}
              </Button>
              {showAll && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {bundle?.roamingEnabled.map((item, idx) => (
                    <Chip
                      key={idx}
                      label={item.name}
                      size="small"
                      sx={{
                        height: 22, fontSize: '0.68rem',
                        bgcolor: alpha(ACCENT, 0.07), color: 'text.secondary',
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Info bullets */}
      <Box sx={{ px: 3, py: 1.5 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 0.75,
          }}
        >
          {INFO_ITEMS.map((item, idx) => (
            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Typography fontSize="0.8rem">{item.emoji}</Typography>
              <Typography fontSize="0.72rem" color="text.secondary">{item.text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      </Box> {/* fin scrollable */}

      <Divider />

      {/* Footer: cantidad + agregar */}
      {bundle && (
        <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Quantity */}
          <Box
            sx={{
              display: 'flex', alignItems: 'center',
              border: '1.5px solid', borderColor: 'divider',
              borderRadius: 2, overflow: 'hidden',
            }}
          >
            <IconButton
              size="small"
              onClick={() => setQty(Math.max(1, qty - 1))}
              sx={{ borderRadius: 0, p: 0.75, color: 'text.secondary', '&:hover': { bgcolor: alpha(ACCENT, 0.07) } }}
            >
              <RemoveOutlined sx={{ fontSize: 16 }} />
            </IconButton>
            <Typography sx={{ px: 1.5, fontWeight: 700, minWidth: 32, textAlign: 'center' }}>{qty}</Typography>
            <IconButton
              size="small"
              onClick={() => setQty(qty + 1)}
              sx={{ borderRadius: 0, p: 0.75, color: 'text.secondary', '&:hover': { bgcolor: alpha(ACCENT, 0.07) } }}
            >
              <AddOutlined sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          {/* Total */}
          <Box flex={1}>
            <Typography fontSize="0.68rem" color="text.secondary">Total</Typography>
            <Typography fontWeight={800} fontSize="1.1rem" sx={{ color: ACCENT, lineHeight: 1.1 }}>
              ${(bundle.price * qty).toFixed(2)} <span style={{ fontSize: '0.7rem', fontWeight: 400, color: '#888' }}>USD</span>
            </Typography>
          </Box>

          {/* Agregar */}
          <Button
            variant="contained"
            disableElevation
            startIcon={added ? <CheckOutlined /> : <ShoppingCartOutlined />}
            onClick={handleAdd}
            sx={{
              borderRadius: 2.5,
              textTransform: 'none',
              fontWeight: 700,
              px: 2.5,
              bgcolor: added ? '#10B981' : ACCENT,
              transition: 'background 0.3s',
              '&:hover': { bgcolor: added ? '#059669' : '#5560d0' },
            }}
          >
            {added ? '¡Listo!' : 'Agregar'}
          </Button>
        </Box>
      )}
    </Dialog>
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
  <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.25 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
      {icon}
      <Typography variant="body2" fontWeight={500} color="text.secondary" fontSize="0.83rem">
        {label}
      </Typography>
    </Box>
    <Typography
      variant="body2"
      fontWeight={700}
      fontSize="0.83rem"
      sx={{ color: valueColor ?? (highlight ? '#059669' : 'text.primary') }}
    >
      {value}
    </Typography>
  </Box>
);
