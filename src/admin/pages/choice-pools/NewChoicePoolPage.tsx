import { useNavigate } from 'react-router-dom';
import { FormChoicePool } from '@/admin/components/choice-pools'
import { useNotiAlert } from '@/shared/hooks/useNotiAlert';
import { MENU_MAIN_HISTORY_NAV } from '@/admin/utils/constants/menuMainHistoryNav';
import { useEffect, useState } from 'react';
import { IChoicePool, IFormChoicePool } from '@/admin/utils';
import { useFetch } from '@/shared';


export const NewChoicePoolPage = () => {
    const navigate = useNavigate();
    const { snackBarAlert } = useNotiAlert();

    const [pool, setPool] = useState<IFormChoicePool | undefined>();
    const { data, loading, clearCache, error } = useFetch<IChoicePool, IFormChoicePool>('/choice-pools', 'post', { 
        init: pool !== undefined, 
        body: pool,
        cache: { enabled: false }
    });
      
    
    useEffect(() => {
        if( data ){
            snackBarAlert('El pool se ha creado correctamente', { variant: 'success' });
            clearCache();
            navigate(MENU_MAIN_HISTORY_NAV('choice-pools'))
        }

        if( error ){
            setPool(undefined);
        }
    
        return () => {
        if( data ) clearCache();
        }
    }, [data, error])

    return (
        <FormChoicePool 
            onSubmit={(values) => {
                setPool(values)
            }}
            loading={loading}
            onBack={() => navigate(MENU_MAIN_HISTORY_NAV('choice-pools'))}
        />
    )
}
