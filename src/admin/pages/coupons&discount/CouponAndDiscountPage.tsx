import { useMemo, useState } from "react";
import { Box, Button, Skeleton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useFetch, useNotiAlert } from "@/shared/hooks";
import { BoxLoading, NavigateLink } from "@/shared/components";
import {
  ListCouponDataTable,
  DetailCoupon,
  IDataListCoupon,
} from "@/admin/components/coupons&discount";
import { ICouponData } from "@/admin/utils/interfaces/coupon-data.interface";
import { alpha } from "@mui/material"

const CouponAndDiscountPageSkeleton = () => {
  return (
    <Box>
      <Box display="flex" width="100%" justifyContent="flex-end" mb={2.5}>
        <Skeleton variant="rounded" width={170} height={44} />
      </Box>

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
          gridTemplateColumns="1.2fr 1fr 1fr 1fr 1fr 120px"
          gap={2}
          mb={2}
        >
          <Skeleton variant="text" height={40} />
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
            gridTemplateColumns="1.2fr 1fr 1fr 1fr 1fr 120px"
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

export const CouponAndDiscountPage = () => {
  const navigate = useNavigate();
  const [couponId, setCouponId] = useState<string>("");

  const { data, loading, onRefresh, onFetch } = useFetch<ICouponData[]>("/coupons", "GET", {
    init: true,
  });

  const { data: coupon, loading: loadingCouponDetail } = useFetch<ICouponData>(
    `/coupons/${couponId}`,
    "GET",
    { init: couponId !== "" }
  );

  const { snackBarAlert } = useNotiAlert();
  const [loadDelete, setLoadDelete] = useState(false);

  const onDeleteCoupon = async (id: string) => {
    setCouponId("");
    setLoadDelete(true);

    const { ok } = await onFetch(`/coupons/${id}`, "DELETE");

    setLoadDelete(false);

    if (!ok) return;

    snackBarAlert("El cupón se ha eliminado correctamente", { variant: "success" });
    onRefresh();
  };

  const listData = useMemo(() => {
    if (data && data.length > 0) {
      return data.map((item) => {
        const cantRest = item.count - item.used_count;

        return {
          ...item,
          cantRest,
        };
      }) as IDataListCoupon[];
    }

    return [];
  }, [data]);

  if (loading) {
    return <CouponAndDiscountPageSkeleton />;
  }

  return (
    <div>
      <Box display="flex" width="100%" justifyContent="flex-end" mb={2.5}>
        <NavigateLink
          to="new"
          uiLink={{ component: "span", underline: "none" }}
        >
          <Button
            variant="contained"
            disableElevation
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              px: 2.5,
              py: 1,
              transition: "all 0.2s ease",
              boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: (theme) => `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}`,
              },
            }}
          >
            Agregar Cupon
          </Button>
        </NavigateLink>
      </Box>

      <ListCouponDataTable
        couponList={listData}
        loading={false}
        onShowCoupon={(coupon) => setCouponId(coupon.id)}
        onDelete={onDeleteCoupon}
        onEdit={(value) => navigate(`edit/${value}`)}
      />

      <DetailCoupon
        coupon={coupon}
        loading={loadingCouponDetail}
        opened={couponId !== ""}
        onClose={() => setCouponId("")}
        onEdit={(value) => navigate(`edit/${value}`)}
        onDelete={onDeleteCoupon}
      />

      <BoxLoading
        isLoading={loadDelete}
        title="Eliminando cupon..."
        position="absolute"
      />
    </div>
  );
};