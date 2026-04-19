import { IUsersType } from '@/shared/interfaces/user';

export type MeResponse = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: keyof IUsersType;
  companyId?: string | null;
  companyProfileIncomplete?: boolean;
  company?: { id?: string | null } | null;
  photoUrl?: string | null;
};

export interface IAuthState {
  token: string | null;
  rolUser: keyof IUsersType | null;
  status: 'checking' | 'authenticated' | 'not-authenticated';

  // ✅ nuevo
  me: MeResponse | null;
  loadingMe: boolean;
}