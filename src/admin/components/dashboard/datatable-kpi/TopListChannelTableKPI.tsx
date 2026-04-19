import {
  Box,
  Paper,
  Skeleton,
  Typography,
  Chip,
} from "@mui/material";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SmartphoneOutlinedIcon from "@mui/icons-material/SmartphoneOutlined";
import { PieChart } from "@mui/x-charts/PieChart";
import { ITopChannelKPI } from "@/admin/utils/interfaces/dashboard-kpi.interface";

interface IProps {
  topListChannel: ITopChannelKPI[];
  loading?: boolean;
}

// eSIM Demo brand palette
const ESIM_NAVY = "#1C3680";
const ESIM_RED  = "#F2003D";
const ESIM_SKY  = "#0EA5E9";

const HEADER_GRADIENT = "linear-gradient(135deg, #0D1B4B 0%, #1C3680 60%, #2D4FA8 100%)";

const CHANNEL_CONFIG: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  RESELLER: {
    color: ESIM_NAVY,
    label: "Reseller",
    icon: <PeopleAltOutlinedIcon sx={{ fontSize: 18 }} />,
  },
  WEB: {
    color: ESIM_RED,
    label: "Web",
    icon: <LanguageOutlinedIcon sx={{ fontSize: 18 }} />,
  },
  APP: {
    color: ESIM_SKY,
    label: "App",
    icon: <SmartphoneOutlinedIcon sx={{ fontSize: 18 }} />,
  },
};

