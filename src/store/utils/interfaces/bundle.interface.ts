export interface IDataRespBundle {
    rows:        number;
    pageCount:   number;
    pageSize:    number;
    currentPage: number;
    bundles:     IBundleData[];
}

export interface IBundleData {
    _id:            string;
    name:           string;
    __v:            number;
    autostart:      boolean;
    countries:      ICountry[];
    created_at:     Date;
    dataAmount:     number;
    description:    string;
    duration:       number;
    groups:         string[];
    imageUrl:       string;
    price:          number;
    roamingEnabled: ICountry[];
    speed:          Speed[];
    unlimited:      boolean;
    updated_at:     Date;
}

export interface ICountry {
    name:   string;
    region: Region;
    iso:    string;
}

export enum Region {
    Asia = "Asia",
    Europe = "Europe",
    MiddleEast = "Middle East",
    NorthAmerica = "North America",
    Oceania = "Oceania",
}

export enum Speed {
    The2G = "2G",
    The3G = "3G",
    The4G = "4G",
    The5G = "5G",
}
