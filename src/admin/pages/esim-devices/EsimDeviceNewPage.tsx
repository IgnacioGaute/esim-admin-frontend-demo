import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useFetch, useNotiAlert } from "@/shared/hooks";
import { MENU_MAIN_HISTORY_NAV } from "@/admin/utils/constants/menuMainHistoryNav";
import { DeviceModelFormNewAndEdit } from "@/admin/components/esim-devices/DeviceModelFormNewAndEdit";
import { IDeviceModel, IFormDeviceModel } from "@/admin/utils/interfaces/esim-devices.interface";

export const EsimDeviceNewPage = () => {
  const navigate = useNavigate();
  const { snackBarAlert } = useNotiAlert();

  const [postBody, setPostBody] = useState<IFormDeviceModel | undefined>(undefined);

  const { data, loading, clearCache, error } = useFetch<IDeviceModel, IFormDeviceModel>(
    "admin/esim-devices/models",
    "POST",
    {
      init: postBody !== undefined,
      body: postBody,
      cache: { enabled: false },
    }
  );

  useEffect(() => {
    if (data) {
      snackBarAlert("El dispositivo se ha creado correctamente", { variant: "success" });
      clearCache();
      navigate(MENU_MAIN_HISTORY_NAV("esim-devices"));
    }

    if (error) {
      setPostBody(undefined);
    }

    return () => {
      if (data) clearCache();
    };
  }, [data, error]);

  return (
    <DeviceModelFormNewAndEdit
      onBack={() => navigate(MENU_MAIN_HISTORY_NAV("esim-devices"))}
      onSubmit={(values) => {
        setPostBody({
          ...values,
          maxEsims: Number(values.maxEsims),
          sortOrder: Number(values.sortOrder),
        });
      }}
      loading={loading}
    />
  );
};
