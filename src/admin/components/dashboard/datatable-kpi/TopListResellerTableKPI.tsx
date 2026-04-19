import { Box, Paper, Skeleton, Typography, Avatar } from "@mui/material";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import { ITopResellerKPI } from "@/admin/utils/interfaces/dashboard-kpi.interface";

interface IProps {
  topListReseller: ITopResellerKPI[];
  loading?: boolean;
  onResellerClick?: (reseller: ITopResellerKPI) => void;
}

// eSIM Demo brand palette
const ESIM_NAVY = "#1C3680";
const ESIM_RED  = "#F2003D";

const HEADER_GRADIENT = "linear-gradient(135deg, #0D1B4B 0%, #1C3680 60%, #2D4FA8 100%)";

const MEDAL = ["🥇", "🥈", "🥉"];

const AVATAR_COLORS = [
  "#1C3680", "#F2003D", "#0EA5E9", "#7C3AED",
  "#059669", "#D97706", "#0F766E", "#9333EA",
];

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

export const TopListResellerTableKPI = ({ topListReseller, loading, onResellerClick }: IProps) => {
  const sorted = [...topListReseller]
    .sort((a, b) => b.completedOrdersCount - a.completedOrdersCount)
    .slice(0, 8);

  const totalOrders = topListReseller.reduce((s, d) => s + d.completedOrdersCount, 0);
  const maxValue = Math.max(...sorted.map((d) => d.completedOrdersCount), 1);

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
              bgcolor: "rgba(28,54,128,0.3)",
              border: "1px solid rgba(75,110,199,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#8AAAE8",
              flexShrink: 0,
            }}
          >
            <PersonOutlineOutlinedIcon />
          </Box>
          <Box>
            <Typography fontWeight={800} fontSize="1.1rem" color="white" lineHeight={1.1}>
              Top Resellers
            </Typography>
            <Typography fontSize="0.75rem" color="rgba(255,255,255,0.45)" mt={0.2}>
              Por órdenes completadas
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
            <Typography fontWeight={800} fontSize="1.6rem" color="#8AAAE8" lineHeight={1}>
              {topListReseller.length}
            </Typography>
            <Typography fontSize="0.62rem" color="rgba(255,255,255,0.4)" textTransform="uppercase" letterSpacing="0.08em">
              resellers
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
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {sorted.map((reseller, index) => {
              const pct = (reseller.completedOrdersCount / maxValue) * 100;
              const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
              const clickable = Boolean(onResellerClick);

              return (
                <Box
                  key={reseller.id}
                  onClick={() => onResellerClick?.(reseller)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 1,
                    borderRadius: 2,
                    cursor: clickable ? "pointer" : "default",
                    transition: "background 0.15s",
                    "&:hover": clickable ? { bgcolor: `${ESIM_NAVY}08` } : {},
                  }}
                >
                  <Box sx={{ width: 32, textAlign: "center", flexShrink: 0 }}>
                    {index < 3 ? (
                      <Typography fontSize="1.25rem" lineHeight={1}>{MEDAL[index]}</Typography>
                    ) : (
                      <Typography fontWeight={800} fontSize="0.9rem" color="#94A3B8">{index + 1}</Typography>
                    )}
                  </Box>

                  <Avatar
                    sx={{
                      width: 34,
                      height: 34,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      bgcolor: `${avatarColor}18`,
                      color: avatarColor,
                      flexShrink: 0,
                    }}
                  >
                    {getInitials(reseller.name)}
                  </Avatar>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75, mb: 0.5 }}>
                      <Typography fontSize="0.83rem" fontWeight={600} color="#0D1B4B" noWrap>
                        {truncate(reseller.name ?? "Sin nombre", 22)}
                      </Typography>
                      <Typography fontSize="0.68rem" color="#94A3B8" noWrap>
                        {reseller.company?.name ?? reseller.nameCompany ?? ""}
                      </Typography>
                    </Box>
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
                      {reseller.completedOrdersCount.toLocaleString()}
                    </Typography>
                    <Typography fontSize="0.6rem" color="#94A3B8" textTransform="uppercase" letterSpacing="0.05em">
                      órdenes
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

const LoadingSkeleton = () => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
    {Array.from({ length: 8 }).map((_, i) => (
      <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 1 }}>
        <Skeleton variant="rounded" width={32} height={32} sx={{ borderRadius: 2 }} />
        <Skeleton variant="circular" width={34} height={34} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width="55%" height={14} sx={{ mb: 0.5 }} />
          <Skeleton variant="rounded" width="100%" height={10} sx={{ borderRadius: 2 }} />
        </Box>
        <Skeleton width={52} height={22} />
      </Box>
    ))}
  </Box>
);

const EmptyState = () => (
  <Box sx={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <Typography color="text.secondary" fontSize="0.85rem">Sin datos para mostrar</Typography>
  </Box>
);

// Suppress unused import warning
void ESIM_RED;
