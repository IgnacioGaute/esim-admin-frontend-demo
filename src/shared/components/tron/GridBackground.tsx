import { Box, keyframes, styled } from '@mui/material';
import { useTronTheme } from '../../../theme/TronThemeContext';

const gridPulse = keyframes`
  0%, 100% {
    opacity: 0.15;
  }
  50% {
    opacity: 0.25;
  }
`;

const floatAnimation = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const GridContainer = styled(Box)<{ $primaryColor: string; $glowLevel: number }>(
  ({ $primaryColor, $glowLevel }) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    background: `
      radial-gradient(ellipse at 50% 0%, rgba(${hexToRgb($primaryColor)}, ${0.08 * $glowLevel}) 0%, transparent 50%),
      linear-gradient(180deg, #0A0A0F 0%, #0D0D15 100%)
    `,
    zIndex: 0,
    pointerEvents: 'none',
  })
);

const PerspectiveGrid = styled(Box)<{ $primaryColor: string; $glowLevel: number }>(
  ({ $primaryColor, $glowLevel }) => ({
    position: 'absolute',
    bottom: 0,
    left: '-50%',
    right: '-50%',
    height: '60vh',
    background: `
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 79px,
        rgba(${hexToRgb($primaryColor)}, ${0.3 * $glowLevel}) 79px,
        rgba(${hexToRgb($primaryColor)}, ${0.3 * $glowLevel}) 80px
      ),
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 79px,
        rgba(${hexToRgb($primaryColor)}, ${0.3 * $glowLevel}) 79px,
        rgba(${hexToRgb($primaryColor)}, ${0.3 * $glowLevel}) 80px
      )
    `,
    transform: 'perspective(500px) rotateX(60deg)',
    transformOrigin: 'center bottom',
    opacity: $glowLevel > 0 ? 0.4 : 0.2,
    animation: `${gridPulse} 4s ease-in-out infinite`,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(to bottom, transparent 0%, rgba(${hexToRgb($primaryColor)}, 0.1) 100%)`,
    },
  })
);

const HorizonGlow = styled(Box)<{ $primaryColor: string; $glowLevel: number }>(
  ({ $primaryColor, $glowLevel }) => ({
    position: 'absolute',
    bottom: '30vh',
    left: 0,
    right: 0,
    height: '2px',
    background: `linear-gradient(90deg, 
      transparent 0%, 
      rgba(${hexToRgb($primaryColor)}, ${0.8 * $glowLevel}) 50%, 
      transparent 100%
    )`,
    boxShadow: $glowLevel > 0 
      ? `0 0 ${30 * $glowLevel}px rgba(${hexToRgb($primaryColor)}, 0.5), 
         0 0 ${60 * $glowLevel}px rgba(${hexToRgb($primaryColor)}, 0.3)`
      : 'none',
  })
);

const TopGradient = styled(Box)<{ $primaryColor: string }>(
  ({ $primaryColor }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40vh',
    background: `radial-gradient(ellipse at 50% 0%, rgba(${hexToRgb($primaryColor)}, 0.15) 0%, transparent 70%)`,
    pointerEvents: 'none',
  })
);

const FloatingOrb = styled(Box)<{ $primaryColor: string; $delay: number; $size: number; $left: string; $top: string }>(
  ({ $primaryColor, $delay, $size, $left, $top }) => ({
    position: 'absolute',
    width: $size,
    height: $size,
    borderRadius: '50%',
    background: `radial-gradient(circle, rgba(${hexToRgb($primaryColor)}, 0.3) 0%, transparent 70%)`,
    left: $left,
    top: $top,
    animation: `${floatAnimation} ${4 + $delay}s ease-in-out infinite`,
    animationDelay: `${$delay}s`,
    filter: `blur(${$size / 4}px)`,
  })
);

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 255, 255';
}

interface GridBackgroundProps {
  showOrbs?: boolean;
  showHorizon?: boolean;
  intensity?: number;
}

export function GridBackground({ 
  showOrbs = true, 
  showHorizon = true,
  intensity = 1 
}: GridBackgroundProps) {
  const { identity, glowLevel } = useTronTheme();
  const effectiveGlow = glowLevel * intensity;

  return (
    <GridContainer $primaryColor={identity.primary} $glowLevel={effectiveGlow}>
      <TopGradient $primaryColor={identity.primary} />
      <PerspectiveGrid $primaryColor={identity.primary} $glowLevel={effectiveGlow} />
      {showHorizon && (
        <HorizonGlow $primaryColor={identity.primary} $glowLevel={effectiveGlow} />
      )}
      {showOrbs && effectiveGlow > 0 && (
        <>
          <FloatingOrb $primaryColor={identity.primary} $delay={0} $size={100} $left="10%" $top="20%" />
          <FloatingOrb $primaryColor={identity.primary} $delay={1} $size={60} $left="80%" $top="30%" />
          <FloatingOrb $primaryColor={identity.primary} $delay={2} $size={80} $left="60%" $top="60%" />
        </>
      )}
    </GridContainer>
  );
}
