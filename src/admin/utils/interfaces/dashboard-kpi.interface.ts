export interface ITopBundleKPI{
    esimProviderBundleName: string;
    count:                  number;
}

export interface ITopChannelKPI{
    channel:        "APP" | "WEB" | "RESELLER",
    initialized:    number;
    completed:      number;
}

export interface Company {
    id:        string;
    name:      string;
    createdAt: Date;
    updatedAt: Date;
}

interface IOverviewGeneral{
    length?: number;
    rows?: number;
}

export interface ITotalClientOverview extends IOverviewGeneral{}
export interface ITotalCompanyOverview extends IOverviewGeneral{}
export interface ITotalOrderOverview extends IOverviewGeneral{}
export interface ITotalEsimOverview extends IOverviewGeneral{}

export interface ITopDestinationKPI {
    country: string;
    iso?: string;
    count: number;
}

export interface ITopDestinationBundleKPI {
    esimProviderBundleName: string;
    count: number;
}

export interface IEsimDetailKPI {
    id: string;
    iccid?: string;
    status?: string;
    esimProviderBundleName?: string;
    createdAt?: string;
}

export interface ITopCompanyKPI {
  companyId?: string;
  companyName: string;
  completeOrderByReseller: number;
}

export interface ITopResellerKPI {
  id: string;
  name: string;
  completedOrdersCount: number;
  userType?: string;
  company?: {
    id: string;
    name: string;
  } | null;
  nameCompany?: string;
}

export interface ITopUserKPI {
  id: string;
  name: string;
  surname: string;
  email: string;
  completedOrdersCount: number;
}