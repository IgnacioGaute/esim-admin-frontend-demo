import { useMemo, useState } from "react";
import { Box, Grid, Skeleton, Typography, keyframes, styled } from "@mui/material";
import {
  TopBundleTableKPI,
  TopChannelTableKPI,
  TopCompanyTableKPI,
  TopResellerTableKPI,
  DestinationRankingChartKPI,
  TotalClientsOverview,
  TotalCompaniesOverview,
  TotalEsimsOverview,
  TotalOrdersOverview,
  TopUserTableKPI,
} from "../modules/kpis";
import { IFilterDateKPI, PeriodFilterKPI } from "@/shared/components/kpis";
import { getDateCurrent, getDateMonthFromTo } from "@/shared/helpers/handligDateHelper";
import { useTronTheme } from "@/theme/TronThemeContext";

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "0, 255, 255";
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const DashboardCardSkeleton = () => {
  const { identity } = useTronTheme();
  const primaryRgb = hexToRgb(identity.primary);

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: `1px solid rgba(${primaryRgb}, 0.2)`,
        p: 3,
        backgroundColor: "rgba(15, 15, 25, 0.85)",
        backdropFilter: "blur(20px)",
        height: "100%",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box sx={{ flex: 1 }}>
          <Skeleton 
            width="45%" 
            height={48} 
            sx={{ 
              mb: 0.5, 
              bgcolor: `rgba(${primaryRgb}, 0.15)`,
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
            bgcolor: `rgba(${primaryRgb}, 0.15)`,
          }} 
        />
      </Box>
    </Box>
  );
};

