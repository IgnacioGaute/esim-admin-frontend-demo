import { Box, Paper, Skeleton, Typography } from "@mui/material";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import { ITopDestinationKPI } from "@/admin/utils/interfaces/dashboard-kpi.interface";

interface IProps {
  topListDestination: ITopDestinationKPI[];
  loading?: boolean;
  onCountryClick?: (destination: ITopDestinationKPI) => void;
}

// Fallback map: Spanish/English country name → ISO 2-letter code
const COUNTRY_ISO_MAP: Record<string, string> = {
  argentina: "ar", "estados unidos": "us", "united states": "us", chile: "cl",
  brasil: "br", brazil: "br", méxico: "mx", mexico: "mx", colombia: "co",
  perú: "pe", peru: "pe", uruguay: "uy", paraguay: "py", bolivia: "bo",
  venezuela: "ve", ecuador: "ec", españa: "es", spain: "es", austria: "at",
  chipre: "cy", cyprus: "cy", alemania: "de", germany: "de", francia: "fr",
  france: "fr", italia: "it", italy: "it", "reino unido": "gb", "united kingdom": "gb",
  canada: "ca", canadá: "ca", australia: "au", japón: "jp", japan: "jp",
  china: "cn", india: "in", "corea del sur": "kr", "south korea": "kr",
  portugal: "pt", netherlands: "nl", "países bajos": "nl", suecia: "se",
  sweden: "se", noruega: "no", norway: "no", dinamarca: "dk", denmark: "dk",
  finlandia: "fi", finland: "fi", suiza: "ch", switzerland: "ch",
  bélgica: "be", belgium: "be", polonia: "pl", poland: "pl", rusia: "ru",
  russia: "ru", turquía: "tr", turkey: "tr", "emiratos árabes unidos": "ae",
  "united arab emirates": "ae", "arabia saudita": "sa", "saudi arabia": "sa",
  israel: "il", singapur: "sg", singapore: "sg", tailandia: "th", thailand: "th",
  indonesia: "id", malasia: "my", malaysia: "my", filipinas: "ph", philippines: "ph",
  "nueva zelanda": "nz", "new zealand": "nz", sudáfrica: "za", "south africa": "za",
  nigeria: "ng", kenia: "ke", kenya: "ke", egipto: "eg", egypt: "eg",
  marruecos: "ma", morocco: "ma", ghana: "gh", tanzania: "tz", etiopía: "et",
  "costa rica": "cr", panamá: "pa", panama: "pa", guatemala: "gt",
  honduras: "hn", "el salvador": "sv", nicaragua: "ni", cuba: "cu",
  "república dominicana": "do", "dominican republic": "do", haiti: "ht", haití: "ht",
  jamaica: "jm", "trinidad y tobago": "tt", barbados: "bb",
  grecia: "gr", greece: "gr", rumania: "ro", romania: "ro", hungría: "hu",
  hungary: "hu", "república checa": "cz", "czech republic": "cz",
  eslovaquia: "sk", slovakia: "sk", croacia: "hr", croatia: "hr",
  serbia: "rs", ucrania: "ua", ukraine: "ua",
};

