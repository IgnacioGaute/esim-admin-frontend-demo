import { AddOutlined, DeleteOutlineOutlined, RemoveOutlined } from '@mui/icons-material';
import { Avatar, Box, IconButton, Typography, alpha } from '@mui/material';

const ACCENT = '#6671E2';

interface Props {
  img:                  string;
  countryName:          string;
  description:          string;
  price:                number;
  quantity:             number;
  handleChangeQuantity: (type: '+' | '-') => void;
  onRemove:             () => void;
}

export const ItemCart = ({
  img, countryName, description, price, quantity,
  handleChangeQuantity, onRemove,
}: Props) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 1.5,
        py: 1.5,
        bgcolor: 'white',
        borderRadius: 3,
        border: '1.5px solid',
        borderColor: 'divider',
        transition: 'border-color 0.15s',
        '&:hover': { borderColor: alpha(ACCENT, 0.35) },
      }}
    >
      {/* Flag */}
      <Avatar src={img} sx={{ width: 40, height: 40, flexShrink: 0, border: '2px solid', borderColor: 'divider' }} />

      {/* Info */}
      <Box flex={1} minWidth={0}>
        <Typography variant="body2" fontWeight={700} noWrap>{countryName}</Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', lineHeight: 1.3, mb: 0.5 }}
        >
          {description}
        </Typography>
        <Typography variant="body2" fontWeight={800} sx={{ color: ACCENT }}>
          ${price.toFixed(2)}{' '}
          <span style={{ fontSize: '0.65rem', fontWeight: 400, color: '#888' }}>USD</span>
        </Typography>
      </Box>

      {/* Controls */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.75, flexShrink: 0 }}>
        <IconButton
          size="small"
          onClick={onRemove}
          sx={{
            color: '#dc2626', p: 0.4, borderRadius: 1.5,
            bgcolor: alpha('#dc2626', 0.07),
            '&:hover': { bgcolor: alpha('#dc2626', 0.14) },
          }}
        >
          <DeleteOutlineOutlined sx={{ fontSize: 16 }} />
        </IconButton>

        <Box
          sx={{
            display: 'flex', alignItems: 'center',
            border: '1.5px solid', borderColor: 'divider',
            borderRadius: 2, overflow: 'hidden',
          }}
        >
          <IconButton
            size="small"
            onClick={() => handleChangeQuantity('-')}
            sx={{
              borderRadius: 0, p: 0.4, color: 'text.secondary',
              '&:hover': { bgcolor: alpha(ACCENT, 0.07) },
            }}
          >
            <RemoveOutlined sx={{ fontSize: 14 }} />
          </IconButton>
          <Typography
            sx={{
              px: 1, minWidth: 28, textAlign: 'center',
              fontWeight: 700, fontSize: '0.82rem',
            }}
          >
            {quantity}
          </Typography>
          <IconButton
            size="small"
            onClick={() => handleChangeQuantity('+')}
            sx={{
              borderRadius: 0, p: 0.4, color: 'text.secondary',
              '&:hover': { bgcolor: alpha(ACCENT, 0.07) },
            }}
          >
            <AddOutlined sx={{ fontSize: 14 }} />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};
