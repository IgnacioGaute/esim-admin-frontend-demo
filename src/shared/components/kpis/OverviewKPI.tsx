import { ReactNode } from 'react'
import { Box, Paper, Skeleton, Typography, keyframes } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { useTronTheme } from '@/theme/TronThemeContext'

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 255, 255'
}

const glowPulse = keyframes`
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
`

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`

interface OverviewKPIProps {
  value: string | number
  icon?: ReactNode
  overview: string
  stylesBox?: React.CSSProperties
  stylesIconBox?: React.CSSProperties
  loading?: boolean
  trend?: number
  trendLabel?: string
}

export const OverviewKPI = ({
  value,
  overview,
  icon,
  stylesBox,
  stylesIconBox,
  loading = false,
  trend,
  trendLabel,
}: OverviewKPIProps) => {
  const { identity, glowLevel } = useTronTheme()
  const primaryColor = identity.primary
  const primaryRgb = hexToRgb(primaryColor)
  
  // Use icon color if provided, otherwise use theme primary
  const accentColor = (stylesIconBox?.backgroundColor as string) || primaryColor
  const accentRgb = hexToRgb(accentColor)

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          p: 3,
          height: '100%',
          border: `1px solid rgba(${primaryRgb}, 0.2)`,
          bgcolor: 'rgba(15, 15, 25, 0.85)',
          backdropFilter: 'blur(20px)',
          ...stylesBox,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton 
              width="45%" 
              height={48} 
              sx={{ 
                mb: 0.5, 
                bgcolor: `rgba(${primaryRgb}, 0.15)`,
                animation: `${shimmer} 1.5s infinite`,
                backgroundSize: '200% 100%',
              }} 
            />
            <Skeleton 
              width="65%" 
              height={16} 
              sx={{ bgcolor: `rgba(${primaryRgb}, 0.1)` }} 
            />
          </Box>
          <Skeleton 
            variant="rounded" 
            width={56} 
            height={56} 
            sx={{ 
              borderRadius: 2, 
              flexShrink: 0,
              bgcolor: `rgba(${primaryRgb}, 0.15)`,
            }} 
          />
        </Box>
      </Paper>
    )
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        p: 3,
        height: '100%',
        border: `1px solid rgba(${accentRgb}, 0.2)`,
        bgcolor: 'rgba(15, 15, 25, 0.85)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: `rgba(${accentRgb}, 0.4)`,
          boxShadow: glowLevel > 0 
            ? `0 0 ${25 * glowLevel}px rgba(${accentRgb}, 0.15), 0 8px 32px rgba(0, 0, 0, 0.3)`
            : '0 8px 32px rgba(0, 0, 0, 0.3)',
          transform: 'translateY(-2px)',
        },
        ...stylesBox,
      }}
    >
      {/* Corner accents */}
      <Box
        sx={{
          position: 'absolute',
          top: -1,
          left: -1,
          width: 16,
          height: 16,
          borderTop: `2px solid ${accentColor}`,
          borderLeft: `2px solid ${accentColor}`,
          opacity: 0.8,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -1,
          right: -1,
          width: 16,
          height: 16,
          borderBottom: `2px solid ${accentColor}`,
          borderRight: `2px solid ${accentColor}`,
          opacity: 0.8,
        }}
      />

      {/* Decorative grid pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 120,
          height: 120,
          background: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 9px,
              rgba(${accentRgb}, 0.03) 9px,
              rgba(${accentRgb}, 0.03) 10px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 9px,
              rgba(${accentRgb}, 0.03) 9px,
              rgba(${accentRgb}, 0.03) 10px
            )
          `,
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
        {/* Text */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: '2.25rem',
              fontWeight: 700,
              color: '#E8E8E8',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              mb: 0.75,
              textShadow: glowLevel > 0 
                ? `0 0 ${15 * glowLevel}px rgba(${accentRgb}, 0.3)`
                : 'none',
            }}
          >
            {value}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.7rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: accentColor,
              opacity: 0.8,
              mb: trend !== undefined ? 1.5 : 0,
            }}
          >
            {overview}
          </Typography>

          {/* Trend indicator */}
          {trend !== undefined && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1.25,
                py: 0.5,
                borderRadius: 1,
                bgcolor: trend >= 0 ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 65, 54, 0.1)',
                border: `1px solid ${trend >= 0 ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 65, 54, 0.3)'}`,
              }}
            >
              <TrendingUpIcon
                sx={{
                  fontSize: 14,
                  color: trend >= 0 ? '#00FF88' : '#FF4136',
                  transform: trend < 0 ? 'rotate(180deg)' : 'none',
                }}
              />
              <Typography
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: trend >= 0 ? '#00FF88' : '#FF4136',
                  letterSpacing: '0.05em',
                }}
              >
                {trend > 0 ? '+' : ''}
                {trend}%
              </Typography>
              {trendLabel && (
                <Typography 
                  sx={{ 
                    fontSize: '0.65rem', 
                    color: 'rgba(232, 232, 232, 0.5)', 
                    ml: 0.25,
                    letterSpacing: '0.03em',
                  }}
                >
                  {trendLabel}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Icon box */}
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `rgba(${accentRgb}, 0.15)`,
            color: accentColor,
            border: `1px solid rgba(${accentRgb}, 0.3)`,
            transition: 'all 0.3s ease',
            animation: glowLevel > 0 ? `${glowPulse} 3s ease-in-out infinite` : 'none',
            boxShadow: glowLevel > 0 
              ? `0 0 ${12 * glowLevel}px rgba(${accentRgb}, 0.2), inset 0 0 ${8 * glowLevel}px rgba(${accentRgb}, 0.1)`
              : 'none',
            '& svg': {
              fontSize: 26,
            },
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  )
}
