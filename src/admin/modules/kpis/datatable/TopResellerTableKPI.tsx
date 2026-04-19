import { useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Skeleton,
  Typography,
  Avatar,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import { useFetch } from "@/shared/hooks/useFetch";
import { TopListResellerTableKPI } from "@/admin/components/dashboard";
import {
  ITopResellerKPI,
  ITopBundleKPI,
  IEsimDetailKPI,
} from "@/admin/utils/interfaces/dashboard-kpi.interface";
import { IFilterDateKPI } from "@/shared/components/kpis";

const ACCENT_RESELLER = "#10B981";
const ACCENT_BUNDLE = "#6671E2";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface Props {
  date: IFilterDateKPI | null;
}

interface ResellerDetailModalProps {
  reseller: ITopResellerKPI;
  onClose: () => void;
}

const ResellerDetailModal = ({
  reseller,
  onClose,
}: ResellerDetailModalProps) => {
  const { data: bundles, loading: loadingBundles } = useFetch<ITopBundleKPI[]>(
    `/reports/top-bundles/${reseller.id}`,
    "GET",
    { init: true }
  );

  const { data: esims, loading: loadingEsims } = useFetch<IEsimDetailKPI[]>(
    `/reports/esims-by-resellers/${reseller.id}`,
    "GET",
    { init: true }
  );

  const sortedBundles = [...(bundles || [])]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const maxBundle =
    sortedBundles.length > 0
      ? Math.max(...sortedBundles.map((b) => b.count))
      : 1;

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", gap: 1.5, pr: 6 }}
      >
        <Avatar
          sx={{
            width: 42,
            height: 42,
            bgcolor: `${ACCENT_RESELLER}18`,
            color: ACCENT_RESELLER,
            fontWeight: 700,
            fontSize: "0.9rem",
          }}
        >
          {getInitials(reseller.name)}
        </Avatar>

        <Box>
          <Typography fontWeight={700} fontSize="1rem" color="#151D48">
            {reseller.name}
          </Typography>
          <Typography fontSize="0.75rem" color="text.secondary">
            {reseller.company?.name ?? reseller.nameCompany ?? "—"}
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
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            mb: 2.5,
          }}
        >
          <StatCard
            label="Órdenes completadas"
            value={reseller.completedOrdersCount.toLocaleString()}
            color={ACCENT_RESELLER}
            icon={<PersonOutlineOutlinedIcon sx={{ fontSize: 20 }} />}
            loading={false}
          />

          <StatCard
            label="eSIMs asociados"
            value={loadingEsims ? null : (esims?.length ?? 0).toLocaleString()}
            color={ACCENT_BUNDLE}
            icon={<InventoryOutlinedIcon sx={{ fontSize: 20 }} />}
            loading={loadingEsims}
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Typography
          fontWeight={700}
          fontSize="0.85rem"
          color="#151D48"
          sx={{ mb: 1.5, display: "flex", alignItems: "center", gap: 1 }}
        >
          <InventoryOutlinedIcon sx={{ fontSize: 18, color: ACCENT_BUNDLE }} />
          Bundles más vendidos
        </Typography>

        {loadingBundles ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Skeleton variant="rounded" width={26} height={26} sx={{ borderRadius: 1.5 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton width="55%" height={14} />
                  <Skeleton width="100%" height={5} sx={{ mt: 0.5, borderRadius: 3 }} />
                </Box>
                <Skeleton width={40} height={20} />
              </Box>
            ))}
          </Box>
        ) : sortedBundles.length === 0 ? (
          <Box sx={{ py: 3, textAlign: "center" }}>
            <Typography color="text.secondary" fontSize="0.85rem">
              Sin bundles registrados
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
            {sortedBundles.map((bundle, index) => {
              const pct = (bundle.count / maxBundle) * 100;

              return (
                <Box
                  key={`${bundle.esimProviderBundleName}-${index}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: index < 3 ? `${ACCENT_BUNDLE}06` : "transparent",
                    border: "1px solid",
                    borderColor: index < 3 ? `${ACCENT_BUNDLE}15` : "divider",
                  }}
                >
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: 1.5,
                      bgcolor: index < 3 ? ACCENT_BUNDLE : "grey.200",
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
                    <Typography
                      fontSize="0.8rem"
                      fontWeight={600}
                      color="#151D48"
                      noWrap
                    >
                      {bundle.esimProviderBundleName}
                    </Typography>

                    <Box
                      sx={{
                        height: 5,
                        borderRadius: 3,
                        bgcolor: `${ACCENT_BUNDLE}12`,
                        mt: 0.5,
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${pct}%`,
                          height: "100%",
                          borderRadius: 3,
                          background: `linear-gradient(90deg, ${ACCENT_BUNDLE}, ${ACCENT_BUNDLE}CC)`,
                        }}
                      />
                    </Box>
                  </Box>

                  <Typography
                    fontSize="0.9rem"
                    fontWeight={700}
                    color={ACCENT_BUNDLE}
                    sx={{ flexShrink: 0 }}
                  >
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

const StatCard = ({
  label,
  value,
  color,
  icon,
  loading,
}: {
  label: string;
  value: string | null;
  color: string;
  icon: React.ReactNode;
  loading: boolean;
}) => (
  <Box
    sx={{
      p: 2,
      borderRadius: 3,
      border: "1px solid",
      borderColor: `${color}20`,
      bgcolor: `${color}06`,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
      <Box sx={{ color }}>{icon}</Box>
      <Typography
        fontSize="0.72rem"
        fontWeight={600}
        color="text.secondary"
        textTransform="uppercase"
        letterSpacing="0.05em"
      >
        {label}
      </Typography>
    </Box>

    {loading ? (
      <Skeleton width={60} height={28} />
    ) : (
      <Typography fontSize="1.4rem" fontWeight={800} color={color} lineHeight={1}>
        {value}
      </Typography>
    )}
  </Box>
);

export const TopResellerTableKPI = ({ date }: Props) => {
  const [selectedReseller, setSelectedReseller] =
    useState<ITopResellerKPI | null>(null);

  const { data, loading } = useFetch<ITopResellerKPI[]>(
    "/reports/top-resellers",
    "GET",
    {
      init: true,
      params: date,
    }
  );

  return (
    <>
      <TopListResellerTableKPI
        topListReseller={data || []}
        loading={loading}
        onResellerClick={setSelectedReseller}
      />

      {selectedReseller && (
        <ResellerDetailModal
          reseller={selectedReseller}
          onClose={() => setSelectedReseller(null)}
        />
      )}
    </>
  );
};