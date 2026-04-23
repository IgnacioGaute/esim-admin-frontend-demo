import { Box, BoxProps, Fade, Typography, keyframes } from "@mui/material"
import { useTronTheme } from "@/theme/TronThemeContext"

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "0, 255, 255"
}

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const pulse = keyframes`
  0%, 100% {
    opacity: 0.4;
    transform: scale(0.95);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
`

const shimmer = keyframes`
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
`

interface Props extends BoxProps {
  positionContainer?: "relative" | "absolute" | "fixed"
  isLoading: boolean
  title?: string
  isTransparent?: boolean
  showGif?: boolean
}

export const BoxLoading = ({
  positionContainer = "absolute",
  isLoading,
  zIndex = 24,
  title,
  isTransparent = false,
  sx,
  ...propsBox
}: Props) => {
  const { identity, glowLevel } = useTronTheme()
  const primaryColor = identity.primary
  const primaryRgb = hexToRgb(primaryColor)

  return (
    <Fade in={isLoading} timeout={{ enter: 250, exit: 180 }} unmountOnExit>
      <Box
        {...propsBox}
        position={positionContainer}
        zIndex={isLoading ? zIndex : -1}
        top={0}
        left={0}
        right={0}
        bottom={0}
        width="100%"
        height="100%"
        minHeight={positionContainer === "fixed" ? "100vh" : undefined}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{
          pointerEvents: isLoading ? "all" : "none",
          backgroundColor: isTransparent
            ? "transparent"
            : "rgba(10, 10, 18, 0.85)",
          backdropFilter: isTransparent ? "none" : "blur(12px)",
          ...sx,
        }}
      >
        {/* Tron-style loading rings */}
        <Box
          sx={{
            position: "relative",
            width: 80,
            height: 80,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Outer rotating ring */}
          <Box
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              border: "2px solid transparent",
              borderTopColor: primaryColor,
              borderRightColor: `rgba(${primaryRgb}, 0.3)`,
              animation: `${rotate} 1.2s linear infinite`,
              boxShadow: glowLevel > 0 
                ? `0 0 ${15 * glowLevel}px rgba(${primaryRgb}, 0.4)`
                : "none",
            }}
          />
          
          {/* Middle ring */}
          <Box
            sx={{
              position: "absolute",
              width: "70%",
              height: "70%",
              borderRadius: "50%",
              border: `1px solid rgba(${primaryRgb}, 0.3)`,
              animation: `${rotate} 2s linear infinite reverse`,
            }}
          />
          
          {/* Inner pulsing ring */}
          <Box
            sx={{
              position: "absolute",
              width: "50%",
              height: "50%",
              borderRadius: "50%",
              border: `2px solid ${primaryColor}`,
              animation: `${pulse} 1.5s ease-in-out infinite`,
              boxShadow: glowLevel > 0 
                ? `0 0 ${10 * glowLevel}px rgba(${primaryRgb}, 0.5)`
                : "none",
            }}
          />
          
          {/* Center dot */}
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: primaryColor,
              boxShadow: glowLevel > 0 
                ? `0 0 ${15 * glowLevel}px ${primaryColor}`
                : "none",
              animation: `${pulse} 1.2s ease-in-out infinite`,
            }}
          />
        </Box>

        {title && (
          <Typography
            component="span"
            mt={3}
            fontSize={12}
            fontWeight={600}
            letterSpacing="0.15em"
            textTransform="uppercase"
            sx={{
              background: `linear-gradient(90deg, rgba(${primaryRgb}, 0.6), ${primaryColor}, rgba(${primaryRgb}, 0.6))`,
              backgroundSize: "200% auto",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: `${shimmer} 2s linear infinite`,
            }}
          >
            {title}
          </Typography>
        )}
      </Box>
    </Fade>
  )
}
