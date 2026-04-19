import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { PublicRoutes } from '@/public/routes/PublicRoutes';
import { AdminRoutes } from '@/admin/routes/AdminRoutes';
import { StoreRoutes } from '@/store/routes/StoreRoutes';


import { GuardPublic } from './GuardPublic';
import { GuardPrivate } from './GuardPrivate';

import { useAuth } from '@/shared/hooks/useAuth';
import { BoxLoading } from '@/shared/components/BoxLoading';
import { RedirectRoute } from './RedirectRoute';



export const AppRouter = () => {
  const { status } = useAuth();

  if( status == 'checking' ) {
    return <BoxLoading 
      isLoading
      isTransparent
      position='fixed'
    />
  }

  return (
    <Routes>
      <Route index element={<Navigate to="redirect" replace />} />

      {/* Routes Public */}
        {/* protecd public */}
        <Route element={<GuardPublic isAuth={status === 'authenticated'} ><Outlet /></GuardPublic>}>
          <Route
            path='/*'
            element={<PublicRoutes />}
          />
        </Route>

      {/* Routes Private */}
      <Route
        element={<GuardPrivate isAuth={status === 'authenticated'} ><Outlet /></GuardPrivate>}
      >
        <Route 
          path='redirect'
          element={<RedirectRoute />}
        />
        <Route
          path='/admin/*'
          element={<AdminRoutes />}
        />
        <Route
          path='/store/*'
          element={<StoreRoutes />}
        />
      </Route>
    </Routes>
  )
}