export const TopListChannelTableKPI = ({ topListChannel, loading }: IProps) => {
  const ALL_CHANNELS = ["RESELLER", "WEB", "APP"];
  const channels = ALL_CHANNELS.map((ch) => {
    const found = topListChannel.find((d) => d.channel === ch);
    return found ?? { channel: ch, completed: 0, initialized: 0 };
  });
  const totalCompleted  = channels.reduce((s, d) => s + d.completed, 0);
  const totalInitialized = channels.reduce((s, d) => s + d.initialized, 0);

  const pieData = channels.map((d, i) => ({
    id: i,
    value: d.completed || 0.001, // avoid empty pie
    label: CHANNEL_CONFIG[d.channel]?.label ?? d.channel,
    color: CHANNEL_CONFIG[d.channel]?.color,
  }));

  return (
    <Paper
      elevation={0}
      sx={{ borderRadius: 4, overflow: "hidden", border: "1px solid", borderColor: "divider", display: "flex", flexDirection: "column" }}
    >
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
            <BarChartOutlinedIcon />
          </Box>
          <Box>
            <Typography fontWeight={800} fontSize="1.1rem" color="white" lineHeight={1.1}>
              Distribución por Canal
            </Typography>
            <Typography fontSize="0.75rem" color="rgba(255,255,255,0.45)" mt={0.2}>
              Completados vs iniciados
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-end" }}>
          <Box sx={{ textAlign: "right" }}>
            <Typography fontWeight={800} fontSize="1.6rem" color="white" lineHeight={1}>
              {totalCompleted.toLocaleString()}
            </Typography>
            <Typography fontSize="0.62rem" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.08em">
              completados
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography fontWeight={800} fontSize="1.6rem" color="#FF6B8E" lineHeight={1}>
              {totalInitialized.toLocaleString()}
            </Typography>
            <Typography fontSize="0.62rem" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.08em">
              iniciados
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ px: 3, py: 3, bgcolor: "#EEF2F7" }}>
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "260px 1fr" },
              gap: 3,
              alignItems: "center",
            }}
          >
            {/* ── Left: Donut + totals ── */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <Box sx={{ position: "relative", flexShrink: 0 }}>
                <PieChart
                  series={[
                    {
                      data: pieData,
                      innerRadius: 72,
                      outerRadius: 115,
                      paddingAngle: 3,
                      cornerRadius: 6,
                      cx: 115,
                      cy: 115,
                    },
                  ]}
                  width={230}
                  height={230}
                  slotProps={{ legend: { hidden: true } }}
                  margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                />
                {/* Centre label */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                    pointerEvents: "none",
                  }}
                >
                  <Typography fontWeight={800} fontSize="1.8rem" color="#0D1B4B" lineHeight={1}>
                    {totalCompleted.toLocaleString()}
                  </Typography>
                  <Typography fontSize="0.6rem" color="#64748B" textTransform="uppercase" letterSpacing="0.06em" mt={0.25}>
                    completados
                  </Typography>
                </Box>
              </Box>

              {/* Legend */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%", px: 1 }}>
                {channels.map((d) => {
                  const cfg = CHANNEL_CONFIG[d.channel];
                  if (!cfg) return null;
                  const pct = totalCompleted > 0 ? Math.round((d.completed / totalCompleted) * 100) : 0;
                  return (
                    <Box key={d.channel} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: cfg.color, flexShrink: 0 }} />
                      <Typography fontSize="0.82rem" fontWeight={600} color="#0D1B4B" sx={{ flex: 1 }}>
                        {cfg.label}
                      </Typography>
                      <Typography fontSize="0.82rem" fontWeight={800} color={cfg.color}>
                        {pct}%
                      </Typography>
                      <Typography fontSize="0.75rem" color="#64748B">
                        ({d.completed.toLocaleString()})
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            {/* ── Right: Channel stat cards ── */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                gap: 2,
                alignItems: "stretch",
              }}
            >
              {channels.map((d) => {
                const cfg = CHANNEL_CONFIG[d.channel];
                if (!cfg) return null;
                const pct = totalCompleted > 0 ? Math.round((d.completed / totalCompleted) * 100) : 0;
                const convRate = d.initialized > 0 ? Math.round((d.completed / d.initialized) * 100) : 0;

                return (
                  <Box
                    key={d.channel}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: `${cfg.color}25`,
                      bgcolor: "white",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    {/* Card header */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            bgcolor: `${cfg.color}12`,
                            color: cfg.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {cfg.icon}
                        </Box>
                        <Typography fontWeight={700} fontSize="1rem" color={cfg.color}>
                          {cfg.label}
                        </Typography>
                      </Box>
                      <Chip
                        label={`${pct}%`}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          bgcolor: `${cfg.color}12`,
                          color: cfg.color,
                          border: "none",
                        }}
                      />
                    </Box>

                    {/* Stats grid */}
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                      <StatBlock label="Completados" value={d.completed.toLocaleString()} color={cfg.color} />
                      <StatBlock label="Iniciados" value={d.initialized.toLocaleString()} color="#64748B" />
                    </Box>

                    {/* Conversion rate */}
                    <Box
                      sx={{
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: convRate >= 50 ? `${ESIM_NAVY}08` : `${ESIM_RED}08`,
                        border: "1px solid",
                        borderColor: convRate >= 50 ? `${ESIM_NAVY}18` : `${ESIM_RED}18`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography fontSize="0.72rem" color="#64748B">
                        Tasa de conversión
                      </Typography>
                      <Typography fontSize="1rem" fontWeight={800} color={convRate >= 50 ? ESIM_NAVY : ESIM_RED}>
                        {convRate}%
                      </Typography>
                    </Box>

                    {/* Progress bar */}
                    <Box sx={{ height: 6, borderRadius: 3, bgcolor: `${cfg.color}15`, overflow: "hidden" }}>
                      <Box
                        sx={{
                          width: `${pct}%`,
                          height: "100%",
                          borderRadius: 3,
                          bgcolor: cfg.color,
                          transition: "width 0.5s ease-out",
                        }}
                      />
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

const StatBlock = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <Box
    sx={{
      p: 1.25,
      borderRadius: 2,
      bgcolor: "#F8FAFC",
      textAlign: "center",
      border: "1px solid #E2E8F0",
    }}
  >
    <Typography fontSize="1.3rem" fontWeight={800} color={color} lineHeight={1}>
      {value}
    </Typography>
    <Typography fontSize="0.65rem" color="text.secondary" mt={0.25}>
      {label}
    </Typography>
  </Box>
);

const LoadingSkeleton = () => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: { xs: "1fr", md: "260px 1fr" },
      gap: 3,
      alignItems: "center",
    }}
  >
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
      <Skeleton variant="circular" width={230} height={230} />
      <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1, px: 1 }}>
        <Skeleton width="100%" height={18} />
        <Skeleton width="100%" height={18} />
        <Skeleton width="100%" height={18} />
      </Box>
    </Box>
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} variant="rounded" height={200} sx={{ borderRadius: 3 }} />
      ))}
    </Box>
  </Box>
);

const EmptyState = () => (
  <Box sx={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <Typography color="text.secondary" fontSize="0.85rem">Sin datos para mostrar</Typography>
  </Box>
);
