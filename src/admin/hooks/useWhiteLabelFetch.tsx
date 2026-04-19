
import { useState, useEffect } from 'react'
import { useFetch, useNotiAlert } from '@/shared/hooks';
import { IResellerWhitelabelData, ISaveDataWhiteLabel } from '../utils/interfaces/whitelabel-data.interface';

const URL_BASE_WL = '/whitelabel/reseller';

export const useWhiteLabelFetch = () => {
  const [loading, setLoading] = useState(false);

  const { snackBarAlert } = useNotiAlert();
  const { data, clearCache, onFetch, loading: load } = useFetch<IResellerWhitelabelData>(URL_BASE_WL, 'GET', { init: true });

  useEffect(() => {
    setLoading(load);
  }, [load])
  
  const onSaveWhiteLabel = async(whiteLabel: ISaveDataWhiteLabel) => {
    setLoading(true);
    const { ok } = await onFetch<IResellerWhitelabelData, ISaveDataWhiteLabel>(URL_BASE_WL, 'PATCH', { data: whiteLabel });

    setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    if( !ok ) return false;

    snackBarAlert('Se ha actualizado la información correctamente', { variant: 'success' });
    clearCache();

    return true;
  }

  const onSaveLogoNavbarFooter = async(data: FormData, msgSuccess: string = 'Se ha cargado el logo correctamente') => {
    setLoading(true);
    const { ok } = await onFetch<IResellerWhitelabelData, FormData>(`${URL_BASE_WL}/upload/logo`, 'post', { data, headers:{
      'Content-Type': 'multipart/form-data'
    }});

    setTimeout(() => {
      setLoading(false);
    }, 1500);

    
    
    if( !ok ) return false;

    snackBarAlert(msgSuccess, { variant: 'success' });
    clearCache();

    return true;
  }

  const onSaveUploadImage = async(file: File) => {
    setLoading(true);

    const data = new FormData();
    data.append('file', file);

    const { ok, data: dataResp } = await onFetch<{ image_url: string }, FormData>(`${URL_BASE_WL}/upload/image`, 'post', { data, headers:{
      'Content-Type': 'multipart/form-data'
    }});

    setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    if( !ok  ) return undefined;

    snackBarAlert('Se ha cargado la imagen correctamente', { variant: 'success' });
    clearCache();

    return dataResp?.image_url;
  }

  return {
    dataWhiteLabel: data,
    loading,
    //func
    onSaveWhiteLabel,
    onSaveLogoNavbarFooter,
    onSaveUploadImage
  }
}
