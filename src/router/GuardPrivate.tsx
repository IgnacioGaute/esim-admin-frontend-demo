import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

export const GuardPrivate = ({
    isAuth,
    children
}: { isAuth: boolean, children: ReactNode }) => {
    
    if( !isAuth ){
        return <Navigate to='/sign-in' />
    }
    
    return children;
}
