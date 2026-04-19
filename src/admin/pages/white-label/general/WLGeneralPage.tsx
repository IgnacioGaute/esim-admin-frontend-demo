import { useState, useEffect } from 'react';
import { BoxLoading } from '@/shared/components/BoxLoading';
import { useWhiteLabelFetch } from '@/admin/hooks/useWhiteLabelFetch';
import { FormImgGeneral, FormInfoGeneral,  ImgTypeGeneral } from '@/admin/components/white-label'
import { IDataFormInfoGeneral, IResellerWhitelabelData } from '@/admin/utils/interfaces/whitelabel-data.interface';



export const WLGeneralPage = () => {
  const [loading, setLoading] = useState(true);
  const [loadSave, setLoadSave] = useState(false)
  const { dataWhiteLabel, onSaveWhiteLabel, onSaveLogoNavbarFooter, loading: load } = useWhiteLabelFetch();

  useEffect(() => {
    if( dataWhiteLabel && !load ){
      setLoading(false)
    }

  }, [dataWhiteLabel, load])
  

  const formInfoValues = (data: IResellerWhitelabelData | undefined) => {
    if( data?.company && data?.navbar ){
      const { is_login_enabled, contact_url }  = data.navbar;

      return {
        is_login_enabled, 
        contact_url,
        ...data.company
      }
    }

    return undefined
  }

  const onSaveDataInfoGeneral = async(data: IDataFormInfoGeneral) => {
    setLoadSave(true)
    const { name, primary_color, secondary_color, contact_url, is_login_enabled } = data;
    
    const dataNavbarCurrent = dataWhiteLabel?.navbar;

    await onSaveWhiteLabel({
      company: {
        name,
        primary_color,
        secondary_color
      },
      navbar: {
        ...dataNavbarCurrent,
        is_login_enabled,
        contact_url
      }
    });
    setLoadSave(false)
  } 

  const onSavedImgNavbarFooter = async(type: ImgTypeGeneral, file: File) => {
    setLoadSave(true)
    const formData = new FormData();

    if( type == 'navbar_logo' ){
      formData.append('is_navbar_logo', 'true')
    }else{
      formData.append('is_footer_logo', 'true')
    }

    formData.append('file', file);
    await onSaveLogoNavbarFooter(formData);
    setLoadSave(false)
  }

  if( loading ){
    return(
      <div style={{position: 'relative', height: '430px', width: '100%'}}>
        <BoxLoading
          isLoading
          showGif
          position='absolute'
        />
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <FormInfoGeneral 
        dataForm={formInfoValues(dataWhiteLabel)}
        onSubmit={onSaveDataInfoGeneral}
      />
      <br /><br />
      <FormImgGeneral 
        onSavedImg={onSavedImgNavbarFooter}
        is_navbar_logo={dataWhiteLabel?.navbar?.logo_url}
        is_footer_logo={dataWhiteLabel?.footer?.logo_url}
      />
      <BoxLoading
        isLoading={load}
        title={loadSave && load ? 'Guardando información...' : 'Obteniendo información...'}
        position='absolute'
      />
    </div>
  )
}
