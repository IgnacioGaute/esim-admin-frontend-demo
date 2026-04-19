import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Skeleton } from "@mui/material";

import { useFetch } from "@/shared/hooks";
import { BoxLoading } from "@/shared/components";
import { IUserData } from "@/admin/utils/interfaces/user-data.interface";
import { MENU_MAIN_HISTORY_NAV } from "@/admin/utils/constants/menuMainHistoryNav";
import { UserBalanceForm } from "@/admin/components/users/UserBalanceForm";

type Role = "SUPER_ADMIN" | "ADMIN" | "SELLER";

const UserBalancePageSkeleton = () => {
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
          <Skeleton variant="rounded" width={320} height={40} />
          <Skeleton variant="rounded" width={120} height={36} />
        </Box>

        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} mb={3}>
          <Skeleton variant="rounded" height={56} />
          <Skeleton variant="rounded" height={56} />
        </Box>

        <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap={2} mb={3}>
          <Skeleton variant="rounded" height={56} />
          <Skeleton variant="rounded" height={56} />
          <Skeleton variant="rounded" height={56} />
        </Box>

        <Box display="flex" justifyContent="flex-end" gap={2} mt={4}>
          <Skeleton variant="rounded" width={120} height={40} />
          <Skeleton variant="rounded" width={160} height={40} />
        </Box>
      </Box>
    </Box>
  );
};

export const UserBalancePage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const userIdParam = params.get("userId") || "";

  const { data: me, loading: loadingMe } = useFetch<IUserData & { amount?: number }>(
    "users/me",
    "GET",
    { init: true, cache: { enabled: false } }
  );

  const normalizeRole = (t?: string) => {
    if (t === "USER") return "SELLER";
    if (t === "CORPORATE") return "ADMIN";
    return (t as any) ?? "SELLER";
  };

  const currentUser = useMemo(() => {
    if (!me) return null;
    const companyId = (me as any)?.companyId ?? (me as any)?.company?.id ?? null;
    return { id: me.id, type: normalizeRole(me.type) as Role, companyId };
  }, [me]);

  const isSuperAdmin = currentUser?.type === "SUPER_ADMIN";
  const isAdmin = currentUser?.type === "ADMIN";

  const shouldFetchUsers = Boolean(currentUser) && (isSuperAdmin || isAdmin);

  const { data: users, loading: loadingUsers } = useFetch<IUserData[]>(
    "users",
    "GET",
    { init: shouldFetchUsers, cache: { enabled: false } }
  );

  useEffect(() => {
    if (!loadingMe && currentUser?.type === "SELLER") {
      navigate(MENU_MAIN_HISTORY_NAV("dashboard"));
    }
  }, [loadingMe, currentUser?.type, navigate]);

  const loadingAny =
    loadingMe || (Boolean(currentUser) && (isSuperAdmin || isAdmin) && loadingUsers);

  if (loadingAny) {
    return <UserBalancePageSkeleton />;
  }

  if (!currentUser) return null;

  if (currentUser.type === "SELLER") return null;

  return (
    <Box>
      <UserBalanceForm
        title="Ajustar balances de usuario"
        onBack={() => navigate(MENU_MAIN_HISTORY_NAV("users"))}
        users={users ?? []}
        loading={false}
        initialUserId={userIdParam}
        isSuperAdmin={Boolean(isSuperAdmin)}
        isAdmin={Boolean(isAdmin)}
      />

      <BoxLoading isLoading={false} title="Cargando..." position="absolute" />
    </Box>
  );
};