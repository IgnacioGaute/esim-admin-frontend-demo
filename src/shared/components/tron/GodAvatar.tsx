import { Box, styled, keyframes } from '@mui/material';

// User type to God mapping
type UserType = 'SUPER_ADMIN' | 'ADMIN' | 'SELLER';
type GodType = 'ZEUS' | 'ARES' | 'HERMES';

const USER_TYPE_TO_GOD: Record<UserType, GodType> = {
  SUPER_ADMIN: 'ZEUS',
  ADMIN: 'ARES',
  SELLER: 'HERMES',
};

// Each god has its own unique color - matching TheGridCN style
const GOD_COLORS: Record<GodType, { primary: string; glow: string; rgb: string }> = {
  ZEUS: { 
    primary: '#00FFFF', 
    glow: 'rgba(0, 255, 255, 0.8)', 
    rgb: '0, 255, 255' 
  },
  ARES: { 
    primary: '#FF3B3B', 
    glow: 'rgba(255, 59, 59, 0.8)', 
    rgb: '255, 59, 59' 
  },
  HERMES: { 
    primary: '#FF8C00', 
    glow: 'rgba(255, 140, 0, 0.8)', 
    rgb: '255, 140, 0' 
  },
};

// Keyframe animations
const rotateOrbit = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const rotateOrbitReverse = keyframes`
  0% { transform: rotate(360deg); }
  100% { transform: rotate(0deg); }
`;

const pulseCore = keyframes`
  0%, 100% { 
    opacity: 0.8;
    filter: drop-shadow(0 0 8px var(--god-glow)) drop-shadow(0 0 16px var(--god-glow));
  }
  50% { 
    opacity: 1;
    filter: drop-shadow(0 0 12px var(--god-glow)) drop-shadow(0 0 24px var(--god-glow)) drop-shadow(0 0 32px var(--god-glow));
  }
`;

const pulseDot = keyframes`
  0%, 100% { 
    transform: scale(1);
    opacity: 1;
  }
  50% { 
    transform: scale(1.3);
    opacity: 0.8;
  }
`;

const floatParticle = keyframes`
  0%, 100% { 
    opacity: 0.4;
    transform: translateY(0) scale(0.8);
  }
  50% { 
    opacity: 1;
    transform: translateY(-3px) scale(1);
  }
`;

const scanEffect = keyframes`
  0% { 
    top: 0%;
    opacity: 0;
  }
  10% { opacity: 0.6; }
  90% { opacity: 0.6; }
  100% { 
    top: 100%;
    opacity: 0;
  }
`;

// Outer wrapper for orbital rings
const AvatarWrapper = styled(Box)<{ $size: number }>(({ $size }) => ({
  position: 'relative',
  width: $size * 1.6,
  height: $size * 1.6,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

// Orbital ring with traveling dot
const OrbitalRing = styled(Box)<{ 
  $color: string; 
  $size: number; 
  $duration: number; 
  $reverse?: boolean;
  $dotSize?: number;
}>(({ $color, $size, $duration, $reverse, $dotSize = 6 }) => ({
  position: 'absolute',
  width: $size,
  height: $size,
  borderRadius: '50%',
  border: `1.5px solid ${$color}`,
  opacity: 0.5,
  animation: `${$reverse ? rotateOrbitReverse : rotateOrbit} ${$duration}s linear infinite`,
  
  '&::before': {
    content: '""',
    position: 'absolute',
    width: $dotSize,
    height: $dotSize,
    borderRadius: '50%',
    backgroundColor: $color,
    top: -$dotSize / 2,
    left: '50%',
    transform: 'translateX(-50%)',
    boxShadow: `0 0 8px ${$color}, 0 0 16px ${$color}`,
    animation: `${pulseDot} 1s ease-in-out infinite`,
  },
}));

// Main avatar container
const AvatarContainer = styled(Box)<{ $size: number; $color: string; $glow: string }>(
  ({ $size, $color, $glow }) => ({
    '--god-color': $color,
    '--god-glow': $glow,
    width: $size,
    height: $size,
    borderRadius: '50%',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `radial-gradient(circle at 30% 30%, rgba(20, 20, 30, 0.95) 0%, rgba(5, 5, 10, 0.98) 100%)`,
    border: `2px solid ${$color}`,
    boxShadow: `0 0 20px ${$glow}, 0 0 40px ${$glow}, inset 0 0 30px rgba(0, 0, 0, 0.8)`,
    overflow: 'hidden',
    
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '2px',
      background: `linear-gradient(90deg, transparent, ${$color}, transparent)`,
      animation: `${scanEffect} 2.5s ease-in-out infinite`,
      pointerEvents: 'none',
    },
  })
);

// Icon wrapper with glow
const IconWrapper = styled(Box)<{ $color: string; $glow: string }>(({ $color, $glow }) => ({
  '--god-color': $color,
  '--god-glow': $glow,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  animation: `${pulseCore} 2s ease-in-out infinite`,
  
  '& svg': {
    width: '65%',
    height: '65%',
  },
}));

// Floating particles
const Particle = styled(Box)<{ $color: string; $angle: number; $delay: number; $distance: number }>(
  ({ $color, $angle, $delay, $distance }) => ({
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: '50%',
    backgroundColor: $color,
    boxShadow: `0 0 6px ${$color}, 0 0 10px ${$color}`,
    top: '50%',
    left: '50%',
    transformOrigin: 'center',
    transform: `rotate(${$angle}deg) translateY(-${$distance}px)`,
    animation: `${floatParticle} ${1.5 + $delay * 0.3}s ease-in-out infinite`,
    animationDelay: `${$delay * 0.2}s`,
  })
);

// ZEUS Icon - Hexagon with lightning bolt
function ZeusIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer hexagon */}
      <path
        d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        opacity="0.7"
      />
      {/* Inner hexagon */}
      <path
        d="M50 18 L78 35 L78 65 L50 82 L22 65 L22 35 Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />
      {/* Lightning bolt - larger and more prominent */}
      <path
        d="M58 20 L42 48 L54 48 L38 80 L62 45 L48 45 L58 20"
        fill={color}
        opacity="1"
      />
      {/* Energy core */}
      <circle cx="50" cy="50" r="6" fill={color} opacity="0.9" />
    </svg>
  );
}

