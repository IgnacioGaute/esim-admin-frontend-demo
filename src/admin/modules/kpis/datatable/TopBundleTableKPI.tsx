import { useMemo } from 'react';
import { useFetch } from '@/shared/hooks/useFetch';
import { TopListBundleTableKPI, TypeDataBundleList } from '@/admin/components/dashboard';
import { ITopBundleKPI } from '@/admin/utils/interfaces/dashboard-kpi.interface';
import { Country, getCountryByIso } from '@/shared/helpers';
import { IFilterDateKPI } from '@/shared/components/kpis';

interface Props {
    date: IFilterDateKPI | null;
}

export const TopBundleTableKPI = ({ date }: Props) => {
    const { data, loading } = useFetch<ITopBundleKPI[]>('/reports/top-bundles', 'GET', 
        { init: true, params: date });

    const bundles : TypeDataBundleList[] = useMemo(() => {
        if( data ){
            let newBundles: TypeDataBundleList[] = [];

            data.forEach(item => {
                const arrString = item.esimProviderBundleName.split('_');
                let country : Country | undefined; 

                arrString.forEach(value => {
                    const result = getCountryByIso(value);

                    if( result ) {
                        country = result;
                    }
                });

                newBundles.push({
                    ...item,
                    iso: country?.iso,
                    country: country?.name
                });
            })

            return newBundles;
        }

        return [];
    }, [data])

    return (
        <TopListBundleTableKPI
            topListBundle={bundles}
            loading={loading}
        />
    )
}
