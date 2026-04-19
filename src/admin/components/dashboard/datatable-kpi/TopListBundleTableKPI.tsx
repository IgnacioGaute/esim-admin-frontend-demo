import { Box, Paper, Skeleton, Typography, Chip } from "@mui/material";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import { ITopBundleKPI } from "@/admin/utils/interfaces/dashboard-kpi.interface";

export type TypeDataBundleList = ITopBundleKPI & { iso?: string; country?: string };

interface IProps {
  topListBundle: TypeDataBundleList[];
  loading?: boolean;
}

// eSIM Demo brand palette
const ESIM_NAVY = "#1C3680";

const HEADER_GRADIENT = "linear-gradient(135deg, #0D1B4B 0%, #1C3680 60%, #2D4FA8 100%)";

const MEDAL = ["🥇", "🥈", "🥉"];

const RANK_GRADIENTS = [
  "linear-gradient(90deg, #F2003D 0%, #FF4D76 100%)",
  "linear-gradient(90deg, #1C3680 0%, #4B6EC7 100%)",
  "linear-gradient(90deg, #0EA5E9 0%, #38BDF8 100%)",
  "linear-gradient(90deg, #7C3AED 0%, #A78BFA 100%)",
  "linear-gradient(90deg, #059669 0%, #34D399 100%)",
  "linear-gradient(90deg, #D97706 0%, #FBBF24 100%)",
  "linear-gradient(90deg, #0F766E 0%, #2DD4BF 100%)",
  "linear-gradient(90deg, #9333EA 0%, #C084FC 100%)",
];

// Known non-country 2-letter tokens in bundle names
const SKIP_TOKENS = new Set(["UL", "EU"]);

function extractISOFromBundleName(name: string): string | null {
  const parts = name.toUpperCase().split("_");
  for (const part of parts) {
    if (part === "ESIM") continue;
    if (SKIP_TOKENS.has(part)) continue;
    if (/^\d/.test(part)) continue;
    if (/^V\d+$/.test(part)) continue;
    if (part.length === 2 && /^[A-Z]{2}$/.test(part)) return part;
  }
  return null;
}

const FlagImg = ({ iso }: { iso: string | null }) => {
  if (!iso) return <Typography fontSize="1.4rem" sx={{ flexShrink: 0 }}>🌐</Typography>;
  return (
    <Box
      component="img"
      src={`https://flagcdn.com/w40/${iso.toLowerCase()}.png`}
      alt={iso}
      onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = "none"; }}
      sx={{ width: 44, height: "auto", borderRadius: 1.5, boxShadow: "0 2px 8px rgba(0,0,0,0.18)", flexShrink: 0, display: "block" }}
    />
  );
};

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

