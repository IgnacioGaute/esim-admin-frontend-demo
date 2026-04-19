import { useFetch } from "@/shared/hooks/useFetch";
import { ITopUserKPI } from "@/admin/utils/interfaces/dashboard-kpi.interface";
import { IFilterDateKPI } from "@/shared/components/kpis";
import { TopListUserTableKPI } from "@/admin/components/dashboard/datatable-kpi/TopListUsersTableKPI";

interface Props {
  date: IFilterDateKPI | null;
}

export const TopUserTableKPI = ({ date }: Props) => {
  const { data, loading } = useFetch<ITopUserKPI[]>(
    "/reports/top-users",
    "GET",
    { init: true, params: date }
  );

  return (
    <TopListUserTableKPI
      topListUsers={data || []}
      loading={loading}
    />
  );
};