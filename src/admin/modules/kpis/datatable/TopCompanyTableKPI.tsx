import { useFetch } from "@/shared/hooks/useFetch";
import { TopListCompanyTableKPI } from "@/admin/components/dashboard";
import { ITopCompanyKPI } from "@/admin/utils/interfaces/dashboard-kpi.interface";
import { IFilterDateKPI } from "@/shared/components/kpis";

interface Props {
  date: IFilterDateKPI | null;
}

export const TopCompanyTableKPI = ({ date }: Props) => {
  const { data, loading } = useFetch<ITopCompanyKPI[]>(
    "/reports/top-companies",
    "GET",
    { init: true, params: date }
  );

  return (
    <TopListCompanyTableKPI
      topListCompany={data || []}
      loading={loading}
    />
  );
};