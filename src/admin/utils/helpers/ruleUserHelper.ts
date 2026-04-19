import { getCountryByIso } from '@/shared/helpers/countryHelper';

export const ruleUserHelper = () => {

    const searchIsoByBundleName = (bundleName:string) => {

        if( bundleName.includes('_') ){
            const arrString = bundleName.split('_');

            return arrString.find(name => searchIsoByIso(name));
        }
        
    }

    const searchIsoByIso = (iso: string) => {
        return getCountryByIso(iso)?.iso;
    }

    const getBundle = (value?: string, data?: Array<{name: string; description: string; price: number;}>) => {
        if( data && value){
            return data.find(bundle => bundle.name == value);
        }
    }
    
    return {
        searchIsoByBundleName,
        searchIsoByIso,
        getBundle 
    }
}