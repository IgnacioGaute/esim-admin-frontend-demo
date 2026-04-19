import { Box, Paper, Skeleton, Typography, Chip } from "@mui/material";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import { ITopDestinationKPI } from "@/admin/utils/interfaces/dashboard-kpi.interface";

interface IProps {
  topListDestination: ITopDestinationKPI[];
  loading?: boolean;
  onCountryClick?: (destination: ITopDestinationKPI) => void;
}

const ACCENT = "#8B5CF6";
const MEDAL = ["🥇", "🥈", "🥉"];

const RANK_GRADIENTS = [
  "linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)",
  "linear-gradient(90deg, #8B5CF6 0%, #A78BFA 100%)",
  "linear-gradient(90deg, #10B981 0%, #34D399 100%)",
  "linear-gradient(90deg, #6671E2 0%, #818CF8 100%)",
  "linear-gradient(90deg, #EF4444 0%, #F87171 100%)",
  "linear-gradient(90deg, #06B6D4 0%, #22D3EE 100%)",
  "linear-gradient(90deg, #EC4899 0%, #F472B6 100%)",
  "linear-gradient(90deg, #14B8A6 0%, #2DD4BF 100%)",
  "linear-gradient(90deg, #F97316 0%, #FB923C 100%)",
  "linear-gradient(90deg, #84CC16 0%, #A3E635 100%)",
];

const COUNTRY_ISO_MAP: Record<string, string> = {
  argentina: "ar", "estados unidos": "us", "united states": "us", chile: "cl",
  brasil: "br", brazil: "br", méxico: "mx", mexico: "mx", colombia: "co",
  perú: "pe", peru: "pe", uruguay: "uy", paraguay: "py", bolivia: "bo",
  venezuela: "ve", ecuador: "ec", españa: "es", spain: "es", austria: "at",
  chipre: "cy", cyprus: "cy", alemania: "de", germany: "de", francia: "fr",
  france: "fr", italia: "it", italy: "it", "reino unido": "gb", "united kingdom": "gb",
  canada: "ca", canadá: "ca", australia: "au", japón: "jp", japan: "jp",
  china: "cn", india: "in", portugal: "pt", suecia: "se", sweden: "se",
  noruega: "no", norway: "no", dinamarca: "dk", denmark: "dk",
  suiza: "ch", switzerland: "ch", bélgica: "be", belgium: "be",
  polonia: "pl", poland: "pl", turquía: "tr", turkey: "tr",
  israel: "il", singapur: "sg", singapore: "sg", tailandia: "th", thailand: "th",
  "costa rica": "cr", panamá: "pa", panama: "pa", guatemala: "gt",
  "república dominicana": "do", "dominican republic": "do",
  grecia: "gr", greece: "gr", rumania: "ro", romania: "ro",
  croacia: "hr", croatia: "hr", ucrania: "ua", ukraine: "ua",
};

function resolveISO(iso?: string, country?: string): string | null {
  if (iso && iso.length === 2) return iso.toLowerCase();
  if (country) return COUNTRY_ISO_MAP[country.toLowerCase().trim()] ?? null;
  return null;
}

const FlagImg = ({ iso, country }: { iso?: string; country?: string }) => {
  const code = resolveISO(iso, country);
  if (!code)
    return <Typography fontSize="1.4rem" sx={{ flexShrink: 0 }}>🌍</Typography>;
  return (
    <Box
      component="img"
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={code}
      onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.style.display = "none"; }}
      sx={{ width: 44, height: "auto", borderRadius: 1.5, boxShadow: "0 2px 8px rgba(0,0,0,0.18)", flexShrink: 0, display: "block" }}
    />
  );
};


export const TopListDestinationTableKPI = ({ topListDestination, loading, onCountryClick }: IProps) => {
  const sorted = [...topListDestination].sort((a, b) => b.count - a.count).slice(0, 10);
  const totalSales = topListDestination.reduce((s, d) => s + d.count, 0);
  const maxValue = sorted.length > 0 ? Math.max(...sorted.map((d) => d.count)) : 1;

  return (
    <Paper
      elevation={0}
      sx={{ borderRadius: 4, overflow: "hidden", height: "100%", border: "1px solid", borderColor: "divider", display: "flex", flexDirection: "column" }}
    >
      {/* Dark header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #2D1B69 100%)",
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
              bgcolor: "rgba(139,92,246,0.25)",
              border: "1px solid rgba(139,92,246,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#C4B5FD",
            }}
          >
            <PublicOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography fontWeight={800} fontSize="1.4rem" color="white" lineHeight={1.1}>
              Top Destinos
            </Typography>
            <Typography fontSize="0.82rem" color="rgba(255,255,255,0.5)" mt={0.25}>
              Top 10 países con más eSIMs vendidas · clic para ver bundles
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 3 }}>
          <Box sx={{ textAlign: "right" }}>
            <Typography fontWeight={800} fontSize="1.8rem" color="white" lineHeight={1}>
              {totalSales.toLocaleString()}
            </Typography>
            <Typography fontSize="0.72rem" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.08em">
              eSIMs totales
            </Typography>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography fontWeight={800} fontSize="1.8rem" color="#C4B5FD" lineHeight={1}>
              {topListDestination.length}
            </Typography>
            <Typography fontSize="0.72rem" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.08em">
              destinos
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
            {sorted.map((dest, index) => {
              const pct = (dest.count / maxValue) * 100;
              const gradient = RANK_GRADIENTS[index % RANK_GRADIENTS.length];
              const clickable = Boolean(onCountryClick && dest.iso);

              return (
                <Box
                  key={`${dest.country}-${index}`}
                  onClick={() => clickable && onCountryClick!(dest)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1,
                    borderRadius: 2.5,
                    cursor: clickable ? "pointer" : "default",
                    transition: "background 0.15s",
                    "&:hover": clickable ? { bgcolor: "rgba(139,92,246,0.06)" } : {},
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
                  <FlagImg iso={dest.iso} country={dest.country} />

                  {/* Country + bar */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.6 }}>
                      <Typography fontWeight={700} fontSize="0.88rem" color="#0F172A" noWrap>
                        {dest.country}
                      </Typography>
                      {dest.iso && (
                        <Chip
                          label={dest.iso}
                          size="small"
                          sx={{ height: 18, fontSize: "0.6rem", fontWeight: 700, bgcolor: `${ACCENT}12`, color: ACCENT, "& .MuiChip-label": { px: 0.75 } }}
                        />
                      )}
                      {clickable && <OpenInNewOutlinedIcon sx={{ fontSize: 13, color: ACCENT, opacity: 0.5 }} />}
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
                            {dest.country}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Value */}
                  <Box sx={{ textAlign: "right", flexShrink: 0, minWidth: 60 }}>
                    <Typography fontWeight={800} fontSize="1.15rem" color="#0F172A" lineHeight={1}>
                      {dest.count.toLocaleString()}
                    </Typography>
                    <Typography fontSize="0.62rem" color="#94A3B8" textTransform="uppercase" letterSpacing="0.05em">
                      eSIMs
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
