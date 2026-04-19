import RequestQuoteOutlined  from '@mui/icons-material/RequestQuoteOutlined';
import { useFetch } from '@/shared/hooks/useFetch';
import { OverviewKPI, IFilterDateKPI } from '@/shared/components/kpis';
import { ITotalOrderOverview} from '@/admin/utils/interfaces/dashboard-kpi.interface';

interface Props {
    date: IFilterDateKPI | null;
}


export const TotalOrdersOverview = ({ date }:Props) => {
    const { data, loading } = useFetch<ITotalOrderOverview>('/reports/overview/orders', 'GET', 
        { init: true, params: date });

        console.log(data)

    return (
        <OverviewKPI 
            value={data?.length || '0'}
            overview='Total ordenes'
            loading={loading}
            icon={<RequestQuoteOutlined fontSize='medium' color='inherit' />}
            stylesIconBox={{
                backgroundColor: '#1C3680',
                color: '#fff'
            }}
        />
    )
}
