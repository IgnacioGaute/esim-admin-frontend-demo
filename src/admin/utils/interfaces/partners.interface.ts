export enum RequestType {
  OWN_USE = "OWN_USE",
  INFLUENCE = "INFLUENCE",
  TECH_COMPANY = "TECH_COMPANY",
  TRAVEL_AGENCY = "TRAVEL_AGENCY",
  OTHER = "OTHER",
}

export enum BusinessIntention {
  SELL_TO_END_CUSTOMERS = "SELL_TO_END_CUSTOMERS",
  RESELL_TO_AGENCIES = "RESELL_TO_AGENCIES",
  BOTH = "BOTH",
}

export enum SalesScope {
  NATIONAL = "NATIONAL",
  INTERNATIONAL = "INTERNATIONAL",
}

export enum SocialPlatform {
  LINKEDIN = "LINKEDIN",
  INSTAGRAM = "INSTAGRAM",
  FACEBOOK = "FACEBOOK",
  X = "X",
  YOUTUBE = "YOUTUBE",
  OTHER = "OTHER",
}

export type SocialLink = {
  platform: SocialPlatform;
  url: string;
};

export enum Status {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface IPartnerData {
  id: string | null;
  name: string;
  rut: number | null;
  address: string | null;
  city: string | null;
  country: string | null;
  commercialTour: string | null;
  ownerName: string;
  companyPosition: string;
  status: Status;
  comments: string;
  email: string;
  phone: string;
  socialMedia: SocialLink[] | null;
  requestType: RequestType | null;
  businessIntention: BusinessIntention | null;
  salesScope: SalesScope | null;
  willInvestInAds: boolean | null;
  updateBy: string;
  created_at: Date;
  updated_at: Date;
}