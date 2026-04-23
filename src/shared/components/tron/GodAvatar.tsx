import { Box, styled, keyframes } from '@mui/material';

// User type to God mapping
type UserType = 'SUPER_ADMIN' | 'ADMIN' | 'SELLER';
type GodType = 'ZEUS' | 'ARES' | 'HERMES';

const USER_TYPE_TO_GOD: Record<UserType, GodType> = {
  SUPER_ADMIN: 'ZEUS',
  ADMIN: 'ARES',
  SELLER: 'HERMES',
};

// Each god has its own unique color
const GOD_COLORS: Record<GodType, { primary: string; glow: string; rgb: string }> = {
  ZEUS: { 
    primary: '#00FFFF', 
    glow: 'rgba(0, 255, 255, 0.6)', 
    rgb: '0, 255, 255' 
  },
  ARES: { 
    primary: '#FF3B3B', 
    glow: 'rgba(255, 59, 59, 0.6)', 
    rgb: '255, 59, 59' 
  },
  HERMES: { 
    primary: '#FF8C00', 
    glow: 'rgba(255, 140, 0, 0.6)', 
    rgb: '255, 140, 0' 
  },
};

// Keyframe animations
const pulseGlow = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 8px var(--god-glow)) drop-shadow(0 0 16px var(--god-glow));
  }
  50% {
    filter: drop-shadow(0 0 12px var(--god-glow)) drop-shadow(0 0 24px var(--god-glow));
  }
`;

const rotateRing = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const rotateRingReverse = keyframes`
  0% {
    transform: rotate(360deg);
  }
  100% {
    transform: rotate(0deg);
  }
`;

const floatParticle = keyframes`
  0%, 100% {
    opacity: 0.3;
    transform: translateY(0) scale(1);
  }
  50% {
    opacity: 1;
    transform: translateY(-4px) scale(1.2);
  }
