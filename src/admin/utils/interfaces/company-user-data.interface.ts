import { IFormCompany } from "@/admin/utils/interfaces/company-data.interface";

export type CompanyUserForm = {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  type: "ADMIN" | "SELLER";
  amount?: number | null;
};

export type CompanyFormValues = IFormCompany & {
  amount?: number | null;
  users: CompanyUserForm[];
};
