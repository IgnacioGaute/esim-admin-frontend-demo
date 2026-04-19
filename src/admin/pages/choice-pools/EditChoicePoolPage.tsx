import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { useFetch, useNotiAlert } from "@/shared/hooks";
import { IChoicePool, IFormChoicePool } from '@/admin/utils';
import { BoxLoading } from '@/shared';
import { MENU_MAIN_HISTORY_NAV } from '@/admin/utils/constants/menuMainHistoryNav';
import { FormChoicePool } from '@/admin/components/choice-pools';

export const EditChoicePoolPage = () => {
    const { poolId } = useParams<{poolId: string}>();
    const navigate = useNavigate();
    const { snackBarAlert } = useNotiAlert();

    const [loading, setLoading] = useState(false);
    const { data, loading: loadPool, onFetch, clearCache } = useFetch<IChoicePool>(`/choice-pools/${poolId}`, 'GET', { 
        init: poolId !== undefined, 
        cache: { enabled: false }
    });

    const onEdit = async(values: IFormChoicePool) => {
        const { name, provider, idPool, imsiFrom, imsiTo } = values;
        const dataForm = { name, provider, idPool, imsiFrom, imsiTo }
        setLoading(true);

        const { ok } = await onFetch<IChoicePool, IFormChoicePool>(`/choice-pools/${poolId}`, 'PUT', { data: { ...dataForm } });

        setLoading(false);

        if( !ok ) return;

        snackBarAlert('El pool se ha actualizado correctamente', { variant: 'success' });
        clearCache();
        navigate(MENU_MAIN_HISTORY_NAV('choice-pools'))
    }

    if( loadPool ){
        return(
            <div style={{position: 'relative', height: '100%', width: '100%'}}>
                <BoxLoading
                    isLoading
                    showGif
                    position='absolute'
                />
            </div>
        )
    }

    return (
        <FormChoicePool 
            onBack={() =>  navigate(MENU_MAIN_HISTORY_NAV('choice-pools'))}
            onSubmit={onEdit}
            title='Editar Pool'
            dataForm={data}
            loading={loading}
        />
    )
}
