import { ReactNode } from "react"
import { Box, Card, CardContent, Divider, IconButton, Stack, Typography } from "@mui/material"
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded"
import { BoxLoading } from "@/shared/components/BoxLoading"

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
  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        background: "linear-gradient(180deg, #ffffff 0%, #fcfcfc 100%)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
      }}
    >
      <BoxLoading
        isLoading={loading}
        title="Cargando..."
        position="absolute"
      />

      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{ mb: 2 }}
        >
          <IconButton
            color="primary"
            onClick={onBack}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
              "&:hover": {
                bgcolor: "action.hover",
              },
            }}
          >
            <ArrowBackRoundedIcon />
          </IconButton>

          <Box minWidth={0} flex={1}>
            <Typography
              variant="h5"
              component="h1"
              fontWeight={800}
              sx={{
                lineHeight: 1.2,
                textTransform: "none",
              }}
            >
              {title}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Completá la información requerida
            </Typography>
          </Box>
        </Stack>

        <Divider
          sx={{
            mb: 3,
            borderColor: "divider",
            opacity: 0.9,
          }}
        />

        <Box>{children}</Box>
      </CardContent>
    </Card>
  )
}