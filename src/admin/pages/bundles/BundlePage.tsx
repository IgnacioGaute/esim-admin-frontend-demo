import { useState } from "react";
import { Box, Button } from "@mui/material";
import { useNavigate  } from 'react-router-dom';
import { useFetch, useNotiAlert } from "@/shared/hooks";
import { BoxLoading, NavigateLink } from "@/shared/components";
import { BundleModule, IBundleModule } from "@/admin/utils/interfaces/bundle-module-data.interface";
import { ListBundleDataTable } from "@/admin/components/bundles";
import { EditBundlePoolChoice } from "@/admin/components/bundles/EditBundlePoolChoice";
import { IChoicePool } from "@/admin/utils";
import { alpha } from "@mui/material"

export const BundlePage = () => {
  const navigate = useNavigate();
  const { snackBarAlert } = useNotiAlert();
  const [bundleEditPool, setBundleEditPool] = useState<BundleModule | null>(null);

  const [loadDelete, setLoadDelete] = useState(false);
  const [loadEdit, setLoadEdit] = useState(false);
  const { data, loading, onRefresh, onFetch,  clearCache } = useFetch<IBundleModule>('/catalogue', 'GET', { init: true });
   const { data: pools  } = useFetch<IChoicePool[]>('/choice-pools', 'GET', { init: true });

   const onEditPool = async(id: string, newPoolId: string) => {
    setLoadEdit(true);

    const { ok } = await onFetch<IChoicePool, { choicePoolId: string }>(`/catalogue/choice/edit-bundle/${id}`, 'PUT', { data: { 
      choicePoolId: newPoolId
      } });

    setLoadEdit(false);

    if( !ok ) return;

    snackBarAlert('El pool se ha actualizado correctamente', { variant: 'success' });
    clearCache();
    onRefresh();
    setBundleEditPool(null)
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
            Agregar Paquete
          </Button>
        </NavigateLink>
      </Box>
      <ListBundleDataTable
        bundleList={data?.bundles || []}
        loading={loading}
        onShowBundle={(bundle) => console.log(bundle)}
        onEditPool={(id) => {
          setBundleEditPool(data?.bundles.find((value) => value._id === id)!);
        }}
        onShowPool={(idPool) => console.log(idPool)}
      />
      <BoxLoading 
        isLoading={loadDelete}
        title='Eliminando paquete...'
        position='absolute'
      /> 
       <BoxLoading 
        isLoading={loadEdit}
        title='Actualizando pool paquete...'
        position='absolute'
      /> 
      <EditBundlePoolChoice 
        opened={ bundleEditPool !== null }
        onClose={() => setBundleEditPool(null)}
        name={bundleEditPool?.name || ''}
        desp={bundleEditPool?.description || ''}
        onSubmit={(newPool) => {
          onEditPool(bundleEditPool?._id!, newPool.choicePoolId)
        }}
        pools={pools || []}
        idPoolCurrent={bundleEditPool?.choiceId || undefined}
      />
    </div>
  )
}
