import  StoreOutlined from '@mui/icons-material/StoreOutlined';
import { useFetch } from '@/shared/hooks/useFetch';
import { OverviewKPI, IFilterDateKPI } from '@/shared/components/kpis';
import { ITotalCompanyOverview } from '@/admin/utils/interfaces/dashboard-kpi.interface';

interface Props {
    date: IFilterDateKPI | null;
}

export const TotalCompaniesOverview = ({
    date
}: Props) => {
    const { data, loading } = useFetch<ITotalCompanyOverview>('/reports/overview/companies', 'GET', 
        { init: true, params: date });

    return (
        <OverviewKPI 
            value={data?.length || '0'}
            overview='Total empresas'
            loading={loading}
            icon={<StoreOutlined fontSize='medium' color='inherit' />}
            stylesIconBox={{
                backgroundColor: '#FA5A7D',
                color: '#fff'
            }}
        />
    )
}
