import { useMemo, useState } from "react";
import { Box, Button, Skeleton, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useFetch, useNotiAlert } from "@/shared/hooks";
import { BoxLoading, NavigateLink } from "@/shared/components";
import { ICompanyData } from "@/admin/utils/interfaces/company-data.interface";
import { IUserData } from "@/admin/utils/interfaces/user-data.interface";
import { ListCompanyDataTable } from "@/admin/components";
import { CompanyMyCompanyDetails } from "@/admin/components/companies/CompanyMyCompanyDetails";
import { alpha } from "@mui/material"

type Role = "SUPER_ADMIN" | "ADMIN" | "SELLER";

const CompanyPageSkeleton = () => {
  return (
    <Box>
      <Box display="flex" width="100%" justifyContent="flex-end" mb={2.5}>
        <Skeleton variant="rounded" width={180} height={44} />
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
          gridTemplateColumns="1.2fr 1fr 1fr 1fr 120px"
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
            gridTemplateColumns="1.2fr 1fr 1fr 1fr 120px"
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

export const CompanyPage = () => {
  const navigate = useNavigate();
  const { snackBarAlert } = useNotiAlert();

  const [loadDelete, setLoadDelete] = useState(false);

  const { data: me, loading: loadingMe } = useFetch<IUserData & { amount?: number }>(
    "users/me",
    "GET",
    { init: true, cache: { enabled: false } }
  );

  const currentUser = useMemo(() => {
    if (!me) return null;

    const companyId = (me as any)?.companyId ?? (me as any)?.company?.id ?? null;

    return {
      id: me.id,
      type: me.type as Role,
      companyId,
    };
  }, [me]);

  const isSuperAdmin = currentUser?.type === "SUPER_ADMIN";
  const shouldFetchCompanies = Boolean(currentUser) && isSuperAdmin;

  const {
    data: companies,
    loading: loadingCompanies,
    onRefresh,
    onFetch,
  } = useFetch<ICompanyData[]>("companies", "GET", {
    init: shouldFetchCompanies,
  });

  const onDeleteCompany = async (id: string) => {
    setLoadDelete(true);

    const { ok } = await onFetch(`companies/${id}`, "DELETE");

    setLoadDelete(false);
    if (!ok) return;

    snackBarAlert("La empresa se ha eliminado correctamente", { variant: "success" });
    onRefresh();
  };

  const isPageLoading = loadingMe || (isSuperAdmin && loadingCompanies);

  if (isPageLoading) {
    return <CompanyPageSkeleton />;
  }

  if (!currentUser) return null;

  if ((currentUser.type === "ADMIN" || currentUser.type === "SELLER") && currentUser.companyId) {
    return (
      <CompanyMyCompanyDetails
        companyId={currentUser.companyId}
        currentRole={currentUser.type}
        onEdit={(id) => navigate(`edit/${id}`)}
      />
    );
  }

  if (currentUser.type === "ADMIN" && !currentUser.companyId) {
    return (
      <Box>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            border: "1px dashed",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Typography fontWeight={700} mb={0.5}>
            Todavía no tenés una empresa creada
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={2}>
            Como <b>ADMIN</b> podés crear <b>una sola</b> empresa y luego vas a ver la vista personalizada.
          </Typography>

          <NavigateLink
            to="new"
            uiLink={{ component: "span", underline: "none" }}
          >
            <Button variant="contained" disableElevation sx={{ textTransform: "capitalize" }}>
              Crear mi empresa
            </Button>
          </NavigateLink>
        </Box>
      </Box>
    );
  }

  if (currentUser.type === "SELLER" && !currentUser.companyId) {
    return (
      <Box p={2}>
        <Typography variant="body2" color="text.secondary">
          No tenés una empresa asignada. Contactá a un administrador.
        </Typography>
      </Box>
    );
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
            Agregar Empresa
          </Button>
        </NavigateLink>
      </Box>

      <ListCompanyDataTable
        companyList={companies || []}
        loading={false}
        onShowCompany={(company) => navigate(`edit/${company.id}`)}
        onDelete={onDeleteCompany}
        onEdit={(value) => navigate(`edit/${value}`)}
      />

      <BoxLoading
        isLoading={loadDelete}
        title="Eliminando empresa..."
        position="absolute"
      />
    </div>
  );
};