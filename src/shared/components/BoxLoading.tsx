import { Box, BoxProps, CircularProgress, Fade, Typography, keyframes } from "@mui/material"
import LoadGif from "@/assets/gif/plane.gif"

const pulseRing = keyframes`
  0% {
    transform: scale(0.92);
    opacity: 0.45;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.15;
  }
  100% {
    transform: scale(0.92);
    opacity: 0.45;
  }
`

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
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
  showGif = false,
  sx,
  ...propsBox
}: Props) => {
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
            : (theme) =>
                theme.palette.mode === "dark"
                  ? "rgba(15, 23, 42, 0.72)"
                  : "rgba(255, 255, 255, 0.78)",
          backdropFilter: isTransparent ? "none" : "blur(8px)",
          ...sx,
        }}
      >
        {showGif ? (
          <Box
            sx={{
              position: "relative",
              width: 160,
              height: 160,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(6px)",
              boxShadow: "0 18px 50px rgba(37, 99, 235, 0.10)",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                width: 150,
                height: 150,
                borderRadius: "50%",
                background: "rgba(59,130,246,0.08)",
                animation: `${pulseRing} 2s ease-in-out infinite`,
              }}
            />

            <Box
              sx={{
                width: 92,
                height: 92,
                borderRadius: "50%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                zIndex: 1,
                animation: `${float} 2.4s ease-in-out infinite`,
              }}
            >
              <Box
                component="img"
                src={LoadGif}
                alt="Loading"
                sx={{
                  width: 170,
                  height: 170,
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                  filter: "drop-shadow(0 8px 18px rgba(59,130,246,0.18))",
                }}
              />
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.primary.light}30)`,
                animation: `${pulseRing} 2s ease-in-out infinite`,
              }}
            />
            <CircularProgress
              color="primary"
              size={44}
              thickness={3.5}
              sx={{
                "& .MuiCircularProgress-circle": {
                  strokeLinecap: "round",
                },
                filter: (theme) =>
                  `drop-shadow(0 0 8px ${theme.palette.primary.main}50)`,
              }}
            />
          </Box>
        )}

        {title && (
          <Typography
            component="span"
            mt={2.5}
            fontSize={15}
            fontWeight={700}
            letterSpacing={0.25}
            sx={{
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "linear-gradient(90deg, #94a3b8, #e2e8f0, #94a3b8)"
                  : "linear-gradient(90deg, #475569, #1e293b, #475569)",
              backgroundSize: "200% auto",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: `${shimmer} 3s linear infinite`,
            }}
          >
            {title}
          </Typography>
        )}
      </Box>
    </Fade>
  )
}