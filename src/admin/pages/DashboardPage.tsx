import { useMemo, useState } from "react";
import { Box, Grid, Skeleton, Typography } from "@mui/material";
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

const DashboardCardSkeleton = () => (
  <Box
    sx={{
      borderRadius: 4,
      border: "1px solid",
      borderColor: "divider",
      p: 3,
      backgroundColor: "background.paper",
      height: "100%",
    }}
  >
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
      <Box sx={{ flex: 1 }}>
        <Skeleton width="45%" height={48} sx={{ mb: 0.5 }} />
        <Skeleton width="65%" height={16} />
      </Box>
      <Skeleton variant="rounded" width={56} height={56} sx={{ borderRadius: 3 }} />
    </Box>
  </Box>
);

const DashboardTableSkeleton = () => (
  <Box
    sx={{
      borderRadius: 4,
      border: "1px solid",
      borderColor: "divider",
      p: 3,
      backgroundColor: "background.paper",
      height: "100%",
    }}
  >
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
      <Skeleton variant="text" width={180} height={30} />
    </Box>
    {[1, 2, 3, 4, 5].map((item) => (
      <Box
        key={item}
        display="flex"
        alignItems="center"
        gap={2}
        py={1.5}
        borderTop="1px solid"
        borderColor="divider"
      >
        <Skeleton variant="circular" width={28} height={28} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width="60%" height={16} />
          <Skeleton width="100%" height={6} sx={{ mt: 0.5 }} />
        </Box>
        <Skeleton variant="text" width={50} height={24} />
      </Box>
    ))}
  </Box>
);

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

export const DashboardPage = () => {
  // Fixed date for overview totals — never changes with the filter
  const overviewDate = useMemo<IFilterDateKPI>(
    () => ({ from: getDateCurrent(), to: getDateCurrent() }),
    []
  );

  // Date controlled by the global filter — only affects the charts
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
    <Box sx={{ p: 3, bgcolor: "#F8F9FC", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h4" 
          fontWeight={800} 
          color="#151D48"
          sx={{ mb: 0.5 }}
        >
          Dashboard
        </Typography>
        <Typography color="text.secondary" fontSize="0.9rem">
          Resumen general de métricas y rendimiento
        </Typography>
      </Box>

      <Grid container spacing={3.5}>
        {/* ── Overview totals (fixed to today, not affected by filter) ── */}
        <Grid item xs={12} sm={6} lg={3}>
          <TotalClientsOverview date={overviewDate} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <TotalCompaniesOverview date={overviewDate} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <TotalEsimsOverview date={overviewDate} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <TotalOrdersOverview date={overviewDate} />
        </Grid>

        {/* ── Global date filter ── */}
        <Grid item xs={12}>
          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
              py: 1,
            }}
          >
            <Typography fontWeight={700} fontSize="1.1rem" color="#151D48">
              Análisis por Período
            </Typography>
            <PeriodFilterKPI onChange={setFilterDate} defaultPeriod="month" />
          </Box>
        </Grid>

        {/* ── Charts (use filterDate) ── */}
        <Grid item xs={12}>
          <TopChannelTableKPI date={filterDate} />
        </Grid>
        <Grid item xs={12}>
          <TopCompanyTableKPI date={filterDate} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <TopResellerTableKPI date={filterDate} />
        </Grid>
        <Grid item xs={12} lg={6}>
          <TopUserTableKPI date={filterDate} />
        </Grid>
        <Grid item xs={12}>
          <TopBundleTableKPI date={filterDate} />
        </Grid>
        <Grid item xs={12}>
          <DestinationRankingChartKPI date={filterDate} />
        </Grid>
      </Grid>
    </Box>
  );
};
