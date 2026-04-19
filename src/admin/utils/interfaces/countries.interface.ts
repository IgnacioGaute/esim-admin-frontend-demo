export type TLocationAvailabilityType = "COUNTRY" | "REGION"

export type TRegionApplyMode = "ONLY_REGION" | "ALL_COUNTRIES" | "CUSTOM"

export interface ICountryData {
  type: "COUNTRY"
  code: string
  iso: string
  name: string
  region: string
  enabled: boolean
  unavailableMessage?: string | null
  internalComment?: string | null
  updatedBy?: string | null
  updatedAt?: string | Date | null
  createdAt?: string | Date | null
  inheritedFrom?: TLocationAvailabilityType | null
  inheritedByRegionApplyMode?: TRegionApplyMode | null
}

export interface IRegionData {
  type: "REGION"
  code: string
  name: string
  region: string
  enabled: boolean
  applyMode?: TRegionApplyMode | null
  countryCodes?: string[]
  unavailableMessage?: string | null
  internalComment?: string | null
  updatedBy?: string | null
  updatedAt?: string | Date | null
  createdAt?: string | Date | null
}

export interface ILocationsAdminAllData {
  countries: ICountryData[]
  regions: IRegionData[]
}

export interface IUpdateCountryAvailabilityDto {
  enabled: boolean
  unavailableMessage?: string
  internalComment?: string
  updatedBy?: string
}

export interface IUpdateRegionAvailabilityDto {
  enabled: boolean
  applyMode?: TRegionApplyMode
  customCountryCodes?: string[]
  unavailableMessage?: string
  internalComment?: string
  updatedBy?: string
}