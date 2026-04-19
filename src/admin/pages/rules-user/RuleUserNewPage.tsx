
import { useEffect, useState } from 'react';
import { useLocation, useNavigate  } from 'react-router-dom';
import { useFetch, useNotiAlert } from "@/shared/hooks";
import { IUsersType } from '@/shared/interfaces/user';
import { RuleUserForm, ICountryDataOption, IBundleDataOption } from '@/admin/components/rules-user/RuleUserForm';
import { IRuleUser, IFormDataRuleUser } from '@/admin/utils/interfaces/rule-user.interface';
import { MENU_MAIN_HISTORY_NAV } from '@/admin/utils/constants/menuMainHistoryNav';


export const RuleUserNewPage = () => {
  const navigate = useNavigate();
  const { snackBarAlert } = useNotiAlert();
  const { search } = useLocation();

  const [resellerId, setResellerId] = useState<string | undefined>();
  const [ruleUserData, setRuleUserData] = useState<IFormDataRuleUser | undefined>();
  const [searchCountry, setSearchCountry] = useState<string>('');
  const [searchBundleByIso, setSearchBundleByIso] = useState('');
  const { data: user } = useFetch<{ type: keyof IUsersType, id: string }>('auth/me', 'get', { init: true });
  const { data: countries, loading: loadCountry } = useFetch<{ data: ICountryDataOption[] }>(`countries?search=${searchCountry}`, 'get', { 
    init: searchCountry !== '' || user?.type == 'SELLER',
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
  const { data, loading, clearCache, error } = useFetch<IRuleUser, IFormDataRuleUser>('/rules', 'post', { 
    init: ruleUserData !== undefined, 
    body: ruleUserData,
    cache: { enabled: false }
});

  useEffect(() => {
    if( search !== '' ){
      const searhString = search.split('?')[1];

      if( searhString.includes('resellerId=') ){
        setResellerId(searhString.split('resellerId=')[1]);
      }
      
    }
    
  }, [search]);

  useEffect(() => {
    if( data ){
      snackBarAlert('La regla se ha creado correctamente', { variant: 'success' });
      clearCache();
      navigate(-1)
    }

    if( error ){
      setRuleUserData(undefined);
    }
  
    return () => {
      if( data ) clearCache();
    }
  }, [data, error]);

  return (
    <RuleUserForm 
      onBack={() => navigate(
        user?.type == 'SELLER' ? MENU_MAIN_HISTORY_NAV('rulesre') : 
        MENU_MAIN_HISTORY_NAV(['users', 'rules'])+search
      )}
      onSubmit={(values) => setRuleUserData({
          ...values,
          reseller_id: resellerId,
          is_reseller_rule: user?.type === 'SELLER'
        })
      }
      loading={loading}
      country={{
        search: value => setSearchCountry(value),
        data: countries?.data || [],
        loading: loadCountry
      }}
      bundle={{
        data: bundles?.bundles || [],
        loading: loadBundle,
        onChangeIso: value => setSearchBundleByIso(value)
      }}
    />
  )
}
