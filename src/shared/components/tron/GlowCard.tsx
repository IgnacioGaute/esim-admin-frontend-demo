import { Box, BoxProps, keyframes, styled } from '@mui/material';
import { useTronTheme } from '../../../theme/TronThemeContext';
import { ReactNode } from 'react';

const borderGlow = keyframes`
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
`;

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 255, 255';
}

const CardContainer = styled(Box)<{ 
  $primaryColor: string; 
  $glowLevel: number;
  $variant: 'default' | 'elevated' | 'outlined';
  $animated: boolean;
}>(({ $primaryColor, $glowLevel, $variant, $animated }) => ({
  position: 'relative',
  background: $variant === 'outlined' 
    ? 'transparent' 
    : 'rgba(15, 15, 25, 0.85)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  borderRadius: '8px',
  border: `1px solid rgba(${hexToRgb($primaryColor)}, ${$variant === 'outlined' ? 0.5 : 0.2})`,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  boxShadow: $glowLevel > 0 && $variant === 'elevated'
    ? `0 0 ${20 * $glowLevel}px rgba(${hexToRgb($primaryColor)}, 0.15),
       0 8px 32px rgba(0, 0, 0, 0.4)`
    : '0 4px 20px rgba(0, 0, 0, 0.3)',
  
  '&:hover': {
    border: `1px solid rgba(${hexToRgb($primaryColor)}, ${$variant === 'outlined' ? 0.8 : 0.4})`,
    transform: 'translateY(-2px)',
    boxShadow: $glowLevel > 0 
      ? `0 0 ${30 * $glowLevel}px rgba(${hexToRgb($primaryColor)}, 0.2),
         0 12px 40px rgba(0, 0, 0, 0.4)`
      : '0 8px 30px rgba(0, 0, 0, 0.4)',
  },
  
  ...$animated && $glowLevel > 0 && {
    animation: `${borderGlow} 3s ease-in-out infinite`,
  },
}));

const CornerAccent = styled(Box)<{ $position: 'tl' | 'tr' | 'bl' | 'br'; $primaryColor: string }>(
  ({ $position, $primaryColor }) => ({
    position: 'absolute',
    width: '16px',
    height: '16px',
    borderColor: $primaryColor,
    borderStyle: 'solid',
    borderWidth: 0,
    opacity: 0.8,
    ...($position === 'tl' && {
      top: -1,
      left: -1,
      borderTopWidth: '2px',
      borderLeftWidth: '2px',
    }),
    ...($position === 'tr' && {
      top: -1,
      right: -1,
      borderTopWidth: '2px',
      borderRightWidth: '2px',
    }),
    ...($position === 'bl' && {
      bottom: -1,
      left: -1,
      borderBottomWidth: '2px',
      borderLeftWidth: '2px',
    }),
    ...($position === 'br' && {
      bottom: -1,
      right: -1,
      borderBottomWidth: '2px',
      borderRightWidth: '2px',
    }),
  })
);

const ScanLine = styled(Box)<{ $primaryColor: string }>(
  ({ $primaryColor }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '1px',
    background: `linear-gradient(90deg, transparent, rgba(${hexToRgb($primaryColor)}, 0.5), transparent)`,
  })
);

interface GlowCardProps extends Omit<BoxProps, 'ref'> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  showCorners?: boolean;
  showScanLine?: boolean;
  animated?: boolean;
  padding?: number | string;
}

export function GlowCard({
  children,
  variant = 'default',
  showCorners = false,
  showScanLine = false,
  animated = false,
  padding = 3,
  ...props
}: GlowCardProps) {
  const { identity, glowLevel } = useTronTheme();

  return (
    <CardContainer
      $primaryColor={identity.primary}
      $glowLevel={glowLevel}
      $variant={variant}
      $animated={animated}
      {...props}
    >
      {showScanLine && <ScanLine $primaryColor={identity.primary} />}
      {showCorners && (
        <>
          <CornerAccent $position="tl" $primaryColor={identity.primary} />
          <CornerAccent $position="tr" $primaryColor={identity.primary} />
          <CornerAccent $position="bl" $primaryColor={identity.primary} />
          <CornerAccent $position="br" $primaryColor={identity.primary} />
        </>
      )}
      <Box sx={{ p: padding, position: 'relative', zIndex: 1 }}>
        {children}
      </Box>
    </CardContainer>
  );
}
