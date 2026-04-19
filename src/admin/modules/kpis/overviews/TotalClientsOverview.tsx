
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import { useFetch } from '@/shared/hooks/useFetch';
import { OverviewKPI, IFilterDateKPI } from '@/shared/components/kpis';
import { ITotalClientOverview } from '@/admin/utils/interfaces/dashboard-kpi.interface';


interface Props {
    date: IFilterDateKPI | null;
}

export const TotalClientsOverview = ({
    date
}: Props) => {
    const { data, loading } = useFetch<ITotalClientOverview>('/reports/overview/users', 'GET', 
        { 
            init: true,
            params: date
        }
    );

    return (
        <OverviewKPI 
            overview='Total clientes'
            value={data?.length || '0'}
            loading={loading}
            icon={<GroupOutlined fontSize='medium' color='inherit' />}
            stylesIconBox={{
                backgroundColor: '#6671E2',
                color: '#fff'
            }}
        />
    )
}
