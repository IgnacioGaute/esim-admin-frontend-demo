import { ReactNode } from 'react'
import { Box, Paper, Skeleton, Typography } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

interface OverviewKPIProps {
  value: string | number;
  icon?: ReactNode;
  overview: string;
  stylesBox?: React.CSSProperties;
  stylesIconBox?: React.CSSProperties;
  loading?: boolean;
  trend?: number;
  trendLabel?: string;
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
  const accentColor = (stylesIconBox?.backgroundColor as string) || '#6671E2'

  if (loading) {
    return (
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          p: 3,
          height: '100%',
          border: `1px solid`,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          ...stylesBox,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Skeleton width="45%" height={48} sx={{ mb: 0.5 }} />
            <Skeleton width="65%" height={16} />
          </Box>
          <Skeleton variant="rounded" width={56} height={56} sx={{ borderRadius: 3, flexShrink: 0 }} />
        </Box>
      </Paper>
    )
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        p: 3,
        height: '100%',
        border: `1px solid`,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: `${accentColor}40`,
          boxShadow: `0 8px 32px ${accentColor}15`,
          transform: 'translateY(-2px)',
        },
        ...stylesBox,
      }}
    >
      {/* Decorative gradient */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 120,
          height: 120,
          background: `radial-gradient(circle at top right, ${accentColor}10, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
        {/* Text */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#151D48',
              lineHeight: 1,
              letterSpacing: '-1px',
              mb: 0.5,
            }}
          >
            {value}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#737791',
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
                borderRadius: 2,
                bgcolor: trend >= 0 ? '#10B98115' : '#EF444415',
              }}
            >
              <TrendingUpIcon 
                sx={{ 
                  fontSize: 14, 
                  color: trend >= 0 ? '#10B981' : '#EF4444',
                  transform: trend < 0 ? 'rotate(180deg)' : 'none',
                }} 
              />
              <Typography 
                sx={{ 
                  fontSize: '0.72rem', 
                  fontWeight: 700, 
                  color: trend >= 0 ? '#10B981' : '#EF4444' 
                }}
              >
                {trend > 0 ? '+' : ''}{trend}%
              </Typography>
              {trendLabel && (
                <Typography sx={{ fontSize: '0.68rem', color: 'text.secondary', ml: 0.25 }}>
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
            borderRadius: 3,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${accentColor}15`,
            color: accentColor,
            transition: 'all 0.2s',
            '& svg': {
              fontSize: 28,
            },
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  )
}
