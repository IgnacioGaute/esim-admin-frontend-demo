import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/shared/store/store';
import { setLoadingMe, setMe } from '@/shared/store';
import { fetchApiHelper } from '@/shared/helpers';

export const useBootstrapMe = () => {
  const dispatch = useDispatch<AppDispatch>();
  const status = useSelector((s: RootState) => s.auth.status);

  const ranRef = useRef(false);

  useEffect(() => {
    // si no está autenticado, reseteamos
    if (status !== 'authenticated') {
      ranRef.current = false;
      dispatch(setMe(null));
      dispatch(setLoadingMe(false));
      return;
    }

    // ya corrimos para esta sesión authenticated
    if (ranRef.current) return;
    ranRef.current = true;

    const run = async () => {
      dispatch(setLoadingMe(true));
      const resp = await fetchApiHelper<any>('users/me', 'GET');
      dispatch(setMe(resp.ok ? resp.data : null));
      dispatch(setLoadingMe(false));
    };

    run();
  }, [status, dispatch]);
};