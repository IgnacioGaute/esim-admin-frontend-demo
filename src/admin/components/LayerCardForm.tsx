import { ReactNode } from "react"
import { Box, Card, CardContent, Divider, IconButton, Stack, Typography, keyframes } from "@mui/material"
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded"
import { BoxLoading } from "@/shared/components/BoxLoading"
import { useTronTheme } from "@/theme/TronThemeContext"

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 255, 255';
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

interface Props {
  children: ReactNode
  loading: boolean
  title: string
  onBack: () => void
}

export const LayerCardForm = ({
  children,
  loading,
  title,
  onBack,
}: Props) => {
  const { identity, glowLevel } = useTronTheme();
  const primaryRgb = hexToRgb(identity.primary);

  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",
        overflow: "hidden",
        border: `1px solid rgba(${primaryRgb}, 0.15)`,
        borderRadius: "16px",
        background: "rgba(15, 15, 25, 0.85)",
        backdropFilter: "blur(20px)",
        boxShadow: glowLevel > 0 
          ? `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 ${10 * glowLevel}px rgba(${primaryRgb}, 0.05)`
          : "0 8px 32px rgba(0, 0, 0, 0.3)",
        animation: `${fadeIn} 0.4s ease-out`,
        transition: "all 0.3s ease",
        "&:hover": {
          borderColor: `rgba(${primaryRgb}, 0.25)`,
        },
      }}
    >
      <BoxLoading
        isLoading={loading}
        title="Cargando..."
        position="absolute"
      />

      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ mb: 3 }}
        >
          <IconButton
            onClick={onBack}
            sx={{
              width: 44,
              height: 44,
              border: `1px solid rgba(${primaryRgb}, 0.3)`,
              borderRadius: "12px",
              bgcolor: `rgba(${primaryRgb}, 0.08)`,
              color: identity.primary,
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: `rgba(${primaryRgb}, 0.15)`,
                borderColor: `rgba(${primaryRgb}, 0.5)`,
                boxShadow: glowLevel > 0 
                  ? `0 0 ${12 * glowLevel}px rgba(${primaryRgb}, 0.25)`
                  : "none",
                transform: "translateX(-2px)",
              },
            }}
          >
            <ArrowBackRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>

          <Box minWidth={0} flex={1}>
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: "1.35rem",
                lineHeight: 1.2,
                color: identity.primary,
                letterSpacing: "0.02em",
                textShadow: glowLevel > 0 
                  ? `0 0 ${15 * glowLevel}px rgba(${primaryRgb}, 0.4)`
                  : "none",
              }}
            >
              {title}
            </Typography>

            <Typography 
              variant="body2" 
              sx={{ 
                mt: 0.5,
                fontSize: "12px",
                color: "rgba(232, 232, 232, 0.5)",
                letterSpacing: "0.05em",
              }}
            >
              Completa la informacion requerida
            </Typography>
          </Box>
        </Stack>

        <Divider
          sx={{
            mb: 3,
            borderColor: `rgba(${primaryRgb}, 0.12)`,
          }}
        />

        <Box>{children}</Box>
      </CardContent>
    </Card>
  )
}
