import { useState, useEffect } from 'react';
import { BoxLoading } from '@/shared/components/BoxLoading';
import { useWhiteLabelFetch } from '@/admin/hooks/useWhiteLabelFetch';
import { FormInfoHome, FormSectionHome } from '@/admin/components/white-label'
import { IDataFormInfoHome, IDataFormSectionHome, IResellerWhitelabelHomeSection } from '@/admin/utils/interfaces/whitelabel-data.interface';

export const WLHomePage = () => {
    const [loading, setLoading] = useState(true);
    const [loadSave, setLoadSave] = useState(false)
    const { dataWhiteLabel, onSaveWhiteLabel, loading: load, onSaveLogoNavbarFooter, onSaveUploadImage } = useWhiteLabelFetch();

    useEffect(() => {
        if( dataWhiteLabel && !load ){
            setLoading(false)
        }

    }, [dataWhiteLabel, load]);

    const onSaveDataInfoHome = async(data: IDataFormInfoHome) => {
        setLoadSave(true)
        const { main_heading, main_description, main_get_esim } = data;
        
        const home_heading_section = dataWhiteLabel?.home_heading_section;
    
        await onSaveWhiteLabel({
          home_heading_section: {
            ...home_heading_section,
            main_heading,
            main_description,
            main_get_esim
          }
        })
    
        setLoadSave(false)
    }

    const onSaveImgBackground = async(file: File) => {
        setLoadSave(true)
        const formData = new FormData();
    
        formData.append('is_company_background_image', 'true')
    
        formData.append('file', file);
        await onSaveLogoNavbarFooter(formData);
        setLoadSave(false)
    }

    const onSaveSectionHome = async(item: IDataFormSectionHome, idx: number) => {
        setLoadSave(true);
        const { image_url, image, heading, description } = item;
        let urlImage = image_url || '';

        if( image ){
            const respSaveUpload = await onSaveUploadImage(image);

            if( respSaveUpload ) urlImage = respSaveUpload; else  setLoadSave(false)
        }

        let dataSaved: IResellerWhitelabelHomeSection[] = [{
            heading,
            description,
            image_url: urlImage
        }];

        if( dataWhiteLabel?.home_sections && dataWhiteLabel.home_sections.length > 0 ){
            let auxDataOld: IResellerWhitelabelHomeSection[] = [];
            let isIdxByIndex = false;

            dataWhiteLabel.home_sections.map((section, index) => {
                let auxSection = section;

                if( index == idx  ){
                    auxSection = {
                        heading,
                        description,
                        image_url: urlImage
                    }
                    isIdxByIndex = true;
                }

                auxDataOld.push(auxSection);
            });

            dataSaved = isIdxByIndex ? auxDataOld : [...auxDataOld, ...dataSaved];
        }

        await onSaveWhiteLabel({
            home_sections: dataSaved
        })
      
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
           <FormInfoHome 
                dataForm={dataWhiteLabel?.home_heading_section  ? dataWhiteLabel.home_heading_section : undefined}
                background_image_url={dataWhiteLabel?.home_heading_section?.background_image_url}
                onSubmit={onSaveDataInfoHome}
                onSavedImg={onSaveImgBackground}
            />
            <br />
            <FormSectionHome 
                dataForm={dataWhiteLabel?.home_sections}
                onSave={onSaveSectionHome}
            />
            <BoxLoading
                isLoading={load}
                title={loadSave && load ? 'Guardando información...' : 'Obteniendo información...'}
                position='absolute'
            />
        </div>
    )
}
