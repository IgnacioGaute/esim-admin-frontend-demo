import { useEffect, useRef, useState } from 'react';
import {
  Avatar, Badge, Box, CircularProgress, IconButton,
  InputBase, Menu, MenuItem, Typography,
} from '@mui/material';
import { CloseOutlined, FilterListOutlined, SearchOutlined } from '@mui/icons-material';
import TravelMain from '@/assets/images/img-01.jpg';
import { ICountryData } from '@/store/utils/interfaces/country.interface';
import { useDebouncedValue } from '@/shared';

interface Props {
  countries:       ICountryData[]
  country?:        ICountryData | null;
  loadSearch:      boolean;
  onChangeSearch:  (value: string) => void;
  onSelectCountry: (country: ICountryData | null) => void;
  countFilter:     number;
  openFilter:      () => void;
  img?:            string;
}

export const PlanSearchCountry = ({
  countries, country, loadSearch, onChangeSearch,
  onSelectCountry, countFilter, openFilter, img,
}: Props) => {
  const [anchorEl, setAnchorEl]           = useState<null | HTMLElement>(null);
  const [searchCountry, setSearchCountry] = useState(country?.name || '');
  const search   = useDebouncedValue(searchCountry);
  const open     = Boolean(anchorEl);
  const refInput = useRef<HTMLDivElement>(null);
  const imgUrl   = img || TravelMain;

  const handleClose = (c?: ICountryData) => {
    if (c) onSelectCountry(c);
    setAnchorEl(null);
  };

  useEffect(() => {
    if (!country || search === '') onChangeSearch(search);
  }, [search]);

  useEffect(() => {
    if (country) setSearchCountry(country.name);
  }, [country]);

  useEffect(() => {
    if (country && search !== '') return;
    if (search !== '') setAnchorEl(refInput.current);
  }, [loadSearch, countries, search, country]);

  return (
    /* Outer wrapper — NO overflow hidden, permite que el ícono sobresalga */
    <Box
      sx={{
        position: 'relative',
        width: { md: '100%', xs: 'calc(100% + 32px)' },
        mx: { md: 0, xs: -2 },
        mt: { md: 0, xs: -2 },
        mb: country ? '30px' : 0,
      }}
    >
      {/* Hero con overflow:hidden solo para la imagen */}
      <Box
        sx={{
          position: 'relative',
          height: 300,
          backgroundImage: `url(${imgUrl})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: { md: 3, xs: 0 },
          overflow: 'hidden',
        }}
      >
        {/* Gradient overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 55%, rgba(0,0,0,0.5) 100%)',
          }}
        />

        {/* Texto + buscador */}
        <Box
          sx={{
            position: 'relative',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            px: 2,
          }}
        >
          <Typography
            variant="h5"
            fontWeight={700}
            sx={{ color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.45)', letterSpacing: '-0.3px' }}
          >
            Encuentra tu eSIM ideal
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'rgba(255,255,255,0.75)', mb: 0.5, textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
          >
            Conectividad en más de 150 destinos
          </Typography>

          {/* Search bar */}
          <Box
            ref={refInput}
            sx={{
              display: 'flex',
              alignItems: 'center',
              width: { md: 480, sm: 420, xs: '100%' },
              bgcolor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(255,255,255,0.35)',
              borderRadius: '999px',
              px: 2,
              py: 0.75,
              transition: 'border-color 0.2s, background 0.2s',
              '&:focus-within': {
                bgcolor: 'rgba(255,255,255,0.22)',
                borderColor: 'rgba(255,255,255,0.65)',
              },
            }}
          >
            {loadSearch ? (
              <CircularProgress size={18} sx={{ color: 'white', mr: 1.5, flexShrink: 0 }} />
            ) : (
              <SearchOutlined sx={{ color: 'rgba(255,255,255,0.8)', mr: 1.5, fontSize: 20, flexShrink: 0 }} />
            )}

            <InputBase
              fullWidth
              placeholder="Buscar destino..."
              value={searchCountry}
              onChange={(e) => setSearchCountry(e.target.value)}
              sx={{
                color: 'white',
                fontSize: '0.95rem',
                '& .MuiInputBase-input': {
                  p: 0,
                  '&::placeholder': { color: 'rgba(255,255,255,0.65)', opacity: 1 },
                },
              }}
              inputProps={{ 'aria-label': 'Buscar por destinos' }}
            />

            {searchCountry !== '' && (
              <IconButton
                size="small"
                onClick={() => setSearchCountry('')}
                sx={{ color: 'rgba(255,255,255,0.7)', p: 0.25, ml: 0.5, '&:hover': { color: 'white' } }}
              >
                <CloseOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            )}

            <IconButton
              onClick={openFilter}
              size="small"
              sx={{ display: { md: 'none', xs: 'flex' }, color: 'white', ml: 0.5, p: 0.5 }}
            >
              <Badge
                badgeContent={countFilter}
                color="info"
                sx={{ '& .MuiBadge-badge': { height: 14, minWidth: 14, fontSize: '0.55rem', p: 0 } }}
              >
                <FilterListOutlined sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Ícono del país — fuera del overflow:hidden, centrado en el borde inferior */}
      {country && (
        <Box
          sx={{
            position: 'absolute',
            bottom: -28,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            bgcolor: 'white',
            borderRadius: '50%',
            p: '4px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          }}
        >
          <Avatar src={country.flag} sx={{ width: 52, height: 52 }} />
        </Box>
      )}

      {/* Dropdown resultados */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => handleClose()}
        disablePortal
        MenuListProps={{ role: 'listbox', sx: { p: 0.5 } }}
        PaperProps={{
          elevation: 8,
          sx: {
            width: { md: 480, sm: 420, xs: 340 },
            mt: 0.5,
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            maxHeight: 260,
            overflow: 'auto',
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-thumb': { borderRadius: 3, bgcolor: 'divider' },
          },
        }}
      >
        {countries.length === 0 ? (
          <Box py={2.5} px={2} textAlign="center">
            <Typography variant="body2" color="text.secondary">No se encontraron resultados</Typography>
          </Box>
        ) : (
          countries.map((item, idx) => (
            <MenuItem
              key={idx}
              onClick={() => handleClose(item)}
              sx={{ borderRadius: 1.5, mx: 0.5, my: 0.25, gap: 1.5 }}
            >
              <Avatar src={item.flag} sx={{ width: 26, height: 26 }} />
              <Typography variant="body2" fontWeight={500}>{item.name}</Typography>
            </MenuItem>
          ))
        )}
      </Menu>
    </Box>
  );
};
