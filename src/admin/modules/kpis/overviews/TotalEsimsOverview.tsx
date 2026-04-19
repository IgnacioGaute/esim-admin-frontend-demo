import InventoryOutlined from '@mui/icons-material/InventoryOutlined';
import { useFetch } from '@/shared/hooks/useFetch';
import { OverviewKPI, IFilterDateKPI } from '@/shared/components/kpis';
import { ITotalEsimOverview } from '@/admin/utils/interfaces/dashboard-kpi.interface';

interface Props {
    date: IFilterDateKPI | null;
}

export const TotalEsimsOverview = ({ date }: Props) => {
    const { data, loading } = useFetch<ITotalEsimOverview>('/reports/overview/esims', 'GET', 
        { init: true, params: date });

    return (
        <OverviewKPI 
            value={data?.rows || '0'}
            overview='Total ESIMs'
            loading={loading}
            icon={<InventoryOutlined fontSize='medium' color='inherit' />}
            stylesIconBox={{
                backgroundColor: '#26abe2',
                color: '#fff'
            }}
        />
    )
}