`;

const scanLine = keyframes`
  0% {
    top: 0%;
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.8;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
`;

const borderPulse = keyframes`
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
`;

// Container with orbital rings
const AvatarWrapper = styled(Box)<{ $size: number; $color: string }>(
  ({ $size }) => ({
    position: 'relative',
    width: $size * 1.5,
    height: $size * 1.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  })
);

// Orbital ring
const OrbitalRing = styled(Box)<{ $color: string; $size: number; $delay: number; $reverse?: boolean }>(
  ({ $color, $size, $delay, $reverse }) => ({
    position: 'absolute',
    width: $size,
    height: $size,
    borderRadius: '50%',
    border: `1px solid ${$color}`,
    opacity: 0.4,
    animation: `${$reverse ? rotateRingReverse : rotateRing} ${6 + $delay}s linear infinite`,
    
    '&::before': {
      content: '""',
      position: 'absolute',
      width: 4,
      height: 4,
      borderRadius: '50%',
      backgroundColor: $color,
      top: -2,
      left: '50%',
      transform: 'translateX(-50%)',
      boxShadow: `0 0 6px ${$color}`,
    },
  })
);

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
    background: 'radial-gradient(circle at 30% 30%, rgba(30, 30, 40, 0.9) 0%, rgba(10, 10, 15, 0.95) 100%)',
    border: `2px solid ${$color}`,
    animation: `${borderPulse} 2s ease-in-out infinite`,
    overflow: 'hidden',
    
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      borderRadius: '50%',
      boxShadow: `0 0 20px ${$glow}, inset 0 0 20px rgba(0, 0, 0, 0.8)`,
      pointerEvents: 'none',
    },
    
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '2px',
      background: `linear-gradient(to right, transparent, ${$color}, transparent)`,
      animation: `${scanLine} 3s ease-in-out infinite`,
      pointerEvents: 'none',
    },
  })
);

// Icon wrapper with glow animation
const IconWrapper = styled(Box)<{ $color: string; $glow: string }>(
  ({ $color, $glow }) => ({
    '--god-color': $color,
    '--god-glow': $glow,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: `${pulseGlow} 2s ease-in-out infinite`,
    
    '& svg': {
      width: '55%',
      height: '55%',
    },
  })
);

// Floating particles around avatar
const Particle = styled(Box)<{ $color: string; $angle: number; $delay: number; $distance: number }>(
  ({ $color, $angle, $delay, $distance }) => ({
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: '50%',
    backgroundColor: $color,
    boxShadow: `0 0 4px ${$color}`,
    top: '50%',
    left: '50%',
    transform: `rotate(${$angle}deg) translateY(-${$distance}px)`,
    animation: `${floatParticle} ${2 + $delay * 0.5}s ease-in-out infinite`,
    animationDelay: `${$delay * 0.3}s`,
  })
);

// ZEUS Icon - Hexagonal shield with lightning
function ZeusIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer hexagon */}
      <path
        d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />
      {/* Inner hexagon */}
      <path
        d="M50 15 L80 32.5 L80 67.5 L50 85 L20 67.5 L20 32.5 Z"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />
      {/* Center lightning bolt */}
      <path
        d="M55 25 L45 48 L55 48 L42 75 L52 52 L42 52 L55 25"
        fill={color}
        opacity="0.9"
      />
      {/* Energy circles */}
      <circle cx="50" cy="50" r="8" stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
      <circle cx="50" cy="50" r="4" fill={color} opacity="0.8" />
    </svg>
  );
}

// ARES Icon - Spartan A with spear elements
function AresIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer circle with notch */}
      <circle
        cx="50"
        cy="50"
        r="42"
        stroke={color}
        strokeWidth="2"
        fill="none"
        opacity="0.6"
        strokeDasharray="220 40"
      />
      {/* Inner geometric A */}
      <path
        d="M50 15 L75 80 L65 80 L58 60 L42 60 L35 80 L25 80 L50 15"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
      />
      {/* A crossbar */}
      <path
        d="M38 52 L62 52"
        stroke={color}
        strokeWidth="2.5"
      />
      {/* Spear point at top */}
      <path
        d="M50 8 L54 18 L50 15 L46 18 Z"
        fill={color}
        opacity="0.9"
      />
      {/* Side accents */}
      <circle cx="25" cy="50" r="3" fill={color} opacity="0.6" />
      <circle cx="75" cy="50" r="3" fill={color} opacity="0.6" />
    </svg>
  );
}

// HERMES Icon - Diamond/crystal with wings
function HermesIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Central diamond */}
      <path
        d="M50 10 L75 40 L50 90 L25 40 Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
        opacity="0.8"
      />
      {/* Inner diamond lines */}
      <path
        d="M50 10 L50 90 M25 40 L75 40"
        stroke={color}
        strokeWidth="1"
        opacity="0.4"
      />
      {/* Top facet */}
      <path
        d="M50 10 L65 30 L50 35 L35 30 Z"
        fill={color}
        opacity="0.3"
      />
      {/* Left wing */}
      <path
        d="M22 35 L8 25 L12 35 L5 40 L15 42 L22 35"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
      />
      {/* Right wing */}
      <path
        d="M78 35 L92 25 L88 35 L95 40 L85 42 L78 35"
        stroke={color}
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
      />
      {/* Energy core */}
      <circle cx="50" cy="45" r="5" fill={color} opacity="0.9" />
      <circle cx="50" cy="45" r="8" stroke={color} strokeWidth="1" fill="none" opacity="0.4" />
    </svg>
  );
}

interface GodAvatarProps {
  userType: string;
  size?: number;
  showLabel?: boolean;
  showEffects?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fallbackText?: string;
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

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <AvatarWrapper $size={size} $color={colors.primary}>
        {/* Orbital rings */}
        {showEffects && (
          <>
            <OrbitalRing $color={colors.primary} $size={size * 1.35} $delay={0} />
            <OrbitalRing $color={colors.primary} $size={size * 1.2} $delay={2} $reverse />
          </>
        )}
        
        {/* Floating particles */}
        {showEffects && (
          <>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <Particle 
                key={angle} 
                $color={colors.primary} 
                $angle={angle} 
                $delay={i} 
                $distance={size * 0.7}
              />
            ))}
          </>
        )}
        
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
            mt: 1,
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.15em',
            color: colors.primary,
            textShadow: `0 0 8px ${colors.glow}`,
            whiteSpace: 'nowrap',
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