export const TopListBundleTableKPI = ({ topListBundle, loading }: IProps) => {
  const sorted = [...topListBundle].sort((a, b) => b.count - a.count).slice(0, 10);
  const totalSales = topListBundle.reduce((s, d) => s + d.count, 0);
  const maxValue = sorted.length > 0 ? Math.max(...sorted.map((d) => d.count)) : 1;

  return (
    <Paper
      elevation={0}
      sx={{ borderRadius: 4, overflow: "hidden", height: "100%", border: "1px solid", borderColor: "divider", display: "flex", flexDirection: "column" }}
    >
      {/* Header */}
      <Box
        sx={{
          background: HEADER_GRADIENT,
          px: 4,
          py: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              bgcolor: "rgba(28,54,128,0.3)",
              border: "1px solid rgba(75,110,199,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#8AAAE8",
            }}
          >
            <InventoryOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography fontWeight={800} fontSize="1.4rem" color="white" lineHeight={1.1}>
              Top Paquetes
            </Typography>
            <Typography fontSize="0.82rem" color="rgba(255,255,255,0.5)" mt={0.25}>
              Top 10 paquetes con más ventas · incluye país de origen
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 3 }}>
          <Box sx={{ textAlign: "right" }}>
            <Typography fontWeight={800} fontSize="1.8rem" color="white" lineHeight={1}>
              {totalSales.toLocaleString()}
            </Typography>
            <Typography fontSize="0.72rem" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.08em">
              ventas totales
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography fontWeight={800} fontSize="1.8rem" color="#8AAAE8" lineHeight={1}>
              {topListBundle.length}
            </Typography>
            <Typography fontSize="0.72rem" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.08em">
              bundles
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
            {sorted.map((bundle, index) => {
              const iso = bundle.iso ?? extractISOFromBundleName(bundle.esimProviderBundleName);
              const pct = (bundle.count / maxValue) * 100;
              const gradient = RANK_GRADIENTS[index % RANK_GRADIENTS.length];

              return (
                <Box
                  key={`${bundle.esimProviderBundleName}-${index}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1,
                    borderRadius: 2.5,
                    transition: "background 0.15s",
                    "&:hover": { bgcolor: `${ESIM_NAVY}06` },
                  }}
                >
                  {/* Rank */}
                  <Box sx={{ width: 36, textAlign: "center", flexShrink: 0 }}>
                    {index < 3 ? (
                      <Typography fontSize="1.4rem" lineHeight={1}>{MEDAL[index]}</Typography>
                    ) : (
                      <Typography fontWeight={800} fontSize="1rem" color="#94A3B8" lineHeight={1}>{index + 1}</Typography>
                    )}
                  </Box>

                  {/* Flag */}
                  <FlagImg iso={iso} />

                  {/* Bundle info + bar */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.6 }}>
                      <Typography fontWeight={700} fontSize="0.88rem" color="#0D1B4B" noWrap>
                        {truncate(bundle.esimProviderBundleName, 32)}
                      </Typography>
                      {bundle.country && (
                        <Chip
                          label={bundle.country}
                          size="small"
                          sx={{ height: 18, fontSize: "0.6rem", fontWeight: 700, bgcolor: `${ESIM_NAVY}12`, color: ESIM_NAVY, "& .MuiChip-label": { px: 0.75 } }}
                        />
                      )}
                    </Box>

                    {/* Gradient bar */}
                    <Box sx={{ height: 28, borderRadius: 2, bgcolor: "#D1D5DB", overflow: "hidden", position: "relative" }}>
                      <Box
                        sx={{
                          width: `${pct}%`,
                          height: "100%",
                          background: gradient,
                          borderRadius: 2,
                          transition: "width 0.7s cubic-bezier(0.34,1.56,0.64,1)",
                          display: "flex",
                          alignItems: "center",
                          pl: 1.5,
                        }}
                      >
                        {pct > 20 && (
                          <Typography fontSize="0.7rem" fontWeight={700} color="white" noWrap sx={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
                            {truncate(bundle.esimProviderBundleName, 28)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Value */}
                  <Box sx={{ textAlign: "right", flexShrink: 0, minWidth: 60 }}>
                    <Typography fontWeight={800} fontSize="1.15rem" color="#0D1B4B" lineHeight={1}>
                      {bundle.count.toLocaleString()}
                    </Typography>
                    <Typography fontSize="0.62rem" color="#94A3B8" textTransform="uppercase" letterSpacing="0.05em">
                      ventas
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
      <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2, p: 1 }}>
        <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: 2 }} />
        <Skeleton variant="rounded" width={36} height={32} sx={{ borderRadius: 1 }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width="40%" height={14} sx={{ mb: 0.6 }} />
          <Skeleton variant="rounded" width="100%" height={28} sx={{ borderRadius: 2 }} />
        </Box>
        <Skeleton width={60} height={28} />
      </Box>
    ))}
  </Box>
);

const EmptyState = () => (
  <Box sx={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <Typography color="text.secondary" fontSize="0.85rem">Sin datos para mostrar</Typography>
  </Box>
);
