export interface ICountryData {
    name:        string;
    description: string;
    iso:         string;
    region:      string;
    currency:    string[];
    flag:        string;
}

export interface IParamCountry{
    default?:   boolean;
    search?:    string;
    continent?: string;
    lenguage?:  string;
}