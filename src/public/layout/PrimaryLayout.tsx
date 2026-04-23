import { ReactNode } from 'react';
import { Box, keyframes, styled } from '@mui/material';
import { Grid3D } from '@/shared/components/tron';
import { useTronTheme } from '@/theme/TronThemeContext';
import { stylesLayout } from './Layout.style';

import Logo2x from '@/assets/images/logo/esim-logo.svg';

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 255, 255';
}

const borderGlow = keyframes`
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
`;

const GlowCard = styled(Box)<{ $color: string; $glowLevel: number }>(
  ({ $color, $glowLevel }) => ({
    border: `1px solid rgba(${hexToRgb($color)}, 0.3)`,
    boxShadow: $glowLevel > 0
      ? `0 0 ${30 * $glowLevel}px rgba(${hexToRgb($color)}, 0.15),
         0 8px 32px rgba(0, 0, 0, 0.4),
         inset 0 0 ${20 * $glowLevel}px rgba(${hexToRgb($color)}, 0.05)`
      : '0 8px 32px rgba(0, 0, 0, 0.4)',
    transition: 'all 0.4s ease',
    animation: $glowLevel > 0 ? `${borderGlow} 4s ease-in-out infinite` : 'none',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: -1,
      left: -1,
      width: '24px',
      height: '24px',
      borderTop: `2px solid ${$color}`,
      borderLeft: `2px solid ${$color}`,
      borderRadius: '12px 0 0 0',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: -1,
      right: -1,
      width: '24px',
      height: '24px',
      borderBottom: `2px solid ${$color}`,
      borderRight: `2px solid ${$color}`,
      borderRadius: '0 0 12px 0',
    },
  })
);

const LogoContainer = styled(Box)<{ $color: string }>(({ $color }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '& img': {
    filter: 'brightness(0) invert(1)',
    opacity: 0.9,
    transition: 'all 0.3s ease',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: '-12px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '60%',
    height: '1px',
    background: `linear-gradient(90deg, transparent, rgba(${hexToRgb($color)}, 0.5), transparent)`,
  },
}));

interface Props {
  children: ReactNode;
  type?: 'primary' | 'secondary';
}

export const PrimaryLayout = ({ children, type = 'primary' }: Props) => {
  const styles = stylesLayout();
  const { identity, glowLevel } = useTronTheme();

  return (
    <Box component="section" sx={[styles.main, type === 'primary' && styles.primary]}>
      <Grid3D />
      {type === 'primary' ? (
        <GlowCard
          sx={styles.card}
          $color={identity.primary}
          $glowLevel={glowLevel}
        >
          <LogoContainer mb={4} textAlign="center" height="5rem" $color={identity.primary}>
            <img src={Logo2x} alt="eSIM Demo Logo" className="image-size-maxFull" />
          </LogoContainer>
          {children}
        </GlowCard>
      ) : (
        children
      )}
    </Box>
  );
};
