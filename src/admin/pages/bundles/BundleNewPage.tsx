import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DATA_COUNTRY, getCountryByIso } from '@/shared/helpers/countryHelper';
import { useNotiAlert, useFetch } from '@/shared/hooks'
import { BundleForm } from '@/admin/components/bundles'
import { MENU_MAIN_HISTORY_NAV } from '@/admin/utils/constants/menuMainHistoryNav';
import { BundleMccMnc, IBundleFormData, IListCountryRate, IServingMccMnc } from '@/admin/utils/interfaces/bundle-module-data.interface';
import { IChoicePool } from '@/admin/utils';


export const BundleNewPage = () => {
  const navigate = useNavigate();
  const [bundleForm, setBundleForm] = useState<IBundleFormData | undefined>(undefined);
  const { data: pools, loading: loadPools  } = useFetch<IChoicePool[]>('/choice-pools', 'GET', { init: true });
  const { data: countries, loading: loadCountry } = useFetch<IListCountryRate[]>('/catalogue/choice/countries-rates', 'GET', { init: true });
  const { data, loading, clearCache, error } = useFetch<any, IBundleFormData>('/catalogue/choice/create-bundle', 'post', { 
    init: bundleForm !== undefined, 
    body: bundleForm,
    cache: { enabled: false }
  });
  const { snackBarAlert } = useNotiAlert();

  useEffect(() => {
    if( data ){
      snackBarAlert('El bundle se ha creado correctamente', { variant: 'success' });
      clearCache();
      navigate(MENU_MAIN_HISTORY_NAV('bundles'))
    }

    if( error ){
      setBundleForm(undefined);
    }
  
    return () => {
      if( data ) clearCache();
    }
  }, [data, error])

  return (
    <BundleForm 
      onBack={() => navigate(MENU_MAIN_HISTORY_NAV('bundles'))}
      onSubmit={(values) => {
        const country = getCountryByIso(values.iso);

        if( country ){
          const { name, description, dataAmount, duration, serving_mcc_mnc } = values;
          let rate = 0;

          serving_mcc_mnc.map((value) => {
            countries?.map((item => {
              if( item.mcc+''+item.mnc === value ){
                rate = rate + item.rate;
              }
            }))
          })

          const price = Math.round((rate * (dataAmount * 1024)) * 100) / 100;

          let serving_networks: IServingMccMnc[] = [];
          serving_mcc_mnc.forEach((value) => {
            serving_networks.push({ serving_mcc_mnc: value });
          })

          const data: IBundleFormData = {
            name,
            description,
            dataAmount: dataAmount * 1024,
            duration,
            price,
            serving_networks,
            countries: [{
              name: country.name,
              region: country.description,
              iso: country.iso
            }],
            choicePoolId: values.choicePoolId
          }
          
          console.log({ data })
          setBundleForm(data);
        }

        
      }}
      loading={loading}
      countries={countries || []}
      loadNetwork={loadCountry}
      pools={pools || []}
      loadPools={loadPools}
    />
  )
}
