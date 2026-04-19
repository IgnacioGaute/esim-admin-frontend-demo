export type CompanyPaymentType = "PRE_PAYMENT" | "POST_PAYMENT";

export enum SocialPlatform {
  LINKEDIN = "LINKEDIN",
  INSTAGRAM = "INSTAGRAM",
  FACEBOOK = "FACEBOOK",
  X = "X",
  YOUTUBE = "YOUTUBE",
  OTHER = "OTHER",
}

type SocialLink = {
  platform: SocialPlatform;
  url: string;
};

export interface ICompanyData {
  id: string;
  name: string;
  rut: number | null;
  address: string | null;
  city: string | null;
  country: string | null;
  commercialTour: string | null;
  paymentType: CompanyPaymentType | null;
  website: string | null;
  photoUrl: string | null;
  socialMedia: SocialLink[] | null;
  created_at: Date;
  updated_at: Date;
}

export interface IFormCompany extends Omit<ICompanyData, "id" | "created_at" | "updated_at"> {}
