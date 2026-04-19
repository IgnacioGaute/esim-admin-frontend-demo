import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useFetch, useNotiAlert } from "@/shared/hooks";
import { BoxLoading } from '@/shared/components/BoxLoading';
import { ICodeReferral, IFormCodeReferral  } from '@/admin/utils/interfaces/referral.interface';
import { MENU_MAIN_HISTORY_NAV } from '@/admin/utils/constants/menuMainHistoryNav';
import { FormReferral } from '@/admin/components/referral/FormReferral';


const epCodeReferral = '/users/referral-codes';

export const ReferralEditPage = () => {
  const { referralId } = useParams<{referralId: string}>();
  const { snackBarAlert } = useNotiAlert();
  const { search } = useLocation();
  const navigate = useNavigate();
  
  const { data: detailReferral, loading: loadReferral, onFetch, clearCache } = useFetch<ICodeReferral>(`${epCodeReferral}/${referralId}`, 'GET', { 
    init: referralId !== undefined, 
    cache: { enabled: false }
  });

  const [loading, setLoading] = useState(false);

  const onEdit = async(values: IFormCodeReferral) => {
    const { is_whitelabel, referer_code, commission_percent } = values;
    setLoading(true);

    const { ok, data } = await onFetch<any, IFormCodeReferral>(`${epCodeReferral}/${referralId}`, 'PATCH', { data: {
      is_whitelabel, referer_code, commission_percent
    } });

    setLoading(false);

    if( data?.status == 400 ){
      snackBarAlert(data?.message, { variant: 'error' });
      return;
    }

    if( !ok ) return;

    snackBarAlert('El Código de referido se ha actualizado correctamente', { variant: 'success' });
    clearCache();
    navigate(MENU_MAIN_HISTORY_NAV(['users', 'referral'])+search)
  }

  if( loadReferral ){
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
    <FormReferral 
      dataForm={detailReferral}
      title='Editar código de referido'
      onBack={() => navigate(MENU_MAIN_HISTORY_NAV(['users', 'referral'])+search)}
      onSubmit={onEdit}
      loading={loading}
    />
  )
}
