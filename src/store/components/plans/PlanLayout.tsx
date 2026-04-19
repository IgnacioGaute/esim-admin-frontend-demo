import React, { ReactNode, useEffect, useMemo, useState } from 'react'
import {
  Avatar, Box, Button, Chip, CircularProgress, Drawer,
  IconButton, Switch, Typography, alpha,
} from '@mui/material';
import {
  CloseOutlined, FilterAltOutlined, LocationOnOutlined,
  AccessTimeOutlined, WifiOutlined,
} from '@mui/icons-material';
import Logo2x from '@/assets/images/logo/logo-2x.png';
import { useScreenSize } from '@/shared/hooks';
import { DrawerHeaderPrimary, MainByDrawer } from '@/shared/components';
import { ICountryData } from '@/store/utils/interfaces/country.interface';
import { IWalletData } from '@/store/utils';

export type TypeDayFilter = 'all' | '1-3' | '3-5' | '5-7' | '7-10' | '10-15' | '15-30' | '30+' | '';

export interface ITypeDataFilter {
  days?:      TypeDayFilter;
  unlimited?: boolean;
  roaming?:   boolean;
}

interface Props {
  open:             boolean;
  children:         ReactNode;
  onClose:          () => void;
  countries:        ICountryData[];
  loadCountry:      boolean;
  isPersistent?:    boolean;
  isMobile?:        boolean;
  enabledDrawer?:   boolean;
  onSelectCountry:  (country: ICountryData | null) => void;
  country?:         ICountryData | null;
  onChangeFilter?:  (values: ITypeDataFilter) => void;
  valuesFilter?:    ITypeDataFilter | null;
  wallet?:          IWalletData;
}

interface IValuesFilter {
  type:     'country' | 'days' | 'unlimited' | 'roaming';
  value:    string;
  name:     string;
  deleted?: boolean;
}

const ACCENT = '#6671E2';

const VALUES_DAY_FILTER: { type: TypeDayFilter; name: string }[] = [
  { type: 'all',   name: 'Cualquier día' },
  { type: '1-3',   name: '1–3 días'     },
  { type: '3-5',   name: '3–5 días'     },
  { type: '5-7',   name: '5–7 días'     },
  { type: '7-10',  name: '7–10 días'    },
  { type: '10-15', name: '10–15 días'   },
  { type: '15-30', name: '15–30 días'   },
  { type: '30+',   name: '30+ días'     },
];

