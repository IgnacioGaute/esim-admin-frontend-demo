import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { RouteWithTitle } from '@/shared/components/RouteWithTitle';
import { StoreLayout } from '../layout';
import { CheckoutPage, PlansPage } from '../pages';
import { useUserAccess } from '@/shared';


export const StoreRoutes = () => {
  const { access: { store }, GuardModuleAccess} = useUserAccess(false);
  const { pathname } = useLocation();

  if( store.length == 0 ){
    return <Navigate to={`/redirect?path=${pathname}`}  />
  }

  return (
    <Routes>
      <Route 
        element={
          <GuardModuleAccess variant='store'>
            <StoreLayout><Outlet /></StoreLayout>
          </GuardModuleAccess>
        } 
      >
        <Route 
          index
          element={<RouteWithTitle title="Tienda | Planes" element={<PlansPage />} />}
        />
        <Route 
          path="checkout"
          element={<RouteWithTitle title="Tienda | Checkout" element={<CheckoutPage />} />}
        />
      </Route>
    </Routes>
  )
}
