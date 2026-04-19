export interface IBundleModule {
    rows:        number;
    pageCount:   number;
    pageSize:    number;
    currentPage: number;
    bundles:     BundleModule[];
    length:      number;
}

export interface BundleMccMnc {
    group: string;
    mcc: string;
    mnc: string;
    country: string;
    network: string;
}

export interface BundleModule {
    _id:            string;
    name:           string;
    __v:            number;
    autostart:      boolean;
    countries:      Country[];
    created_at:     Date;
    dataAmount:     number;
    description:    string;
    duration:       number;
    imageUrl:       string;
    price:          number;
    provider:       Provider;
    roamingEnabled: Country[];
    speed:          Speed[] | null;
    unlimited:      boolean;
    updated_at:     Date;
    choiceId?:      string | null
}

export interface Country {
    name:   string;
    region: string;
    iso:    string;
}

export enum Provider {
    Choice = "CHOICE",
    Esimgo = "ESIMGO",
}

export enum Speed {
    The2G = "2G",
    The3G = "3G",
    The4G = "4G",
    The5G = "5G",
}


export interface IBundleFormDataModule{
    name: string;
    description: string;
    iso: string;
    dataAmount: number;
    duration: number;
    price?: number;
    serving_mcc_mnc: string[];
    choicePoolId: string;
}

export interface IBundleFormData{
    name: string;
    description: string;
    dataAmount: number;
    duration: number;
    price: number;
    serving_networks: IServingMccMnc[]
    countries: Country[];
    choicePoolId: string;
}

export interface IServingMccMnc{
    serving_mcc_mnc: string;
}

export interface IListCountryRate{
    name:  string;
    iso:  string;
    region: string;
    rate: number;
    network: string;
    mcc: string;
    mnc: string;
}
  
