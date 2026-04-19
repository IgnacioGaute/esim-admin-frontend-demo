import { useEffect } from 'react';
import { addRolUserAuth, authenticate, notAuthenticate, removeModulesAccesUser, useAppDispatch, useAppSelector } from '../store';
import { authService } from '../services/AuthService';
import { useCache } from './useCache';
import { IUsersType } from '../interfaces/user';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(state => state.auth);
  const { clearCache } = useCache();

  useEffect(() => {
    onCheckoutAuth();
  }, []);

  const onCheckoutAuth = () => {
    const token = authService.getToken() || auth.token;

    if( token ){
      dispatch( authenticate(token) );

      return;
    }
    
    dispatch(notAuthenticate());
  }
  
  
  const onAuthenticate = (token: string, expires_at: Date, rol: keyof IUsersType) => {
    authService.authUser(token, expires_at);
    dispatch( authenticate(token) );
    dispatch( addRolUserAuth(rol) )
  }

  const onNotAuthenticate = () => {
    dispatch(notAuthenticate());
    dispatch(removeModulesAccesUser())
    clearCache();
    authService.onLogout();
  };

  return {
    ...auth,

    //funct
    onAuthenticate,
    onNotAuthenticate
  }
}