function resolveISO(iso?: string, country?: string): string | null {
  if (iso && iso.length === 2) return iso.toLowerCase();
  if (country) {
    const key = country.toLowerCase().trim();
    return COUNTRY_ISO_MAP[key] ?? null;
  }
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

// eSIM Demo brand palette
const HEADER_GRADIENT = "linear-gradient(135deg, #0D1B4B 0%, #1C3680 60%, #2D4FA8 100%)";

const RANK_GRADIENTS = [
  "linear-gradient(90deg, #F2003D 0%, #FF4D76 100%)",
  "linear-gradient(90deg, #1C3680 0%, #4B6EC7 100%)",
  "linear-gradient(90deg, #0EA5E9 0%, #38BDF8 100%)",
  "linear-gradient(90deg, #7C3AED 0%, #A78BFA 100%)",
  "linear-gradient(90deg, #059669 0%, #34D399 100%)",
  "linear-gradient(90deg, #D97706 0%, #FBBF24 100%)",
  "linear-gradient(90deg, #0F766E 0%, #2DD4BF 100%)",
  "linear-gradient(90deg, #9333EA 0%, #C084FC 100%)",
  "linear-gradient(90deg, #DC2626 0%, #F87171 100%)",
  "linear-gradient(90deg, #2563EB 0%, #60A5FA 100%)",
];

const RANK_BADGE = ["🥇", "🥈", "🥉"];

export const DestinationRankingChartKPI = ({
  topListDestination,
  loading,
  onCountryClick,
}: IProps) => {
  const sorted = [...topListDestination]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const totalSales = topListDestination.reduce((s, d) => s + d.count, 0);
  const maxValue = sorted.length > 0 ? Math.max(...sorted.map((d) => d.count)) : 1;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* ── Dark header banner ── */}
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
            <PublicOutlinedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography fontWeight={800} fontSize="1.4rem" color="white" lineHeight={1.1}>
              Ranking de Destinos
            </Typography>
            <Typography fontSize="0.82rem" color="rgba(255,255,255,0.5)" mt={0.25}>
              Top 10 países por volumen de eSIMs vendidas
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
            <Typography fontWeight={800} fontSize="1.8rem" color="#8AAAE8" lineHeight={1}>
              {topListDestination.length}
            </Typography>
            <Typography fontSize="0.72rem" color="rgba(255,255,255,0.45)" textTransform="uppercase" letterSpacing="0.08em">
              destinos
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Ranking rows ── */}
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
                    cursor: clickable ? "pointer" : "default",
                    p: 1,
                    borderRadius: 2.5,
                    transition: "background 0.15s",
                    "&:hover": clickable
                      ? { bgcolor: "rgba(28,54,128,0.05)" }
                      : {},
                  }}
                >
                  {/* Rank */}
                  <Box
                    sx={{
                      width: 36,
                      textAlign: "center",
                      flexShrink: 0,
                    }}
                  >
                    {index < 3 ? (
                      <Typography fontSize="1.4rem" lineHeight={1}>{RANK_BADGE[index]}</Typography>
                    ) : (
                      <Typography
                        fontWeight={800}
                        fontSize="1rem"
                        color="#94A3B8"
                        lineHeight={1}
                      >
                        {index + 1}
                      </Typography>
                    )}
                  </Box>

                  {/* Flag */}
                  <FlagImg iso={dest.iso} country={dest.country} />

                  {/* Country name + bar */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 0.6 }}>
                      <Typography fontWeight={700} fontSize="0.9rem" color="#0F172A" noWrap>
                        {dest.country}
                      </Typography>
                      {dest.iso && (
                        <Typography fontSize="0.7rem" color="#94A3B8" fontWeight={600}>
                          {dest.iso}
                        </Typography>
                      )}
                    </Box>

                    {/* Gradient bar */}
                    <Box
                      sx={{
                        height: 28,
                        borderRadius: 2,
                        bgcolor: "#E2E8F0",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${pct}%`,
                          height: "100%",
                          background: gradient,
                          borderRadius: 2,
                          transition: "width 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
                          display: "flex",
                          alignItems: "center",
                          pl: 1.5,
                        }}
                      >
                        {pct > 25 && (
                          <Typography fontSize="0.72rem" fontWeight={700} color="white" noWrap sx={{ textShadow: "0 1px 3px rgba(0,0,0,0.3)" }}>
                            {dest.country}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Value */}
                  <Box sx={{ textAlign: "right", flexShrink: 0, minWidth: 64 }}>
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
        <Skeleton variant="rounded" width={36} height={36} sx={{ borderRadius: 2 }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width="30%" height={14} sx={{ mb: 0.6 }} />
          <Skeleton variant="rounded" width={`${40 + Math.random() * 50}%`} height={28} sx={{ borderRadius: 2 }} />
        </Box>
        <Skeleton width={60} height={28} />
      </Box>
    ))}
  </Box>
);

const EmptyState = () => (
  <Box sx={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
    <Typography color="text.secondary" fontSize="0.85rem">Sin datos para mostrar</Typography>
  </Box>
);
