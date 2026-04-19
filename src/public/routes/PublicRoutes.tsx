import { Outlet, Route, Routes } from "react-router-dom";
import { RouteWithTitle } from "@/shared/components/RouteWithTitle";
import { ForgotPasswordPage, LoginPage, RegisterPage } from "../pages";
import { PrimaryLayout } from "../layout";


export const PublicRoutes = () => {
  return (
    <Routes>
      <Route element={<PrimaryLayout><Outlet /></PrimaryLayout>}>
        <Route
          path="sign-in"
          element={<RouteWithTitle title="Iniciar Sesión" element={<LoginPage />} />}
        />
      </Route>
      <Route element={<PrimaryLayout type='secondary' ><Outlet /></PrimaryLayout>}>
        <Route 
          path='sign-up'
          element={<RouteWithTitle title="Crear Cuenta" element={<RegisterPage />} />}
        />
      </Route>
      <Route element={<PrimaryLayout type='secondary' ><Outlet /></PrimaryLayout>}>
        <Route 
          path='forgot-password'
          element={<RouteWithTitle title="Restablecer Contraseña" element={<ForgotPasswordPage />} />}
        />
      </Route>
    </Routes>
  )
}
