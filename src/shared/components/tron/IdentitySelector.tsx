import { Box, Typography, Slider, styled, keyframes } from '@mui/material';
import { useTronTheme } from '../../../theme/TronThemeContext';
import { IDENTITY_LIST, GLOW_LEVELS, IdentityName, GlowLevel } from '../../../theme/identities';

const pulseGlow = keyframes`
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.02);
  }
`;

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 255, 255';
}

const Container = styled(Box)({
  padding: '20px',
});

const SectionLabel = styled(Typography)<{ $color: string }>(({ $color }) => ({
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '0.2em',
  color: 'rgba(255, 255, 255, 0.5)',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  '&::after': {
    content: '""',
    flex: 1,
    height: '1px',
    background: `linear-gradient(90deg, rgba(${hexToRgb($color)}, 0.3), transparent)`,
  },
}));

const IdentityGrid = styled(Box)({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '12px',
  marginBottom: '24px',
});

const IdentityCard = styled(Box)<{ 
  $color: string; 
  $selected: boolean;
  $glowLevel: number;
}>(({ $color, $selected, $glowLevel }) => ({
  position: 'relative',
  aspectRatio: '1',
  background: 'rgba(15, 15, 25, 0.9)',
  borderRadius: '8px',
  border: `1px solid ${$selected ? $color : 'rgba(255, 255, 255, 0.1)'}`,
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '12px',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  
  ...($selected && $glowLevel > 0 && {
    boxShadow: `
      0 0 ${15 * $glowLevel}px rgba(${hexToRgb($color)}, 0.4),
      inset 0 0 ${20 * $glowLevel}px rgba(${hexToRgb($color)}, 0.1)
    `,
    animation: `${pulseGlow} 2s ease-in-out infinite`,
  }),
  
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: `radial-gradient(circle at center, rgba(${hexToRgb($color)}, ${$selected ? 0.15 : 0}) 0%, transparent 70%)`,
    transition: 'all 0.3s ease',
  },
  
  '&:hover': {
    borderColor: `rgba(${hexToRgb($color)}, 0.6)`,
    transform: 'translateY(-2px)',
    '&::before': {
      background: `radial-gradient(circle at center, rgba(${hexToRgb($color)}, 0.1) 0%, transparent 70%)`,
    },
  },
}));

const IconContainer = styled(Box)<{ $color: string }>(({ $color }) => ({
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: $color,
  '& svg': {
    width: '100%',
    height: '100%',
  },
}));

const IdentityName = styled(Typography)<{ $color: string; $selected: boolean }>(
  ({ $color, $selected }) => ({
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.15em',
    color: $selected ? $color : 'rgba(255, 255, 255, 0.6)',
    textTransform: 'uppercase',
    transition: 'color 0.3s ease',
  })
);

const GlowSlider = styled(Slider)<{ $color: string }>(({ $color }) => ({
  color: $color,
  height: 4,
  '& .MuiSlider-thumb': {
    width: 16,
    height: 16,
    backgroundColor: $color,
    boxShadow: `0 0 10px ${$color}`,
    '&:hover, &.Mui-focusVisible': {
      boxShadow: `0 0 20px ${$color}`,
    },
  },
  '& .MuiSlider-track': {
    background: `linear-gradient(90deg, ${$color}88, ${$color})`,
    boxShadow: `0 0 8px ${$color}66`,
  },
  '& .MuiSlider-rail': {
    background: 'rgba(255, 255, 255, 0.1)',
  },
  '& .MuiSlider-mark': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 2,
    height: 8,
  },
  '& .MuiSlider-markActive': {
    backgroundColor: $color,
  },
}));

const GlowLabels = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '8px',
});

const GlowLabel = styled(Typography)<{ $active: boolean; $color: string }>(
  ({ $active, $color }) => ({
    fontSize: '9px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: $active ? $color : 'rgba(255, 255, 255, 0.4)',
    transition: 'color 0.3s ease',
  })
);

// Identity Icons
const TronIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="20" r="14" stroke={color} strokeWidth="2" fill="none" />
    <circle cx="20" cy="20" r="6" fill={color} fillOpacity="0.3" stroke={color} strokeWidth="1.5" />
  </svg>
);

const AresIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 40 40" fill="none">
    <path d="M20 4L36 32H4L20 4Z" stroke={color} strokeWidth="2" fill={`${color}33`} />
    <circle cx="20" cy="22" r="5" stroke={color} strokeWidth="1.5" fill="none" />
  </svg>
);

const CluIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 40 40" fill="none">
    <polygon points="20,4 36,20 20,36 4,20" stroke={color} strokeWidth="2" fill={`${color}33`} />
    <line x1="20" y1="12" x2="20" y2="28" stroke={color} strokeWidth="1.5" />
    <line x1="12" y1="20" x2="28" y2="20" stroke={color} strokeWidth="1.5" />
  </svg>
);

const AthenaIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 40 40" fill="none">
    <circle cx="20" cy="16" r="8" stroke={color} strokeWidth="2" fill="none" />
    <path d="M12 28C12 24 16 22 20 22C24 22 28 24 28 28" stroke={color} strokeWidth="2" fill="none" />
    <circle cx="20" cy="16" r="3" fill={color} fillOpacity="0.5" />
  </svg>
);

const AphroditeIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 40 40" fill="none">
    <path d="M20 8C26 8 30 14 30 20C30 26 26 32 20 32C14 32 10 26 10 20C10 14 14 8 20 8Z" 
          stroke={color} strokeWidth="2" fill={`${color}33`} />
    <path d="M16 18C16 16 18 14 20 14C22 14 24 16 24 18" stroke={color} strokeWidth="1.5" fill="none" />
    <circle cx="20" cy="24" r="3" fill={color} fillOpacity="0.6" />
  </svg>
);

const PoseidonIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 40 40" fill="none">
    <path d="M20 4L20 36" stroke={color} strokeWidth="2" />
    <path d="M12 12L20 4L28 12" stroke={color} strokeWidth="2" fill="none" />
    <path d="M10 20L30 20" stroke={color} strokeWidth="2" />
    <path d="M14 28L26 28" stroke={color} strokeWidth="1.5" />
  </svg>
);

const IDENTITY_ICONS: Record<IdentityName, React.FC<{ color: string }>> = {
  TRON: TronIcon,
  ARES: AresIcon,
  CLU: CluIcon,
  ATHENA: AthenaIcon,
  APHRODITE: AphroditeIcon,
  POSEIDON: PoseidonIcon,
};

interface IdentitySelectorProps {
  compact?: boolean;
}

export function IdentitySelector({ compact = false }: IdentitySelectorProps) {
  const { identity, glowLevel, setIdentity, setGlowLevel } = useTronTheme();

  const handleGlowChange = (_: Event, value: number | number[]) => {
    setGlowLevel(value as GlowLevel);
  };

  return (
    <Container>
      <SectionLabel $color={identity.primary}>
        IDENTITY: <span style={{ color: identity.primary }}>{identity.name}</span>
      </SectionLabel>
      
      <IdentityGrid>
        {IDENTITY_LIST.map((id) => {
          const Icon = IDENTITY_ICONS[id.name];
          const isSelected = identity.name === id.name;
          
          return (
            <IdentityCard
              key={id.name}
              $color={id.primary}
              $selected={isSelected}
              $glowLevel={glowLevel}
              onClick={() => setIdentity(id.name)}
            >
              <IconContainer $color={id.primary}>
                <Icon color={id.primary} />
              </IconContainer>
              <IdentityName $color={id.primary} $selected={isSelected}>
                {id.name}
              </IdentityName>
            </IdentityCard>
          );
        })}
      </IdentityGrid>

      {!compact && (
        <>
          <SectionLabel $color={identity.primary}>
            GLOW: <span style={{ color: identity.primary }}>{GLOW_LEVELS[glowLevel].label}</span>
          </SectionLabel>
          
          <Box sx={{ px: 1 }}>
            <GlowSlider
              $color={identity.primary}
              value={glowLevel}
              onChange={handleGlowChange}
              min={0}
              max={3}
              step={1}
              marks
            />
            <GlowLabels>
              {GLOW_LEVELS.map((level) => (
                <GlowLabel 
                  key={level.level} 
                  $active={glowLevel === level.level}
                  $color={identity.primary}
                >
                  {level.label}
                </GlowLabel>
              ))}
            </GlowLabels>
          </Box>
        </>
      )}
    </Container>
  );
}
