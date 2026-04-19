import { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, Skeleton } from "@mui/material";

import { useFetch } from "@/shared/hooks";
import { BoxLoading } from "@/shared/components";
import { ICompanyData } from "@/admin/utils/interfaces/company-data.interface";
import { IUserData } from "@/admin/utils/interfaces/user-data.interface";
import { MENU_MAIN_HISTORY_NAV } from "@/admin/utils/constants/menuMainHistoryNav";
import { CompanyBalanceForm } from "@/admin/components/companies/CompanyBalanceForm";

type Role = "SUPER_ADMIN" | "ADMIN" | "SELLER";

const CompanyBalancePageSkeleton = () => {
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

export const CompanyBalancePage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const companyIdParam = params.get("companyId") || "";

  const { data: me, loading: loadingMe } = useFetch<IUserData & { amount?: number }>(
    "users/me",
    "GET",
    { init: true, cache: { enabled: false } }
  );

  const currentUser = useMemo(() => {
    if (!me) return null;
    const companyId = (me as any)?.companyId ?? (me as any)?.company?.id ?? null;
    return { id: me.id, type: me.type as Role, companyId };
  }, [me]);

  const isSuperAdmin = currentUser?.type === "SUPER_ADMIN";
  const isAdmin = currentUser?.type === "ADMIN";

  const forcedCompanyId = !isSuperAdmin ? (currentUser?.companyId ?? "") : "";
  const selectedCompanyId = forcedCompanyId || companyIdParam;

  const shouldFetchCompanies = Boolean(currentUser) && isSuperAdmin;
  const shouldFetchMyCompany = Boolean(currentUser) && !isSuperAdmin && Boolean(forcedCompanyId);

  const { data: companies, loading: loadingCompanies } = useFetch<ICompanyData[]>(
    "companies",
    "GET",
    { init: shouldFetchCompanies, cache: { enabled: false } }
  );

  const { data: myCompany, loading: loadingMyCompany } = useFetch<ICompanyData>(
    `companies/${forcedCompanyId}`,
    "GET",
    { init: shouldFetchMyCompany, cache: { enabled: false } }
  );

  const loadingAny =
    loadingMe ||
    (Boolean(currentUser) && isSuperAdmin && loadingCompanies) ||
    (Boolean(currentUser) && !isSuperAdmin && Boolean(forcedCompanyId) && loadingMyCompany);

  if (loadingAny) {
    return <CompanyBalancePageSkeleton />;
  }

  if (!currentUser) return null;

  if (currentUser.type === "SELLER") {
    navigate(MENU_MAIN_HISTORY_NAV("dashboard"));
    return null;
  }

  const listForForm = isSuperAdmin ? companies ?? [] : myCompany ? [myCompany] : [];

  return (
    <Box>
      <CompanyBalanceForm
        title="Ajustar balances de empresa"
        onBack={() => navigate(MENU_MAIN_HISTORY_NAV("companies"))}
        companies={listForForm}
        loading={false}
        initialCompanyId={selectedCompanyId}
        isSuperAdmin={isSuperAdmin}
        isAdmin={isAdmin}
      />

      <BoxLoading isLoading={false} title="Cargando..." position="absolute" />
    </Box>
  );
};