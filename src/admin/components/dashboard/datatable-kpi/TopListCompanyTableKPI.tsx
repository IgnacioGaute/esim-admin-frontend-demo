import { Box, Paper, Skeleton, Typography } from "@mui/material";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import { BarChart } from "@mui/x-charts/BarChart";
import { ITopCompanyKPI } from "@/admin/utils/interfaces/dashboard-kpi.interface";

interface IProps {
  topListCompany: ITopCompanyKPI[];
  loading?: boolean;
}

// eSIM Demo brand palette
const ESIM_NAVY = "#1C3680";
const ESIM_RED  = "#F2003D";

const HEADER_GRADIENT = "linear-gradient(135deg, #0D1B4B 0%, #1C3680 60%, #2D4FA8 100%)";

const MEDAL = ["🥇", "🥈", "🥉"];

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

export const TopListCompanyTableKPI = ({ topListCompany, loading }: IProps) => {
  const sorted = [...topListCompany]
    .sort((a, b) => b.completeOrderByReseller - a.completeOrderByReseller)
    .slice(0, 8);

  const totalOrders = topListCompany.reduce((s, d) => s + d.completeOrderByReseller, 0);
  const maxValue = Math.max(...sorted.map((d) => d.completeOrderByReseller), 1);

  const chartLabels = sorted.slice(0, 6).map((d) => truncate(d.companyName, 12));
  const chartValues = sorted.slice(0, 6).map((d) => d.completeOrderByReseller);

  return (
    <Paper elevation={0} sx={{ borderRadius: 4, overflow: "hidden", height: "100%", border: "1px solid", borderColor: "divider", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        sx={{
          background: HEADER_GRADIENT,
          px: 3,
          py: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              bgcolor: "rgba(242,0,61,0.2)",
              border: "1px solid rgba(242,0,61,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FF6B8E",
              flexShrink: 0,
            }}
          >
            <BusinessOutlinedIcon />
          </Box>
          <Box>
            <Typography fontWeight={800} fontSize="1.1rem" color="white" lineHeight={1.1}>
              Top Empresas
            </Typography>
            <Typography fontSize="0.75rem" color="rgba(255,255,255,0.45)" mt={0.2}>
              Por órdenes de resellers completadas
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-end" }}>
          <Box sx={{ textAlign: "right" }}>
            <Typography fontWeight={800} fontSize="1.6rem" color="white" lineHeight={1}>
              {totalOrders.toLocaleString()}
            </Typography>
            <Typography fontSize="0.62rem" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.08em">
              órdenes
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography fontWeight={800} fontSize="1.6rem" color="#FF6B8E" lineHeight={1}>
              {topListCompany.length}
            </Typography>
            <Typography fontSize="0.62rem" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.08em">
              empresas
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ px: 3, py: 2.5, bgcolor: "#EEF2F7", flex: 1 }}>
        {loading ? (
          <LoadingSkeleton />
        ) : sorted.length === 0 ? (
          <EmptyState />
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Vertical BarChart */}
            <Box sx={{ width: "100%", bgcolor: "white", borderRadius: 3, p: 1, border: "1px solid", borderColor: "divider" }}>
              <BarChart
                xAxis={[{
                  scaleType: "band",
                  data: chartLabels,
                  tickLabelStyle: { fontSize: 10, fill: "#64748B" },
                }]}
                yAxis={[{ tickMinStep: 1 }]}
                series={[
                  {
                    data: chartValues,
                    label: "Órdenes",
                    color: ESIM_NAVY,
                  },
                ]}
                height={200}
                margin={{ top: 16, right: 16, bottom: 40, left: 48 }}
                borderRadius={6}
                slotProps={{
                  legend: { hidden: true },
                }}
                sx={{
                  "& .MuiChartsAxis-line": { stroke: "#E2E8F0" },
                  "& .MuiChartsAxis-tick": { stroke: "#E2E8F0" },
                  width: "100%",
                }}
              />
            </Box>

            {/* Ranking rows */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
              {sorted.map((company, index) => {
                const pct = (company.completeOrderByReseller / maxValue) * 100;
                return (
                  <Box
                    key={company.companyId || `${company.companyName}-${index}`}
                    sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1, borderRadius: 2, transition: "background 0.15s", "&:hover": { bgcolor: `${ESIM_NAVY}08` } }}
                  >
                    <Box sx={{ width: 32, textAlign: "center", flexShrink: 0 }}>
                      {index < 3 ? (
                        <Typography fontSize="1.25rem" lineHeight={1}>{MEDAL[index]}</Typography>
                      ) : (
                        <Typography fontWeight={800} fontSize="0.9rem" color="#94A3B8">{index + 1}</Typography>
                      )}
                    </Box>

                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography fontSize="0.83rem" fontWeight={600} color="#0D1B4B" noWrap sx={{ mb: 0.5 }}>
                        {truncate(company.companyName, 28)}
                      </Typography>
                      <Box sx={{ height: 10, borderRadius: 2, bgcolor: "#E2E8F0", overflow: "hidden" }}>
                        <Box
                          sx={{
                            width: `${pct}%`,
                            height: "100%",
                            borderRadius: 2,
                            background: `linear-gradient(90deg, ${ESIM_NAVY}, #4B6EC7)`,
                            transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)",
                          }}
                        />
                      </Box>
                    </Box>

                    <Box sx={{ textAlign: "right", flexShrink: 0, minWidth: 56 }}>
                      <Typography fontSize="1rem" fontWeight={800} color={ESIM_NAVY} lineHeight={1}>
                        {company.completeOrderByReseller.toLocaleString()}
                      </Typography>
                      <Typography fontSize="0.6rem" color="#94A3B8" textTransform="uppercase" letterSpacing="0.05em">
                        órdenes
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

const LoadingSkeleton = () => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    <Skeleton variant="rounded" width="100%" height={200} sx={{ borderRadius: 3 }} />
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1 }}>
          <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: 2 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="55%" height={14} sx={{ mb: 0.5 }} />
            <Skeleton variant="rounded" width="100%" height={10} sx={{ borderRadius: 2 }} />
          </Box>
          <Skeleton width={52} height={22} />
        </Box>
      ))}
    </Box>
  </Box>
);

const EmptyState = () => (
  <Box sx={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <Typography color="text.secondary" fontSize="0.85rem">Sin datos para mostrar</Typography>
  </Box>
);

// Suppress unused import warning
void ESIM_RED;
