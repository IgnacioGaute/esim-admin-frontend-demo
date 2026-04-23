import { Box, Typography, keyframes, styled } from '@mui/material';
import { useTronTheme } from '../../../theme/TronThemeContext';
import { GridBackground } from './GridBackground';

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 0.4;
    transform: scale(0.95);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
`;

const typewriter = keyframes`
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
`;

const blink = keyframes`
  50% {
    opacity: 0;
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 255, 255';
}

const LoadingContainer = styled(Box)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  background: '#0A0A0F',
});

const ContentWrapper = styled(Box)({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '32px',
  animation: `${fadeIn} 0.8s ease-out`,
});

const RingContainer = styled(Box)({
  position: 'relative',
  width: '120px',
  height: '120px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const OuterRing = styled(Box)<{ $color: string; $glowLevel: number }>(
  ({ $color, $glowLevel }) => ({
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: `2px solid transparent`,
    borderTopColor: $color,
    borderRightColor: `rgba(${hexToRgb($color)}, 0.3)`,
    animation: `${rotate} 1.5s linear infinite`,
    boxShadow: $glowLevel > 0 
      ? `0 0 ${20 * $glowLevel}px rgba(${hexToRgb($color)}, 0.4),
         inset 0 0 ${20 * $glowLevel}px rgba(${hexToRgb($color)}, 0.1)`
      : 'none',
  })
);

const MiddleRing = styled(Box)<{ $color: string }>(({ $color }) => ({
  position: 'absolute',
  width: '80%',
  height: '80%',
  borderRadius: '50%',
  border: `1px solid rgba(${hexToRgb($color)}, 0.3)`,
  animation: `${rotate} 2s linear infinite reverse`,
}));

const InnerRing = styled(Box)<{ $color: string; $glowLevel: number }>(
  ({ $color, $glowLevel }) => ({
    position: 'absolute',
    width: '60%',
    height: '60%',
    borderRadius: '50%',
    border: `2px solid ${$color}`,
    animation: `${pulse} 2s ease-in-out infinite`,
    boxShadow: $glowLevel > 0 
      ? `0 0 ${15 * $glowLevel}px rgba(${hexToRgb($color)}, 0.6)`
      : 'none',
  })
);

const CenterDot = styled(Box)<{ $color: string; $glowLevel: number }>(
  ({ $color, $glowLevel }) => ({
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: $color,
    boxShadow: $glowLevel > 0 
      ? `0 0 ${20 * $glowLevel}px ${$color}`
      : 'none',
    animation: `${pulse} 1.5s ease-in-out infinite`,
  })
);

const StatusText = styled(Box)<{ $color: string }>(({ $color }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  overflow: 'hidden',
}));

const TypewriterText = styled(Typography)<{ $color: string }>(({ $color }) => ({
  color: $color,
  fontSize: '12px',
  fontWeight: 600,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  animation: `${typewriter} 2s steps(20, end) forwards`,
}));

const Cursor = styled(Box)<{ $color: string }>(({ $color }) => ({
  width: '2px',
  height: '14px',
  background: $color,
  animation: `${blink} 0.8s step-end infinite`,
  marginLeft: '2px',
}));

const SubText = styled(Typography)({
  color: 'rgba(255, 255, 255, 0.4)',
  fontSize: '10px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  animation: `${fadeIn} 1s ease-out 0.5s both`,
});

const ProgressBar = styled(Box)<{ $color: string }>(({ $color }) => ({
  width: '200px',
  height: '2px',
  background: `rgba(${hexToRgb($color)}, 0.2)`,
  borderRadius: '1px',
  overflow: 'hidden',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-50%',
    width: '50%',
    height: '100%',
    background: `linear-gradient(90deg, transparent, ${$color}, transparent)`,
    animation: `${shimmer} 1.5s ease-in-out infinite`,
  },
}));

const shimmer = keyframes`
  0% {
    left: -50%;
  }
  100% {
    left: 100%;
  }
`;

interface TronLoadingProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
}

export function TronLoading({ 
  message = 'INITIALIZING SYSTEM', 
  subMessage = 'Please wait...',
  fullScreen = true 
}: TronLoadingProps) {
  const { identity, glowLevel } = useTronTheme();

  const content = (
    <ContentWrapper>
      <RingContainer>
        <OuterRing $color={identity.primary} $glowLevel={glowLevel} />
        <MiddleRing $color={identity.primary} />
        <InnerRing $color={identity.primary} $glowLevel={glowLevel} />
        <CenterDot $color={identity.primary} $glowLevel={glowLevel} />
      </RingContainer>
      
      <StatusText $color={identity.primary}>
        <TypewriterText $color={identity.primary}>{message}</TypewriterText>
        <Cursor $color={identity.primary} />
      </StatusText>
      
      <ProgressBar $color={identity.primary} />
      
      {subMessage && <SubText>{subMessage}</SubText>}
    </ContentWrapper>
  );

  if (fullScreen) {
    return (
      <LoadingContainer>
        <GridBackground showOrbs={false} intensity={0.5} />
        {content}
      </LoadingContainer>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '200px',
      position: 'relative',
    }}>
      {content}
    </Box>
  );
}

// Compact loading spinner for inline use
export function TronSpinner({ size = 40 }: { size?: number }) {
  const { identity, glowLevel } = useTronTheme();

  return (
    <Box sx={{ 
      width: size, 
      height: size, 
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <OuterRing 
        $color={identity.primary} 
        $glowLevel={glowLevel}
        sx={{ width: '100%', height: '100%' }}
      />
      <CenterDot 
        $color={identity.primary} 
        $glowLevel={glowLevel}
        sx={{ width: size * 0.15, height: size * 0.15 }}
      />
    </Box>
  );
}