const DashboardTableSkeleton = () => {
  const { identity } = useTronTheme();
  const primaryRgb = hexToRgb(identity.primary);

  return (
    <Box
      sx={{
        borderRadius: 3,
        border: `1px solid rgba(${primaryRgb}, 0.2)`,
        p: 3,
        backgroundColor: "rgba(15, 15, 25, 0.85)",
        backdropFilter: "blur(20px)",
        height: "100%",
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Skeleton 
          variant="text" 
          width={180} 
          height={30} 
          sx={{ bgcolor: `rgba(${primaryRgb}, 0.15)` }}
        />
      </Box>
      {[1, 2, 3, 4, 5].map((item) => (
        <Box
          key={item}
          display="flex"
          alignItems="center"
          gap={2}
          py={1.5}
          borderTop={`1px solid rgba(${primaryRgb}, 0.1)`}
        >
          <Skeleton 
            variant="circular" 
            width={28} 
            height={28} 
            sx={{ bgcolor: `rgba(${primaryRgb}, 0.15)` }}
          />
          <Box sx={{ flex: 1 }}>
            <Skeleton 
              width="60%" 
              height={16} 
              sx={{ bgcolor: `rgba(${primaryRgb}, 0.1)` }}
            />
            <Skeleton 
              width="100%" 
              height={6} 
              sx={{ mt: 0.5, bgcolor: `rgba(${primaryRgb}, 0.1)` }}
            />
          </Box>
          <Skeleton 
            variant="text" 
            width={50} 
            height={24} 
            sx={{ bgcolor: `rgba(${primaryRgb}, 0.15)` }}
          />
        </Box>
      ))}
    </Box>
  );
};

const DashboardPageSkeleton = () => (
  <Grid container spacing={2.5}>
    {[0, 1, 2, 3].map((i) => (
      <Grid key={i} item xs={12} sm={6} lg={3}>
        <DashboardCardSkeleton />
      </Grid>
    ))}
    {[0, 1, 2, 3].map((i) => (
      <Grid key={i} item xs={12} lg={6}>
        <DashboardTableSkeleton />
      </Grid>
    ))}
  </Grid>
);

const SectionTitle = styled(Typography)<{ $color: string }>(({ $color }) => ({
  fontSize: "0.7rem",
  fontWeight: 700,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  color: `rgba(${hexToRgb($color)}, 0.6)`,
  display: "flex",
  alignItems: "center",
  gap: "12px",
  "&::after": {
    content: '""',
    flex: 1,
    height: "1px",
    background: `linear-gradient(90deg, rgba(${hexToRgb($color)}, 0.3), transparent)`,
  },
}));

export const DashboardPage = () => {
  const { identity, glowLevel } = useTronTheme();
  const primaryColor = identity.primary;
  const primaryRgb = hexToRgb(primaryColor);

  // Fixed date for overview totals - never changes with the filter
  const overviewDate = useMemo<IFilterDateKPI>(
    () => ({ from: getDateCurrent(), to: getDateCurrent() }),
    []
  );

  // Date controlled by the global filter - only affects the charts
  const [filterDate, setFilterDate] = useState<IFilterDateKPI | null>(
    getDateMonthFromTo()
  );

  const loadingDashboard = false;

  if (loadingDashboard) {
    return (
      <Box sx={{ p: 3 }}>
        <DashboardPageSkeleton />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        p: 3, 
        minHeight: "100vh",
        position: "relative",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(ellipse at 20% 20%, rgba(${primaryRgb}, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(${primaryRgb}, 0.05) 0%, transparent 50%)
          `,
          pointerEvents: "none",
          zIndex: 0,
        },
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          mb: 4, 
          position: "relative", 
          zIndex: 1,
          animation: `${fadeIn} 0.5s ease-out`,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: primaryColor,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontSize: "1.5rem",
            mb: 0.5,
            textShadow: glowLevel > 0 
              ? `0 0 ${20 * glowLevel}px rgba(${primaryRgb}, 0.5)`
              : "none",
          }}
        >
          Dashboard
        </Typography>
        <Typography 
          sx={{
            color: "rgba(232, 232, 232, 0.5)",
            fontSize: "0.8rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Resumen general de metricas y rendimiento
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ position: "relative", zIndex: 1 }}>
        {/* Section label */}
        <Grid item xs={12}>
          <SectionTitle $color={primaryColor}>
            Resumen General
          </SectionTitle>
        </Grid>

        {/* Overview totals (fixed to today, not affected by filter) */}
        <Grid item xs={12} sm={6} lg={3}>
          <Box sx={{ animation: `${fadeIn} 0.5s ease-out 0.1s both` }}>
            <TotalClientsOverview date={overviewDate} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Box sx={{ animation: `${fadeIn} 0.5s ease-out 0.15s both` }}>
            <TotalCompaniesOverview date={overviewDate} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Box sx={{ animation: `${fadeIn} 0.5s ease-out 0.2s both` }}>
            <TotalEsimsOverview date={overviewDate} />
          </Box>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Box sx={{ animation: `${fadeIn} 0.5s ease-out 0.25s both` }}>
            <TotalOrdersOverview date={overviewDate} />
          </Box>
        </Grid>

        {/* Global date filter */}
        <Grid item xs={12}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
              py: 2,
              mt: 2,
              animation: `${fadeIn} 0.5s ease-out 0.3s both`,
            }}
          >
            <SectionTitle $color={primaryColor} sx={{ flex: 1 }}>
              Analisis por Periodo
            </SectionTitle>
            <PeriodFilterKPI onChange={setFilterDate} defaultPeriod="month" />
          </Box>
        </Grid>

        {/* Charts (use filterDate) */}
        <Grid item xs={12}>
          <Box sx={{ animation: `${fadeIn} 0.5s ease-out 0.35s both` }}>
            <TopChannelTableKPI date={filterDate} />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ animation: `${fadeIn} 0.5s ease-out 0.4s both` }}>
            <TopCompanyTableKPI date={filterDate} />
          </Box>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Box sx={{ animation: `${fadeIn} 0.5s ease-out 0.45s both` }}>
            <TopResellerTableKPI date={filterDate} />
          </Box>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Box sx={{ animation: `${fadeIn} 0.5s ease-out 0.5s both` }}>
            <TopUserTableKPI date={filterDate} />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ animation: `${fadeIn} 0.5s ease-out 0.55s both` }}>
            <TopBundleTableKPI date={filterDate} />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ animation: `${fadeIn} 0.5s ease-out 0.6s both` }}>
            <DestinationRankingChartKPI date={filterDate} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
