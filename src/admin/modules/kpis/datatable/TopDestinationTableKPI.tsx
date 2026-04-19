import { useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Skeleton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import { useFetch } from "@/shared/hooks/useFetch";
import { IFilterDateKPI } from "@/shared/components/kpis";
import {
  ITopDestinationKPI,
  ITopDestinationBundleKPI,
} from "@/admin/utils/interfaces/dashboard-kpi.interface";
import { TopListDestinationTableKPI } from "@/admin/components/dashboard";

const ACCENT = "#8B5CF6";

function getFlag(iso?: string): string {
  if (!iso || iso.length !== 2) return "🌍";
  return String.fromCodePoint(
    ...[...iso.toUpperCase()].map((c) => 0x1f1e6 - 65 + c.charCodeAt(0))
  );
}

interface Props {
  date: IFilterDateKPI | null;
}

interface SelectedCountry {
  name: string;
  iso: string;
}

// ── Drill-down modal ──────────────────────────────────────────────────────────

interface DestinationBundlesModalProps {
  country: SelectedCountry;
  date: IFilterDateKPI | null;
  onClose: () => void;
}

const DestinationBundlesModal = ({ country, date, onClose }: DestinationBundlesModalProps) => {
  const { data, loading } = useFetch<ITopDestinationBundleKPI[]>(
    `/reports/top-destinations/${country.iso}`,
    "GET",
    { init: true, params: date }
  );

  const sorted = [...(data || [])].sort((a, b) => b.count - a.count);
  const maxValue = sorted.length > 0 ? Math.max(...sorted.map((d) => d.count)) : 1;

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pr: 6 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: `${ACCENT}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: ACCENT,
            fontSize: "1.2rem",
          }}
        >
          {getFlag(country.iso)}
        </Box>
        <Box>
          <Typography fontWeight={700} fontSize="1rem" color="#151D48">
            {country.name}
          </Typography>
          <Typography fontSize="0.75rem" color="text.secondary">
            Bundles más vendidos
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", right: 12, top: 12 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Skeleton variant="rounded" width={28} height={28} sx={{ borderRadius: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="55%" height={14} />
                  <Skeleton width="100%" height={6} sx={{ mt: 0.5, borderRadius: 3 }} />
                </Box>
                <Skeleton width={45} height={22} />
              </Box>
            ))}
          </Box>
        ) : sorted.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography color="text.secondary" fontSize="0.85rem">
              Sin datos para mostrar
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {sorted.map((bundle, index) => {
              const percentage = (bundle.count / maxValue) * 100;
              return (
                <Box
                  key={`${bundle.esimProviderBundleName}-${index}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: index < 3 ? `${ACCENT}06` : "transparent",
                    border: "1px solid",
                    borderColor: index < 3 ? `${ACCENT}15` : "divider",
                  }}
                >
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: 1.5,
                      bgcolor: index < 3 ? ACCENT : "grey.200",
                      color: index < 3 ? "white" : "text.secondary",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontSize="0.8rem" fontWeight={600} color="#151D48" noWrap>
                      {bundle.esimProviderBundleName}
                    </Typography>
                    <Box sx={{ height: 5, borderRadius: 3, bgcolor: `${ACCENT}12`, mt: 0.5, overflow: "hidden" }}>
                      <Box
                        sx={{
                          width: `${percentage}%`,
                          height: "100%",
                          borderRadius: 3,
                          background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT}CC)`,
                        }}
                      />
                    </Box>
                  </Box>

                  <Typography fontSize="0.9rem" fontWeight={700} color={ACCENT} sx={{ flexShrink: 0 }}>
                    {bundle.count.toLocaleString()}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

// ── Smart module ──────────────────────────────────────────────────────────────

export const TopDestinationTableKPI = ({ date }: Props) => {
  const [selectedCountry, setSelectedCountry] = useState<SelectedCountry | null>(null);

  const { data, loading } = useFetch<ITopDestinationKPI[]>(
    "/reports/top-destinations",
    "GET",
    { init: true, params: date }
  );

  const handleCountryClick = (dest: ITopDestinationKPI) => {
    if (dest.iso) {
      setSelectedCountry({ name: dest.country, iso: dest.iso });
    }
  };

  return (
    <>
      <TopListDestinationTableKPI
        topListDestination={data || []}
        loading={loading}
        onCountryClick={handleCountryClick}
      />
      {selectedCountry && (
        <DestinationBundlesModal
          country={selectedCountry}
          date={date}
          onClose={() => setSelectedCountry(null)}
        />
      )}
    </>
  );
};
