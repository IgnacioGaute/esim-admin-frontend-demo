import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useFetch, useNotiAlert } from "@/shared/hooks";
import { IUsersType } from '@/shared/interfaces/user';
import { BoxLoading } from '@/shared/components/BoxLoading';
import { RuleUserForm, ICountryDataOption, IBundleDataOption } from '@/admin/components/rules-user/RuleUserForm';
import { IRuleUser, IFormDataRuleUser } from '@/admin/utils/interfaces/rule-user.interface';
import { MENU_MAIN_HISTORY_NAV } from '@/admin/utils/constants/menuMainHistoryNav';
import { ruleUserHelper } from '@/admin/utils/helpers/ruleUserHelper';

export const RuleUserEditPage = () => {
  const { ruleId } = useParams<{ruleId: string}>();
  const { search } = useLocation();
  const navigate = useNavigate();
  const { snackBarAlert } = useNotiAlert();


  const { data, loading: loadDetail, onFetch, clearCache } = useFetch<IRuleUser>(`/rules/${ruleId}`, 'GET', { 
    init: ruleId !== undefined, 
    cache: { enabled: false }
  });

  useEffect(() => {
    if( data ){
      const searchInitIso = data.scope_type == 'BUNDLE' ? ruleUserHelper().searchIsoByBundleName(data.scope_value) : ruleUserHelper().searchIsoByIso(data.scope_value);

      if( searchInitIso ){
        setParamSearchCountry('iso');
        setSearchCountry(searchInitIso);

        if( data.scope_type == 'BUNDLE' ){
          setSearchBundleByIso(searchInitIso);
        }
      }
    }
  
    return () => {

    }
  }, [data])
  

  const [loading, setLoading] = useState(false);
  const [paramSearchCountry, setParamSearchCountry] = useState<'search' | 'iso'>('search')
  const [searchCountry, setSearchCountry] = useState<string>('');
  const [searchBundleByIso, setSearchBundleByIso] = useState('');

  const { data: user } = useFetch<{ type: keyof IUsersType; id: string; }>('auth/me', 'get', { init: true });
  const { data: countries, loading: loadCountry } = useFetch<{ data: ICountryDataOption[] }>(`countries?${paramSearchCountry}=${searchCountry}`, 'get', { 
    init: searchCountry !== '',
    instance: 'storeApi',
    configAxios: {
      headers: {
        'x-reseller-id': user?.id
      }
    }
  });
  const { 
    data: bundles, 
    loading: loadBundle
  } = useFetch<{ bundles: IBundleDataOption[] }>(`/catalogue?countries=${searchBundleByIso}&perPage=500`, 'GET', { 
    init: searchBundleByIso !== '', 
    instance: 'storeApi',
    configAxios: {
      headers: {
        'x-reseller-id': user?.id
      }
    }
  });
  

  if( loadDetail ){
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

  const onEdit = async(values: IFormDataRuleUser) => {
    const { scope_type, scope_value, type, profit_margin, reseller_margin, is_active } = values; 
    setLoading(true);

    const { ok } = await onFetch<IRuleUser, any>(`/rules/${ruleId}`, 'PUT', { data: {
      scope_type, scope_value, type, profit_margin, reseller_margin, is_active
    } });

    setLoading(false);

    if( !ok ) return;

    snackBarAlert('La regla se ha actualizado correctamente', { variant: 'success' });
    clearCache();
    navigate(-1)
  }

  return (
    <RuleUserForm 
      dataForm={data}
      title='Editar Regla'
      onBack={() => navigate(
        user?.type == 'SELLER' ? MENU_MAIN_HISTORY_NAV('rulesre') : 
        MENU_MAIN_HISTORY_NAV(['users', 'rules'])+search
      )}
      onSubmit={(values) => onEdit(values)}
      loading={loading}
      country={{
        search: value => {
          setParamSearchCountry('search');
          setSearchCountry(value);
        },
        data: countries?.data || [],
        loading: loadCountry,
        country: countries?.data[0]
      }}
      bundle={{
        data: bundles?.bundles || [],
        loading: loadBundle,
        onChangeIso: value => setSearchBundleByIso(value),
        bundle: ruleUserHelper().getBundle(data?.scope_value, bundles?.bundles)
      }}
      isEdit={true}
    />
  )
}
