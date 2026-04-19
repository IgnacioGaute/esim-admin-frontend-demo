import { useMemo } from "react";
import { Box, Skeleton } from "@mui/material";
import { useFetch, useNotiAlert } from "@/shared/hooks";
import { ListEsimInventoryDataTable } from "@/admin/components/esim-inventory/ListEsimInventoryDataTable";
import { IEsimInventoryItem } from "@/admin/utils/interfaces";

const EsimInventoryPageSkeleton = () => {
  return (
    <Box>
      <Box
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          p: 3,
          backgroundColor: "background.paper",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Skeleton variant="rounded" width={420} height={52} />
          <Skeleton variant="circular" width={36} height={36} />
        </Box>

        <Box
          display="grid"
          gridTemplateColumns="1.2fr 1fr 1fr 1fr 140px"
          gap={2}
          mb={2}
        >
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
          <Skeleton variant="text" height={40} />
        </Box>

        {[1, 2, 3, 4, 5].map((item) => (
          <Box
            key={item}
            display="grid"
            gridTemplateColumns="1.2fr 1fr 1fr 1fr 140px"
            gap={2}
            alignItems="center"
            py={2}
            borderTop="1px solid"
            borderColor="divider"
          >
            <Skeleton variant="text" height={34} />
            <Skeleton variant="text" height={34} />
            <Skeleton variant="text" height={34} />
            <Skeleton variant="text" height={34} />
            <Box display="flex" justifyContent="center" gap={1}>
              <Skeleton variant="circular" width={22} height={22} />
              <Skeleton variant="circular" width={22} height={22} />
            </Box>
          </Box>
        ))}

        <Box display="flex" justifyContent="flex-end" alignItems="center" gap={3} mt={3}>
          <Skeleton variant="text" width={110} height={30} />
          <Skeleton variant="text" width={90} height={30} />
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="circular" width={28} height={28} />
        </Box>
      </Box>
    </Box>
  );
};

export const EsimInventoryPage = () => {
  const { data, loading, onRefresh, onFetch } = useFetch<IEsimInventoryItem[]>(
    "/esim-inventories",
    "GET",
    { init: true }
  );

  const { snackBarAlert } = useNotiAlert();

  const items = useMemo<IEsimInventoryItem[]>(
    () => (Array.isArray(data) ? data : []),
    [data]
  );

  if (loading) {
    return <EsimInventoryPageSkeleton />;
  }

  return (
    <div>
      <ListEsimInventoryDataTable
        loading={false}
        data={items}
        onShare={async (bundles, email, esimInventoryId) => {
          const { ok } = await onFetch("/esim-inventories/shared", "PUT", {
            data: {
              id: esimInventoryId,
              products: bundles,
              email: email,
            },
          });

          if (ok) {
            snackBarAlert(`Compartiendo ${bundles.length} bundle(s) a ${email}`, {
              variant: "success",
            });
            onRefresh();
          }
        }}
        onResend={async (inventoryId, sharedId, email) => {
          const { ok } = await onFetch("/esim-inventories/resend", "PUT", {
            data: {
              id: inventoryId,
              shared_id: sharedId,
              email: email,
            },
          });

          if (ok) {
            snackBarAlert(`eSIM reenviada a ${email}`, { variant: "success" });
            onRefresh();
          }
        }}
      />
    </div>
  );
};