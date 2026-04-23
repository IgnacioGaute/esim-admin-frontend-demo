import { Box, styled, keyframes } from '@mui/material';
import { useTronTheme } from '@/theme/TronThemeContext';

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 255, 255';
}

const pulseGlow = keyframes`
  0%, 100% {
    filter: drop-shadow(0 0 4px var(--logo-glow)) drop-shadow(0 0 8px var(--logo-glow));
  }
  50% {
    filter: drop-shadow(0 0 8px var(--logo-glow)) drop-shadow(0 0 16px var(--logo-glow));
  }
`;

const rotateRing = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const dataStream = keyframes`
  0% { 
    stroke-dashoffset: 100;
    opacity: 0;
  }
  20% { opacity: 1; }
  80% { opacity: 1; }
  100% { 
    stroke-dashoffset: 0;
    opacity: 0;
  }
`;

const LogoWrapper = styled(Box)<{ $color: string; $glow: string }>(({ $glow }) => ({
  '--logo-glow': $glow,
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  animation: `${pulseGlow} 3s ease-in-out infinite`,
}));

const OrbitalAccent = styled(Box)<{ $color: string; $size: number }>(({ $color, $size }) => ({
  position: 'absolute',
  width: $size,
  height: $size,
  borderRadius: '50%',
  border: `1px solid ${$color}`,
  opacity: 0.3,
  animation: `${rotateRing} 8s linear infinite`,
  
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
}));

interface TronLogoProps {
  size?: number;
  showOrbit?: boolean;
  showText?: boolean;
  text?: string;
}

export function TronLogo({ 
  size = 48, 
  showOrbit = true,
  showText = true,
  text = 'eSIM'
}: TronLogoProps) {
  const { identity, glowLevel } = useTronTheme();
  const primaryColor = identity.primary;
  const primaryRgb = hexToRgb(primaryColor);
  const glowColor = `rgba(${primaryRgb}, 0.6)`;

  return (
    <LogoWrapper $color={primaryColor} $glow={glowColor}>
      {showOrbit && (
        <OrbitalAccent $color={primaryColor} $size={size * 1.3} />
      )}
      
      <Box
        sx={{
          position: 'relative',
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Outer hexagon frame */}
          <path
            d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
            stroke={primaryColor}
            strokeWidth="2"
            fill="none"
            opacity="0.6"
          />
          
          {/* Inner hexagon */}
          <path
            d="M50 15 L78 32.5 L78 67.5 L50 85 L22 67.5 L22 32.5 Z"
            stroke={primaryColor}
            strokeWidth="1.5"
            fill="none"
            opacity="0.3"
          />
          
          {/* SIM card shape in center */}
          <path
            d="M35 30 L65 30 L65 70 L55 70 L55 60 L45 60 L45 70 L35 70 Z"
            stroke={primaryColor}
            strokeWidth="2"
            fill="none"
            opacity="0.8"
          />
          
          {/* SIM chip detail */}
          <rect
            x="40"
            y="38"
            width="20"
            height="14"
            rx="2"
            stroke={primaryColor}
            strokeWidth="1.5"
            fill={`rgba(${primaryRgb}, 0.15)`}
          />
          
          {/* Chip lines */}
          <path
            d="M44 42 L56 42 M44 46 L56 46 M44 50 L56 50"
            stroke={primaryColor}
            strokeWidth="1"
            opacity="0.6"
          />
          
          {/* Data stream effect */}
          <path
            d="M25 50 L35 50"
            stroke={primaryColor}
            strokeWidth="1.5"
            strokeDasharray="4 2"
            opacity="0.5"
            style={{
              animation: `${dataStream} 2s linear infinite`,
            }}
          />
          <path
            d="M65 50 L75 50"
            stroke={primaryColor}
            strokeWidth="1.5"
            strokeDasharray="4 2"
            opacity="0.5"
            style={{
              animation: `${dataStream} 2s linear infinite`,
              animationDelay: '0.5s',
            }}
          />
          
          {/* Corner accents */}
          <circle cx="50" cy="5" r="2" fill={primaryColor} opacity="0.8" />
          <circle cx="90" cy="27.5" r="2" fill={primaryColor} opacity="0.8" />
          <circle cx="90" cy="72.5" r="2" fill={primaryColor} opacity="0.8" />
          <circle cx="50" cy="95" r="2" fill={primaryColor} opacity="0.8" />
          <circle cx="10" cy="72.5" r="2" fill={primaryColor} opacity="0.8" />
          <circle cx="10" cy="27.5" r="2" fill={primaryColor} opacity="0.8" />
        </svg>
      </Box>
      
      {showText && (
        <Box
          sx={{
            ml: 1.5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          <Box
            sx={{
              fontSize: size * 0.45,
              fontWeight: 800,
              color: primaryColor,
              letterSpacing: '0.1em',
              lineHeight: 1,
              textShadow: glowLevel > 0 
                ? `0 0 ${10 * glowLevel}px rgba(${primaryRgb}, 0.5)`
                : 'none',
            }}
          >
            {text}
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 0.3,
            }}
          >
            <Box
              sx={{
                width: size * 0.15,
                height: 3,
                borderRadius: 1,
                backgroundColor: primaryColor,
                boxShadow: `0 0 6px ${primaryColor}`,
              }}
            />
            <Box
              sx={{
                fontSize: size * 0.18,
                fontWeight: 600,
                color: `rgba(${primaryRgb}, 0.7)`,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              ADMIN
            </Box>
          </Box>
        </Box>
      )}
    </LogoWrapper>
  );
}

export default TronLogo;
