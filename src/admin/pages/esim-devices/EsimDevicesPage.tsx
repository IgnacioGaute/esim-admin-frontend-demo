import { useMemo, useState } from "react";
import { Box, Button, Skeleton } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useFetch, useNotiAlert } from "@/shared/hooks";
import { BoxLoading, NavigateLink, ModalConfirmDelete } from "@/shared/components";
import { IDeviceModel } from "@/admin/utils/interfaces/esim-devices.interface";
import { ListEsimDevicesDataTable } from "@/admin/components/esim-devices/ListEsimDevicesDataTable";
import { alpha } from "@mui/material"

type Role = "SUPER_ADMIN" | "ADMIN" | "SELLER";
type CurrentUser = { id: string; type: Role; companyId?: string | null };

interface IUserMeLike {
  id: string;
  type: Role;
  companyId?: string | null;
  company?: { id: string };
}

const EsimDevicesPageSkeleton = () => {
  return (
    <Box>
      <Box display="flex" width="100%" justifyContent="flex-end" mb={2.5}>
        <Skeleton variant="rounded" width={190} height={44} />
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

export const EsimDevicesPage = () => {
  const navigate = useNavigate();
  const { snackBarAlert } = useNotiAlert();

  const [loadDelete, setLoadDelete] = useState(false);
  const [modelId, setModelId] = useState<string>("");

  const { data: me, loading: loadingMe } = useFetch<IUserMeLike>("users/me", "GET", {
    init: true,
    cache: { enabled: false },
  });

  const currentUser: CurrentUser | null = useMemo(() => {
    if (!me) return null;
    return {
      id: me.id,
      type: me.type as Role,
      companyId: (me as any).companyId ?? (me as any).company?.id ?? null,
    };
  }, [me]);

  const {
    data: models,
    loading: loadingModels,
    onRefresh,
    onFetch,
  } = useFetch<IDeviceModel[]>("admin/esim-devices/models", "GET", {
    init: Boolean(currentUser),
    cache: { enabled: false },
  });

  const parsedModels = useMemo(() => {
    if (!models) return [];
    return models.map((m) => ({
      ...m,
      brandName: m.brand?.name ?? "",
    })) as Array<IDeviceModel & { brandName: string }>;
  }, [models]);

  const onDeleteModel = async (id: string) => {
    setLoadDelete(true);
    const { ok } = await onFetch(`admin/esim-devices/models/${id}`, "DELETE");
    setLoadDelete(false);

    if (!ok) return;

    setModelId("");
    snackBarAlert("Dispositivo eliminado correctamente", { variant: "success" });
    onRefresh();
  };

  const isPageLoading = loadingMe || (Boolean(currentUser) && loadingModels);

  if (isPageLoading) {
    return <EsimDevicesPageSkeleton />;
  }

  if (currentUser?.type === "SELLER") return null;

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
            Agregar Dispositivo
          </Button>
        </NavigateLink>
      </Box>

      <ListEsimDevicesDataTable
        modelList={parsedModels}
        currentUser={currentUser}
        loading={false}
        onShowModel={() => {}}
        onEdit={(id) => navigate(`edit/${id}`)}
        onDelete={(id) => setModelId(id)}
      />

      <BoxLoading isLoading={loadDelete} title="Eliminando dispositivo..." position="absolute" />

      <ModalConfirmDelete
        opened={modelId !== ""}
        onClose={() => setModelId("")}
        onConfirm={() => onDeleteModel(modelId)}
        title="¿Está seguro de eliminar este dispositivo?"
        desp="Si elimina el dispositivo, no podrá recuperarlo más adelante."
      />
    </div>
  );
};