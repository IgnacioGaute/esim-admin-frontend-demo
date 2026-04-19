import { useEffect, useMemo, useState } from 'react'
import { Box, CircularProgress, Grid, Typography  } from '@mui/material';
import { useFetch, useScreenSize  } from '@/shared/hooks';
import { filterDataHelper } from '@/shared/helpers/filterDataHelper';
import { PlanLayout, PlanSearchCountry, PlanCardBundle, PlanNotData, PlanBundleDesp, ITypeDataFilter } from '@/store/components/plans';
import { IBundleData, ICountryData, IDataRespBundle, IWalletData } from '@/store/utils/interfaces';
import { useCart } from '@/store/hooks';


export const PlansPage = () => {
  const { width } = useScreenSize();
  const { addNewItem, onChangeModalCart } = useCart();
  const [openFilter, setOpenFilter] = useState(false);
  const [searchCountry, setSearchCountry] = useState('');
  const [countrySelect, setCountrySelect] = useState<ICountryData | null>(null);
  const [bundleSelect, setBundleSelect] = useState<IBundleData | null>(null);
  const [valuesFilter, setValuesFilter] = useState<ITypeDataFilter | null>();

  const { 
    data: countriesTop, 
    loading: loadCountriesTop 
  } = useFetch<{ data: ICountryData[] }>('/countries', 'GET', { init: true, instance: 'storeApi' });

  const { 
    data: countries, 
    loading: loadCountries
  } = useFetch<{ data: ICountryData[] }>(`/countries?search=${searchCountry}`, 'GET', { 
    init: searchCountry !== '', 
    instance: 'storeApi',
  });

  const { 
    data, 
    loading
  } = useFetch<IDataRespBundle>(`/catalogue?countries=${countrySelect?.iso}&perPage=500`, 'GET', { 
    init: countrySelect !== null, 
    instance: 'storeApi',
  });

  const { data: user } = useFetch<{ id: string }>('auth/me', 'get', { init: true });
  const { data: balance, loading: loadBalance} = useFetch<{wallet: IWalletData}>(`wallets/reseller/${user?.id}`, 'get', { init: user !== undefined });

  const bundles = useMemo(() => {
    let dataBundles = data?.bundles || [];

    if( valuesFilter ){
      const { days, unlimited, roaming } = valuesFilter;
      
      if( days && days !== 'all'){
        const fromTo = days == '30+' ? [30] : days.split('-');
        dataBundles = filterDataHelper<IBundleData>(dataBundles)
        .fromTo('duration', Number(fromTo[0]), fromTo.length > 1 ? Number(fromTo[1]) : undefined);
      }

      if( unlimited ){
        dataBundles = filterDataHelper<IBundleData>(dataBundles).byValue('unlimited', unlimited);
      }

      if( roaming ){
        dataBundles = filterDataHelper<IBundleData>(dataBundles).isEmpity('roamingEnabled');
      }
    }

    return dataBundles;
  }, [data, valuesFilter])

  useEffect(() => {
    if( width > 991 ) setOpenFilter(true); 
  }, [width])

  const message = useMemo(() => {
    if( countrySelect == null )
      return <span>¿Planeando su próxima compra?. Elige primero el <b>destino</b> y luego la duración del plan de datos.</span>
    

    if( countrySelect && bundles.length ==  0 && valuesFilter == null)
      return <span>Lo sentimos, actualmente no tenemos paquetes de datos para este pais: <b>"{countrySelect.name}"</b></span>

    if( valuesFilter && bundles.length ==  0 ){
      return <span>Lo sentimos, no se encontraron paquetes: </span>
    }

    return undefined;
  }, [countrySelect, bundles, valuesFilter])
  
  return (
    <PlanLayout
      open={openFilter}
      onClose={() => setOpenFilter(false)}
      countries={countriesTop?.data || []}
      loadCountry={loadCountriesTop}
      enabledDrawer={width <= 991 ? true : false}
      isPersistent={width <= 991 ? false : true}
      isMobile={width <= 580 ? true : false}
      onSelectCountry={country => {
        setValuesFilter(null);
        setCountrySelect(country);
      }}
      country={countrySelect}
      onChangeFilter={values => setValuesFilter(values)}
      valuesFilter={valuesFilter}
      wallet={balance?.wallet}
    >
      <PlanSearchCountry 
        countries={countries?.data || []}
        onChangeSearch={value => {
          if( countrySelect && value == '' ){
            setCountrySelect(null);
          }

          setSearchCountry(value)
        }}
        loadSearch={loadCountries}
        country={countrySelect}
        onSelectCountry={country => {
          setCountrySelect(country)
          setValuesFilter(null);
        }}
        countFilter={1}
        openFilter={() => setOpenFilter(true)}
        img={bundles.length > 0 && countrySelect ? bundles[0].imageUrl : undefined}
      />
      <Box pt={countrySelect ? 6 : 4}>
        <Grid container spacing={2} alignItems="stretch">
          {
            !loading && message &&
            <Grid item xs={12}>
              <PlanNotData 
                message={message}
                onShowCountry={width <= 991 ? () => setOpenFilter(true) : undefined}
              />
            </Grid>
          }
          {
            loading && 
            <Grid item xs={12}>
              <Box py={5} display='flex' flexDirection='column' alignItems='center' justifyContent='center' width='100%'>
                <CircularProgress />
                <Typography textAlign='center' maxWidth='380px' mt={3}>
                    Buscando paquetes por el destino: "<b>{countrySelect?.name}</b>"
                </Typography>
              </Box>
            </Grid>
          }
          {
            !loading && countrySelect && bundles.map((bundle, idx) => (
              <Grid item xs={12} md={3} key={idx} sx={{ display: 'flex' }}>
                <PlanCardBundle
                  bundle={bundle}
                  onDetail={bundle => setBundleSelect(bundle)}
                  addCartItem={(bundle, quantity) => {
                    if( countrySelect ){
                      addNewItem({
                        ...bundle,
                        country: countrySelect
                      }, quantity);
                    }
                  }}
                />
              </Grid>
            ))
          }
          <PlanBundleDesp 
            opened={bundleSelect !== null && countrySelect !== null}
            handleClose={() => setBundleSelect(null)}
            country={countrySelect}
            bundle={bundleSelect}
            addCartItem={(bundle, quantity) => {
              if( countrySelect ){
                addNewItem({
                  ...bundle,
                  country: countrySelect
                }, quantity);
                setBundleSelect(null);
                onChangeModalCart(true);
              }
            }}
          />
        </Grid>
      </Box>
    </PlanLayout>
  )
}

