import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";

import { useFetch, useNotiAlert } from "@/shared/hooks";
import { BoxLoading } from "@/shared/components/BoxLoading";
import { MENU_MAIN_HISTORY_NAV } from "@/admin/utils/constants/menuMainHistoryNav";
import { IDeviceModel, IFormDeviceModel } from "@/admin/utils/interfaces/esim-devices.interface";
import { DeviceModelFormNewAndEdit } from "@/admin/components/esim-devices/DeviceModelFormNewAndEdit";

export const EsimDeviceEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { snackBarAlert } = useNotiAlert();

  const [loading, setLoading] = useState(false);

  const { data, loading: loadDetail, onFetch, clearCache } = useFetch<IDeviceModel>(
    id ? `admin/esim-devices/models/${id}` : "",
    "GET",
    { init: Boolean(id), cache: { enabled: false } }
  );

  const dataForm: IFormDeviceModel | undefined = useMemo(() => {
    if (!data) return undefined;
    return {
      brandId: data.brandId,
      name: data.name,
      maxEsims: data.maxEsims,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    };
  }, [data]);

  const onEdit = async (values: IFormDeviceModel) => {
    if (!id) return;

    setLoading(true);

    const { ok } = await onFetch(`admin/esim-devices/models/${id}`, "PATCH", {
      data: {
        brandId: values.brandId,
        name: values.name,
        maxEsims: Number(values.maxEsims),
        isActive: Boolean(values.isActive),
        sortOrder: Number(values.sortOrder),
      },
    });

    setLoading(false);

    if (!ok) return;

    snackBarAlert("El dispositivo se ha actualizado correctamente", { variant: "success" });
    clearCache();
    navigate(MENU_MAIN_HISTORY_NAV("esim-devices"));
  };

  if (loadDetail) {
    return (
      <div style={{ position: "relative", height: "100%", width: "100%" }}>
        <BoxLoading isLoading showGif position="absolute" />
      </div>
    );
  }

  return (
    <Box>
      <DeviceModelFormNewAndEdit
        title="Editar dispositivo"
        onBack={() => navigate(MENU_MAIN_HISTORY_NAV("esim-devices"))}
        onSubmit={onEdit}
        dataForm={dataForm}
        loading={loading}
      />
    </Box>
  );
};
