
import * as data from '@/assets/mooks/countries.json';

export const DATA_COUNTRY = (<{countries:Countries[]}>data).countries;


export const getCountryByIso = (iso:string, language: 'es' | 'en' = 'en') : Country | null => {
    const country = DATA_COUNTRY.find(item => item.cca2 == iso);

    if( country == undefined ) return null;

    const { common, official } : Translation = getValueForSearch(country, lang(language));
    
    return {
        name: common,
        description: official,
        iso
    }
}

const getValueForSearch = (country: Countries, key: KeyTranslation) : Translation =>{
    switch (key) {
        case 'spa':
            return country.translations.spa
        default:
            return {
                common: country.name.common,
                official: country.name.official
            }
    }
}

const lang = (language: 'es' | 'en') : KeyTranslation => {
    switch (language) {
        case 'en':
            return'default';
        default:
            return 'spa';
    }
}



export interface Country{
    name:           string;
    description:    string;
    iso:            string;
} 

export interface Countries {
    name:         Name;
    tld:          string[];
    cca2:         string;
    ccn3:         number;
    cca3:         string;
    cioc:         string;
    independent:  boolean;
    status:       string;
    unMember:     boolean;
    currencies:   Currencies;
    idd:          Idd;
    capital:      string[];
    altSpellings: string[];
    region:       string;
    subregion:    string;
    languages:    Languages;
    translations: Translations;
    latlng:       number[];
    landlocked:   boolean;
    area:         number;
    demonyms:     Demonyms;
    flag:         string;
    maps:         Maps;
    population:   number;
    gini:         Gini;
    fifa:         string;
    car:          Car;
    timezones:    string[];
    continents:   string[];
    flags:        Flags;
    coatOfArms:   CoatOfArms;
    startOfWeek:  string;
    capitalInfo:  CapitalInfo;
    postalCode:   PostalCode;
}

export type KeyTranslation = 'spa' | 'default';
export interface Translations {
    spa: Translation
}

export interface CapitalInfo {
    latlng: number[];
}

export interface Car {
    signs: string[];
    side:  string;
}

export interface CoatOfArms {
    png: string;
    svg: string;
}

export interface Currencies {
    EUR: Eur;
}

export interface Eur {
    name:   string;
    symbol: string;
}

export interface Demonyms {
    eng: Eng;
    fra: Eng;
}

export interface Eng {
    f: string;
    m: string;
}

export interface Flags {
    png: string;
    svg: string;
    alt: string;
}

export interface Gini {
    "2018": number;
}

export interface Idd {
    root:     number;
    suffixes: number[];
}

export interface Languages {
    ell: string;
    tur: string;
}

export interface Maps {
    googleMaps:     string;
    openStreetMaps: string;
}

export interface Name {
    common:     string;
    official:   string;
    nativeName: NativeName;
}

export interface NativeName {
    ell: Translation;
    tur: Translation;
}

export interface Translation {
    official: string;
    common:   string;
}

export interface PostalCode {
    format: string;
    regex:  string;
}