import type { AppThunk } from '@/shared/store/store';
import { fetchApiHelper } from '@/shared/helpers';
import { setLoadingMe, setMe } from './authSlice';

export const refreshMe = (): AppThunk => async (dispatch) => {
  dispatch(setLoadingMe(true));
  const resp = await fetchApiHelper<any>('users/me', 'GET');
  dispatch(setMe(resp.ok ? resp.data : null));
  dispatch(setLoadingMe(false));
};