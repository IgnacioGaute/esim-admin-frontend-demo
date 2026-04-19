import { ReactNode } from 'react';
import { RedirectRoute } from './RedirectRoute';

export const GuardPublic = ({
    isAuth,
    children
}: { isAuth: boolean, children: ReactNode }) => {

    if( isAuth ){
        return <RedirectRoute />
    }
    
    return children;
}