export const PlanLayout = ({
  open, children, onClose, countries, loadCountry,
  isPersistent = true, isMobile = false, enabledDrawer = false,
  onSelectCountry, country, onChangeFilter, valuesFilter, wallet,
}: Props) => {
  const drawerWidth = 272;

  const [unlimited,     setUnlimited]     = useState(false);
  const [roaming,       setRoaming]       = useState(false);
  const [days,          setDays]          = useState<TypeDayFilter>('');
  const [countrySelect, setCountrySelect] = useState<ICountryData | null>(null);

  // no useEffect for countrySelect — called directly on click

  useEffect(() => {
    if (!country && countrySelect) setCountrySelect(null);
  }, [country]);

  useEffect(() => {
    if (onChangeFilter) onChangeFilter({ days, unlimited, roaming });
  }, [unlimited, days, roaming]);

  useEffect(() => {
    if (!valuesFilter) onDeleteChip('all');
  }, [valuesFilter]);

  const valuesFilters = useMemo(() => {
    const values: IValuesFilter[] = [];

    if (days) {
      const find = VALUES_DAY_FILTER.find((v) => v.type === days);
      if (find) values.push({ type: 'days', value: days, name: find.name, deleted: days !== 'all' });
    }
    if (unlimited) values.push({ type: 'unlimited', value: 'true', name: 'Ilimitados', deleted: true });
    if (roaming)   values.push({ type: 'roaming',   value: 'true', name: 'Roaming',    deleted: true });
    if (countrySelect) values.push({ type: 'country', value: countrySelect.iso, name: countrySelect.name, deleted: true });

    return values;
  }, [unlimited, days, countrySelect, roaming]);

  const onDeleteChip = (type: 'country' | 'days' | 'unlimited' | 'all' | 'roaming') => {
    if (type === 'days' || type === 'all') setDays('');
    if (type === 'unlimited' || type === 'all') setUnlimited(false);
    if (type === 'roaming' || type === 'all') setRoaming(false);
    if (type === 'country' || type === 'all') setCountrySelect(null);
  };

  const activeCount = valuesFilters.filter((v) => v.deleted).length;

  return (
    <Box width="100%" sx={{ display: 'flex', position: 'relative' }}>
      <Drawer
        sx={{
          width: drawerWidth,
          height: `calc(100vh - ${enabledDrawer ? '0' : '65px'})`,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: isMobile ? '100%' : drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            marginTop: enabledDrawer ? '0' : '65px',
            pb: 8,
            bgcolor: '#FAFBFF',
          },
        }}
        variant={isPersistent ? 'persistent' : 'temporary'}
        anchor="left"
        open={open}
      >
        {/* Mobile header */}
        <Box
          sx={{
            display: { md: 'none', xs: 'flex' },
            alignItems: 'center',
            px: 2,
            py: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'white',
          }}
        >
          <Box flex={1} height={36}>
            <img src={Logo2x} alt="eSIM Demo" style={{ height: '100%', objectFit: 'contain' }} />
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseOutlined fontSize="small" />
          </IconButton>
        </Box>

        {/* Balance */}
        <Box
          sx={{
            mx: 1.5,
            mt: 2,
            mb: 1,
            p: 1.5,
            borderRadius: 2.5,
            background: `linear-gradient(135deg, ${ACCENT} 0%, #4f5bd5 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
            Balance disponible
          </Typography>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: 'white' }}>
            ${wallet?.balance ? Number(wallet.balance).toFixed(2) : '0.00'}{' '}
            <span style={{ fontWeight: 400, opacity: 0.7, fontSize: '0.7rem' }}>USD</span>
          </Typography>
        </Box>

        {/* Filter header */}
        <Box
          sx={{
            px: 2,
            pt: 1.5,
            pb: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <FilterAltOutlined sx={{ fontSize: 16, color: ACCENT }} />
            <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Filtros
            </Typography>
            {activeCount > 0 && (
              <Box
                sx={{
                  width: 18, height: 18, borderRadius: '50%',
                  bgcolor: ACCENT, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Typography sx={{ fontSize: '0.62rem', color: 'white', fontWeight: 700 }}>{activeCount}</Typography>
              </Box>
            )}
          </Box>
          {activeCount > 0 && (
            <Button
              size="small"
              onClick={() => { onDeleteChip('all'); setCountrySelect(null); }}
              sx={{ fontSize: '0.72rem', textTransform: 'none', color: 'text.secondary', p: 0.5, minWidth: 0, '&:hover': { color: 'error.main' } }}
            >
              Limpiar
            </Button>
          )}
        </Box>

        {/* Active chips */}
        {valuesFilters.length > 0 && (
          <Box sx={{ px: 2, pb: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {valuesFilters.map((v) => (
              <Chip
                key={v.type}
                label={v.name}
                size="small"
                onDelete={v.deleted ? () => onDeleteChip(v.type) : undefined}
                sx={{
                  borderRadius: '8px', height: 24, fontSize: '0.72rem', fontWeight: 600,
                  bgcolor: alpha(ACCENT, 0.1), color: ACCENT,
                  border: `1px solid ${alpha(ACCENT, 0.25)}`,
                  '& .MuiChip-deleteIcon': { fontSize: 13, color: ACCENT, opacity: 0.7 },
                }}
              />
            ))}
          </Box>
        )}

        <Box sx={{ px: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {/* Destinos populares */}
          <SectionBlock icon={<LocationOnOutlined sx={{ fontSize: 15 }} />} label="Destinos Populares">
            {loadCountry ? (
              <Box py={1.5} display="flex" justifyContent="center">
                <CircularProgress size={20} />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {countries.map((c, idx) => {
                  const isSelected = countrySelect?.iso === c.iso;
                  return (
                    <Box
                      key={idx}
                      onClick={() => {
                        const next = isSelected ? null : c;
                        setCountrySelect(next);
                        onSelectCountry(next);
                        if (isMobile) onClose();
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.25,
                        py: 0.75,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: '1.5px solid',
                        borderColor: isSelected ? alpha(ACCENT, 0.4) : 'transparent',
                        bgcolor: isSelected ? alpha(ACCENT, 0.07) : 'transparent',
                        transition: 'all 0.15s',
                        '&:hover': { bgcolor: alpha(ACCENT, 0.06), borderColor: alpha(ACCENT, 0.2) },
                      }}
                    >
                      <Avatar src={c.flag} sx={{ width: 22, height: 22 }} />
                      <Typography variant="body2" fontWeight={isSelected ? 600 : 400} sx={{ color: isSelected ? ACCENT : 'text.primary', fontSize: '0.82rem' }}>
                        {c.name}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </SectionBlock>

          {/* Días */}
          <SectionBlock icon={<AccessTimeOutlined sx={{ fontSize: 15 }} />} label="Duración">
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
              {VALUES_DAY_FILTER.map((item) => {
                const isActive = days === item.type;
                return (
                  <Box
                    key={item.type}
                    onClick={() => setDays(isActive ? '' : item.type)}
                    sx={{
                      px: 1.25, py: 0.4,
                      borderRadius: '999px',
                      border: '1.5px solid',
                      borderColor: isActive ? ACCENT : alpha('#000', 0.1),
                      bgcolor: isActive ? alpha(ACCENT, 0.1) : 'white',
                      color: isActive ? ACCENT : 'text.secondary',
                      fontSize: '0.75rem',
                      fontWeight: isActive ? 700 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      '&:hover': { borderColor: ACCENT, color: ACCENT },
                    }}
                  >
                    {item.name}
                  </Box>
                );
              })}
            </Box>
          </SectionBlock>

          {/* Datos */}
          <SectionBlock icon={<WifiOutlined sx={{ fontSize: 15 }} />} label="Datos">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <ToggleRow
                label="Datos ilimitados"
                checked={unlimited}
                onChange={() => setUnlimited(!unlimited)}
              />
              <ToggleRow
                label="Roaming incluido"
                checked={roaming}
                onChange={() => setRoaming(!roaming)}
              />
            </Box>
          </SectionBlock>
        </Box>
      </Drawer>

      <MainByDrawer open={open} DrawerPrimaryWidth={drawerWidth} enabledDrawer={enabledDrawer} sx={[{ width: '100%' }]}>
        {children}
      </MainByDrawer>
    </Box>
  );
};

// ─── Sub-components ───────────────────────────────────────────────

const SectionBlock = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: ReactNode }) => (
  <Box
    sx={{
      bgcolor: 'white',
      borderRadius: 2.5,
      border: '1px solid',
      borderColor: 'divider',
      overflow: 'hidden',
    }}
  >
    <Box
      sx={{
        px: 1.5,
        py: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 0.75,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: alpha('#6671E2', 0.04),
      }}
    >
      <Box sx={{ color: '#6671E2' }}>{icon}</Box>
      <Typography variant="caption" fontWeight={700} sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.68rem' }}>
        {label}
      </Typography>
    </Box>
    <Box sx={{ p: 1.25 }}>{children}</Box>
  </Box>
);

const ToggleRow = ({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: () => void }) => (
  <Box
    onClick={onChange}
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 1,
      py: 0.5,
      borderRadius: 1.5,
      cursor: 'pointer',
      bgcolor: checked ? alpha('#6671E2', 0.06) : 'transparent',
      transition: 'background 0.15s',
      '&:hover': { bgcolor: alpha('#6671E2', 0.06) },
    }}
  >
    <Typography variant="body2" fontWeight={checked ? 600 : 400} sx={{ color: checked ? '#6671E2' : 'text.primary', fontSize: '0.82rem' }}>
      {label}
    </Typography>
    <Switch
      size="small"
      checked={checked}
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
      sx={{
        '& .MuiSwitch-switchBase.Mui-checked': { color: '#6671E2' },
        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#6671E2' },
      }}
    />
  </Box>
);
