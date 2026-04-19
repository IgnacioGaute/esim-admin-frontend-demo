import { useEffect, useState } from 'react';
import { useLocation, useNavigate  } from 'react-router-dom';
import { useFetch, useNotiAlert } from "@/shared/hooks";
import { MENU_MAIN_HISTORY_NAV } from '@/admin/utils/constants/menuMainHistoryNav';
import { IDataCodeReferral  } from '@/admin/utils/interfaces/referral.interface';
import { FormReferral } from '@/admin/components/referral/FormReferral';

export const ReferralNewPage = () => {
    const navigate = useNavigate();
    const { snackBarAlert } = useNotiAlert();
    const { search } = useLocation();

    const [userId, setUserId] = useState<string | undefined>();
    const [codeReferral, setCodeReferral] = useState<IDataCodeReferral | undefined>(undefined);

    const { data, loading, clearCache, error, deleteCache } = useFetch<any, IDataCodeReferral>('/users/referral-codes', 'post', { 
        init: codeReferral !== undefined, 
        body: codeReferral,
        cache: { enabled: false }
    });

    useEffect(() => {
        if( search !== '' ){
          const searhString = search.split('?')[1];
          const searchId = searhString.split('&')[0];
         
          if( searchId.includes('userId=') ){
            setUserId(searchId.split('userId=')[1]);
          }
          
        }
    }, [search]);

    useEffect(() => {
        
        
        if( data ){
          if( data?.status == 400 ){
            deleteCache();
            snackBarAlert(data?.message, { variant: 'error' });
            return;
          }

          snackBarAlert('El Código de referido se ha creado correctamente', { variant: 'success' });
          clearCache();
          navigate(MENU_MAIN_HISTORY_NAV(['users', 'referral'])+search)
        }
  
        if( error ){
          setCodeReferral(undefined);
        }
      
        return () => {
          if( data ) clearCache();
        }
      }, [data, error])

    return (
        <FormReferral 
            onBack={() => navigate(MENU_MAIN_HISTORY_NAV(['users', 'referral'])+search)}
            onSubmit={(values) => {
                console.log("values", values);
                if( userId ){
                    setCodeReferral({
                        ...values,
                        user_id: userId
                    })

                    return;
                }

                snackBarAlert('Para crear el código de referido, debe seleccionar un usuario', { variant: 'error' });
            }}
            loading={loading}
        />
    )
}
