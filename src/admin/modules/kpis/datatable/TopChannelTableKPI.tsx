import { useFetch } from '@/shared/hooks/useFetch';
import { TopListChannelTableKPI } from '@/admin/components/dashboard';
import { ITopChannelKPI } from '@/admin/utils/interfaces/dashboard-kpi.interface';
import { IFilterDateKPI } from '@/shared/components/kpis';

interface Props {
    date: IFilterDateKPI | null;
}

export const TopChannelTableKPI = ({ date }: Props) => {
    const { data, loading } = useFetch<ITopChannelKPI[]>('/reports/top-channels', 'GET',
        { init: true, params: date });

    return (
        <TopListChannelTableKPI
            topListChannel={data || []}
            loading={loading}
        />
    )
}