// ARES Icon - Spartan A logo (like in TheGridCN)
function AresIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer circle with gap */}
      <circle
        cx="50"
        cy="50"
        r="44"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        opacity="0.7"
        strokeDasharray="240 30"
      />
      {/* Inner circle accent */}
      <circle
        cx="50"
        cy="50"
        r="36"
        stroke={color}
        strokeWidth="1"
        fill="none"
        opacity="0.3"
      />
      {/* Spartan A shape */}
      <path
        d="M50 12 L78 85 L66 85 L58 62 L42 62 L34 85 L22 85 L50 12"
        stroke={color}
        strokeWidth="3"
        fill="none"
        strokeLinejoin="round"
      />
      {/* A crossbar */}
      <path
        d="M36 52 L64 52"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Spear point */}
      <path
        d="M50 5 L55 16 L50 12 L45 16 Z"
        fill={color}
        opacity="0.9"
      />
    </svg>
  );
}

// HERMES Icon - Diamond/Crystal shape (CLU style)
function HermesIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Main diamond body */}
      <path
        d="M50 8 L80 35 L50 92 L20 35 Z"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
        opacity="0.8"
      />
      {/* Inner diamond lines */}
      <path
        d="M50 8 L50 92"
        stroke={color}
        strokeWidth="1"
        opacity="0.4"
      />
      <path
        d="M20 35 L80 35"
        stroke={color}
        strokeWidth="1"
        opacity="0.4"
      />
      {/* Top facet highlight */}
      <path
        d="M50 8 L70 30 L50 38 L30 30 Z"
        fill={color}
        opacity="0.25"
      />
      {/* Side spikes/wings */}
      <path
        d="M15 35 L5 28 L8 35 L3 40 L15 38"
        stroke={color}
        strokeWidth="2"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M85 35 L95 28 L92 35 L97 40 L85 38"
        stroke={color}
        strokeWidth="2"
        fill="none"
        opacity="0.7"
      />
      {/* Energy core */}
      <circle cx="50" cy="45" r="8" fill={color} opacity="0.8" />
      <circle cx="50" cy="45" r="4" fill={color} opacity="1" />
    </svg>
  );
}

interface GodAvatarProps {
  userType: string;
  size?: number;
  showLabel?: boolean;
  showEffects?: boolean;
}

export function GodAvatar({ 
  userType, 
  size = 56, 
  showLabel = false,
  showEffects = true,
}: GodAvatarProps) {
  const godType = USER_TYPE_TO_GOD[userType as UserType] || 'HERMES';
  const colors = GOD_COLORS[godType];

  const IconComponent = {
    ZEUS: ZeusIcon,
    ARES: AresIcon,
    HERMES: HermesIcon,
  }[godType];

  const particles = [0, 60, 120, 180, 240, 300];

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <AvatarWrapper $size={size}>
        {/* Orbital rings with traveling dots */}
        {showEffects && (
          <>
            <OrbitalRing 
              $color={colors.primary} 
              $size={size * 1.5} 
              $duration={4}
              $dotSize={6}
            />
            <OrbitalRing 
              $color={colors.primary} 
              $size={size * 1.25} 
              $duration={6}
              $reverse
              $dotSize={4}
            />
          </>
        )}
        
        {/* Floating particles */}
        {showEffects && particles.map((angle, i) => (
          <Particle 
            key={angle} 
            $color={colors.primary} 
            $angle={angle} 
            $delay={i} 
            $distance={size * 0.75}
          />
        ))}
        
        {/* Main avatar */}
        <AvatarContainer $size={size} $color={colors.primary} $glow={colors.glow}>
          <IconWrapper $color={colors.primary} $glow={colors.glow}>
            <IconComponent color={colors.primary} />
          </IconWrapper>
        </AvatarContainer>
      </AvatarWrapper>
      
      {showLabel && (
        <Box
          sx={{
            mt: 1.5,
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: colors.primary,
            textShadow: `0 0 10px ${colors.glow}, 0 0 20px ${colors.glow}`,
            whiteSpace: 'nowrap',
            textTransform: 'uppercase',
          }}
        >
          {godType}
        </Box>
      )}
    </Box>
  );
}

// Export the god type mapping for external use
export { USER_TYPE_TO_GOD, GOD_COLORS };
export type { UserType, GodType };
