import { useMemo } from "react"
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom"
import {
  DataUsageOutlined,
  DiscountOutlined,
  GroupOutlined,
  AnalyticsOutlined,
  ShowChartOutlined,
  StoreOutlined,
  FactCheckOutlined,
  ComputerOutlined,
  RuleOutlined,
  CorporateFareOutlined,
  Inventory2Outlined,
  PhoneAndroid,
  Wallet,
  SendAndArchive,
  Payment,
  PublicOutlined,
} from "@mui/icons-material"
import { SimCardOutlined } from "@mui/icons-material"
import { RouteWithTitle } from "@/shared/components/RouteWithTitle"
import { useUserAccess } from "@/shared/hooks/useUserAccess"
import { AdminLayout, IRouteDrawer } from "../layout"
import {
  BundleNewPage,
  BundlePage,
  CompanyEditPage,
  CompanyNewPage,
  CompanyPage,
  CouponAndDiscountPage,
  CouponDiscountEditPage,
  CouponDiscountNewPage,
  DashboardPage,
  LayoutMarketingPage,
  LayoutWhiteLabelPage,
  NotificationPushNewPage,
  NotificationPushPage,
  OrderPage,
  ReferralEditPage,
  ReferralNewPage,
  ReferralPage,
  RuleUserEditPage,
  RuleUserNewPage,
  RuleUserPage,
  TransactionPage,
  UserEditPage,
  UserNewPage,
  UserPage,
  WLGeneralPage,
  WLHomePage,
  WLPrivacyPolicyPage,
  WLTermsConditionsPage,
  EsimInventoryPage,
  EsimDevicesPage,
} from "../pages"
import { MyAccountPage } from "../pages/my-account/MyAccountPage"
import { EsimDeviceNewPage } from "../pages/esim-devices/EsimDeviceNewPage"
import { EsimDeviceEditPage } from "../pages/esim-devices/EsimDeviceEditPage"

import { BoxLoading, useFetch } from "@/shared"
import { IUserData } from "../utils"
import { CompanyBalancePage } from "../pages/credits-company/CompanyBalancePage"
import { UserBalancePage } from "../pages/credits-users/UserBalancePage"
import { PartnerPage } from "../pages/partners/PartnerPage"
import { CountriesPage } from "../pages/countries/CountriesPage"
import CompanyTopupPage from "../pages/credits-company/CompanyTopupPage"
import CompanyTopupPaymentPage from "../pages/credits-company/CompanyTopupPaymentPage"
import PaymentsPage from "../pages/credits-company/PaymentsPage"

export const AdminRoutes = () => {
  const {
    access: { admin },
    GuardModuleAccess,
    isLoadingAccess,
  } = useUserAccess(true)

  const { pathname, search } = useLocation()

  const { data: meDetail, loading: loadingMe } = useFetch<IUserData & { amount?: number }>("users/me", "GET", {
    init: true,
    cache: { enabled: false },
  })

  const normalizeRole = (t?: string) => {
    if (t === "USER") return "SELLER"
    if (t === "CORPORATE") return "ADMIN"
    return t as any
  }

  const currentRole = normalizeRole(meDetail?.type)
  const isSuperAdmin = currentRole === "SUPER_ADMIN"
  const isAdmin = currentRole === "ADMIN"
  const isSeller = currentRole === "SELLER"

  const canManageCompanies = isSuperAdmin || isAdmin
  const canViewCompaniesIndex = isSuperAdmin || isAdmin || isSeller

  const myCompanyId =
    (meDetail as any)?.companyId ||
    (meDetail as any)?.empresa?.id ||
    (meDetail as any)?.company?.id ||
    ""

  const transactionsUrl = isSuperAdmin ? "/admin/transactions" : "/admin/transactions?mine=1"
  const ordersUrl = isSuperAdmin ? "/admin/orders" : "/admin/orders?mine=1"

  const itemsMenuAvailable: IRouteDrawer[] = useMemo(() => {
    const menuAvailable: IRouteDrawer[] = []
    const hasModule = (moduleKey: string) => admin.some((item) => item.module === moduleKey)

    routesDrawer.forEach((route) => {
      if (route.key === "companies-group") {
        const children: IRouteDrawer[] = []

        if (hasModule("companies")) {
          if (!isSuperAdmin) {
            const url = myCompanyId ? `/admin/companies?companyId=${myCompanyId}` : "/admin/companies"

            children.push({
              ...(route.children?.find((c) => c.key === "companies") as IRouteDrawer),
              name: "Mi empresa",
              subtitle: "Configuración de mi empresa",
              tooltip: "Ver la información de mi empresa",
              url,
            })
          } else {
            children.push(route.children?.find((c) => c.key === "companies") as IRouteDrawer)
          }
        }

        if (hasModule("credits-company") && isSuperAdmin) {
          children.push(route.children?.find((c) => c.key === "credits-company") as IRouteDrawer)
        }

        if (hasModule("partners")) {
          children.push(route.children?.find((c) => c.key === "partners") as IRouteDrawer)
        }

        if (hasModule("company-topup")) {
          children.push(route.children?.find((c) => c.key === "company-topup") as IRouteDrawer)
        }

        if (hasModule("payment-companies")) {
          children.push(route.children?.find((c) => c.key === "payment-companies") as IRouteDrawer)
        }

        if (children.length > 0) {
          menuAvailable.push({
            ...route,
            children,
          })
        }

        return
      }

      if (route.key === "users-group") {
        const children: IRouteDrawer[] = []

        if (hasModule("users")) {
          children.push(route.children?.find((c) => c.key === "users") as IRouteDrawer)
        }

        if (hasModule("credits-users") && (isSuperAdmin || isAdmin)) {
          children.push(route.children?.find((c) => c.key === "credits-users") as IRouteDrawer)
        }

        if (children.length > 0) {
          menuAvailable.push({
            ...route,
            children,
          })
        }

        return
      }

      if (route.key === "countries") {
        if (isSuperAdmin) menuAvailable.push(route)
        return
      }

      const routeBase = admin.find((item) => item.module === route.key)
      if (!routeBase) return

      if (route.key === "transactions" && !isSuperAdmin) {
        menuAvailable.push({
          ...route,
          name: "Mis transacciones",
          subtitle: "Mis pagos y movimientos",
          tooltip: "Ver solo mis transacciones",
          url: transactionsUrl,
        })
        return
      }

      if (route.key === "orders" && !isSuperAdmin) {
        menuAvailable.push({
          ...route,
          name: "Mis órdenes",
          subtitle: "Mis compras y estados",
          tooltip: "Ver solo mis órdenes",
          url: ordersUrl,
        })
        return
      }

      menuAvailable.push(route)
    })

    return menuAvailable
  }, [admin, isSuperAdmin, isAdmin, myCompanyId, transactionsUrl, ordersUrl])

    if (isLoadingAccess || loadingMe || !meDetail) {
    return (
      <BoxLoading
        isLoading
        isTransparent
        positionContainer="fixed"
        title="Cargando permisos..."
        showGif={false}
      />
    )
  }

  if (admin.length === 0) {
    return <Navigate to={`/redirect?path=${encodeURIComponent(`${pathname}${search}`)}`} replace />
  }

  return (
    <Routes>
      <Route
        element={
          <GuardModuleAccess variant="admin">
            <AdminLayout routesDrawer={itemsMenuAvailable}>
              <Outlet />
            </AdminLayout>
          </GuardModuleAccess>
        }
      >
        <Route path="dashboard" element={<RouteWithTitle title="Control Panel" element={<DashboardPage />} />} />
        <Route path="my-account" element={<RouteWithTitle title="Mi cuenta" element={<MyAccountPage />} />} />

        <Route path="bundles">
          <Route index element={<RouteWithTitle title="Bundles" element={<BundlePage />} />} />
          <Route path="new" element={<RouteWithTitle title="Nuevo Bundle" element={<BundleNewPage />} />} />
        </Route>

        <Route path="coupons">
          <Route index element={<RouteWithTitle title="Cupones y Descuentos" element={<CouponAndDiscountPage />} />} />
          <Route path="new" element={<RouteWithTitle title="Nuevo cupon y descuento" element={<CouponDiscountNewPage />} />} />
          <Route path="edit/:couponId" element={<RouteWithTitle title="Editar cupon y descuento" element={<CouponDiscountEditPage />} />} />
        </Route>

        <Route path="orders">
          <Route
            index
            element={
              <RouteWithTitle
                title={isSuperAdmin ? "Órdenes" : "Mis órdenes"}
                element={<OrderPage />}
              />
            }
          />
        </Route>

        <Route path="esim-inventory">
          <Route index element={<RouteWithTitle title="Inventario eSIMs" element={<EsimInventoryPage />} />} />
        </Route>

        <Route
          path="credits-company"
          element={
            <RouteWithTitle
              title="Balances por empresa"
              element={isSuperAdmin ? <CompanyBalancePage /> : <Navigate to="/admin/dashboard" replace />}
            />
          }
        />

        <Route
          path="credits-users"
          element={
            <RouteWithTitle
              title="Balances por usuario"
              element={isSuperAdmin || isAdmin ? <UserBalancePage /> : <Navigate to="/admin/dashboard" replace />}
            />
          }
        />

        <Route path="companies">
          <Route
            index
            element={
              canViewCompaniesIndex ? (
                <RouteWithTitle title={isSuperAdmin ? "Empresas" : "Mi empresa"} element={<CompanyPage />} />
              ) : (
                <Navigate to="/admin/dashboard" replace />
              )
            }
          />
          <Route
            path="new"
            element={
              canManageCompanies ? (
                <RouteWithTitle title="Nueva Empresa" element={<CompanyNewPage />} />
              ) : (
                <Navigate to="/admin/companies" replace />
              )
            }
          />
          <Route
            path="edit/:companyId"
            element={
              canManageCompanies ? (
                <RouteWithTitle title={isSuperAdmin ? "Editar Empresa" : "Mi empresa"} element={<CompanyEditPage />} />
              ) : (
                <Navigate to="/admin/companies" replace />
              )
            }
          />
        </Route>

        <Route path="users">
          <Route index element={<RouteWithTitle title="Usuarios" element={<UserPage />} />} />
          <Route path="new" element={<RouteWithTitle title="Nuevo Usuario" element={<UserNewPage />} />} />
          <Route path="edit/:userId" element={<RouteWithTitle title="Editar Usuario" element={<UserEditPage />} />} />
          <Route path="credits-users" element={<Navigate to="/admin/credits-users" replace />} />

          <Route path="rules">
            <Route index element={<RouteWithTitle title="Reglas de usuario" element={<RuleUserPage />} />} />
            <Route path="new" element={<RouteWithTitle title="Nueva Regla" element={<RuleUserNewPage />} />} />
            <Route path="edit/:ruleId" element={<RouteWithTitle title="Editar Regla" element={<RuleUserEditPage />} />} />
          </Route>

          <Route path="referral">
            <Route index element={<RouteWithTitle title="código de referido" element={<ReferralPage />} />} />
            <Route path="new" element={<RouteWithTitle title="Nuevo código de referido" element={<ReferralNewPage />} />} />
            <Route path="edit/:referralId" element={<RouteWithTitle title="Editar código de referido" element={<ReferralEditPage />} />} />
          </Route>
        </Route>

        <Route path="transactions">
          <Route
            index
            element={
              <RouteWithTitle
                title={isSuperAdmin ? "Transacciones" : "Mis Transacciones"}
                element={<TransactionPage />}
              />
            }
          />
        </Route>

        {/* <Route path="marketing" element={<LayoutMarketingPage><Outlet /></LayoutMarketingPage>}>
          <Route index element={<RouteWithTitle title="Marketing | Notificaciones Push" element={<NotificationPushPage />} />} />
          <Route path="notification-push/new" element={<RouteWithTitle title="Marketing | Notificaciones Push | Crear" element={<NotificationPushNewPage />} />} />
        </Route> */}

        <Route path="white-label" element={<LayoutWhiteLabelPage><Outlet /></LayoutWhiteLabelPage>}>
          <Route index element={<RouteWithTitle title="White Label | General" element={<WLGeneralPage />} />} />
          <Route path="home" element={<RouteWithTitle title="White Label | Home" element={<WLHomePage />} />} />
          <Route path="terms-conditions" element={<RouteWithTitle title="White Label | Términos y condiciones" element={<WLTermsConditionsPage />} />} />
          <Route path="privacy-policy" element={<RouteWithTitle title="White Label | Políticas de privacidad" element={<WLPrivacyPolicyPage />} />} />
        </Route>

        <Route path="esim-devices">
          <Route index element={<RouteWithTitle title="Dispositivos compatibles" element={<EsimDevicesPage />} />} />
          <Route path="new" element={<RouteWithTitle title="Nuevo dispositivo" element={<EsimDeviceNewPage />} />} />
          <Route path="edit/:id" element={<RouteWithTitle title="Editar dispositivo" element={<EsimDeviceEditPage />} />} />
        </Route>

        <Route path="partners">
          <Route index element={<RouteWithTitle title="Solicitudes" element={<PartnerPage />} />} />
        </Route>

        <Route
          path="countries"
          element={
            <RouteWithTitle
              title="Países y Regiones"
              element={isSuperAdmin ? <CountriesPage /> : <Navigate to="/admin/dashboard" replace />}
            />
          }
        />

        <Route path="company-topup">
          <Route
            index
            element={
              <RouteWithTitle
                title="Agregar Balance"
                element={<CompanyTopupPage />}
              />
            }
          />
          <Route
            path="payment/:sessionId"
            element={
              <RouteWithTitle
                title="Pago de Recarga"
                element={<CompanyTopupPaymentPage />}
              />
            }
          />
        </Route>

        <Route path="payment-companies">
          <Route index element={<RouteWithTitle title="Pagos Empresas" element={<PaymentsPage />} />} />
        </Route>


        <Route path="rulesre">
          <Route index element={<RouteWithTitle title="Reglas de usuario" element={<RuleUserPage />} />} />
          <Route path="new" element={<RouteWithTitle title="Nueva Regla" element={<RuleUserNewPage />} />} />
          <Route path="edit/:ruleId" element={<RouteWithTitle title="Editar Regla" element={<RuleUserEditPage />} />} />
        </Route>

        <Route path="*" element={<div>No Found</div>} />
      </Route>
    </Routes>
  )
}

const routesDrawer: IRouteDrawer[] = [
  {
    url: "/admin/dashboard",
    name: "Dashboard",
    subtitle: "Resumen general de métricas, ventas y actividad",
    tooltip: "Resumen general de métricas, ventas y actividad del sistema",
    key: "dashboard",
    startIcon: <DataUsageOutlined fontSize="small" />,
  },
  {
    url: "/admin/bundles",
    name: "Paquetes",
    subtitle: "Gestión de planes eSIM disponibles",
    tooltip: "Gestión de planes eSIM disponibles para la venta",
    key: "bundles",
    startIcon: <Inventory2Outlined fontSize="small" />,
  },
  {
    url: "/admin/esim-inventory",
    name: "Inventario eSIMs",
    subtitle: "Stock y disponibilidad",
    tooltip: "Gestioná el inventario de eSIMs",
    key: "esim-inventory",
    startIcon: <SimCardOutlined fontSize="small" />,
  },
  {
    url: "/admin/coupons",
    name: "Cupones",
    subtitle: "Creación y administración de cupones de descuento",
    tooltip: "Crear y administrar cupones de descuento",
    key: "coupons",
    startIcon: <DiscountOutlined fontSize="small" />,
  },
  {
    url: "/admin/orders",
    name: "Órdenes",
    subtitle: "Listado y seguimiento de órdenes",
    tooltip: "Ver y gestionar órdenes de clientes",
    key: "orders",
    startIcon: <AnalyticsOutlined fontSize="small" />,
  },
  {
    url: "/admin/companies",
    name: "Empresas",
    subtitle: "Administración de empresas, balances y solicitudes",
    tooltip: "Administración de empresas, balances y solicitudes",
    key: "companies-group",
    startIcon: <CorporateFareOutlined fontSize="small" />,
    children: [
      {
        url: "/admin/companies",
        name: "Empresas",
        subtitle: "Administración de cuentas corporativas",
        tooltip: "Administración de empresas y cuentas corporativas",
        key: "companies",
        startIcon: <CorporateFareOutlined fontSize="small" />,
      },
      {
        url: "/admin/credits-company",
        name: "Balances empresa",
        subtitle: "Agregar o restar balance a una empresa",
        tooltip: "Ajustar balances por empresa",
        key: "credits-company",
        startIcon: <FactCheckOutlined fontSize="small" />,
      },
      {
        url: "/admin/partners",
        name: "Solicitudes",
        subtitle: "Listado de solicitudes",
        tooltip: "Listado de solicitudes para usar el portal",
        key: "partners",
        startIcon: <SendAndArchive fontSize="small" />,
      },
      {
        url: "/admin/company-topup",
        name: "Agregar balance",
        subtitle: "Agregar balance a tu empresa",
        tooltip: "Agregar balance a tu empresa",
        key: "company-topup",
        startIcon: <Wallet fontSize="small" />,
      },
      {
        url: "/admin/payment-companies",
        name: "Pagos empresas",
        subtitle: "Listado de pagos de empresas",
        tooltip: "Listado de pagos de empresas",
        key: "payment-companies",
        startIcon: <Payment fontSize="small" />,
      },
    ],
  },
  {
    url: "/admin/users",
    name: "Usuarios",
    subtitle: "Gestión de usuarios y balances",
    tooltip: "Gestión de usuarios, roles y balances",
    key: "users-group",
    startIcon: <GroupOutlined fontSize="small" />,
    children: [
      {
        url: "/admin/users",
        name: "Usuarios",
        subtitle: "Gestión de usuarios y roles",
        tooltip: "Gestión de usuarios, roles y permisos",
        key: "users",
        startIcon: <GroupOutlined fontSize="small" />,
      },
      {
        url: "/admin/credits-users",
        name: "Agregar balance",
        subtitle: "Agregar o restar balance a un usuario",
        tooltip: "Ajustar balances por usuario",
        key: "credits-users",
        startIcon: <Wallet fontSize="small" />,
      },
    ],
  },
  {
    url: "/admin/transactions",
    name: "Transacciones",
    subtitle: "Historial de pagos y movimientos",
    tooltip: "Historial de pagos y movimientos financieros",
    key: "transactions",
    startIcon: <FactCheckOutlined fontSize="small" />,
  },
  // {
  //   url: "/admin/marketing",
  //   name: "Marketing",
  //   subtitle: "Gestión de notificaciones, campañas y acciones comerciales",
  //   tooltip: "Notificaciones push, campañas y acciones comerciales",
  //   key: "marketing",
  //   startIcon: <ShowChartOutlined fontSize="small" />,
  // },
  {
    url: "/admin/white-label",
    name: "White Label",
    subtitle: "Branding del reseller",
    tooltip: "Configuración visual y páginas white label",
    key: "white-label",
    startIcon: <ComputerOutlined fontSize="small" />,
  },
  {
    url: "/admin/rulesre",
    name: "Reglas",
    subtitle: "Políticas y control",
    tooltip: "Reglas de usuario y restricciones",
    key: "rulesre",
    startIcon: <RuleOutlined fontSize="small" />,
  },
  {
    url: "/store",
    name: "Tienda",
    subtitle: "Gestión de productos y precios",
    tooltip: "Configuración de productos y precios",
    key: "store",
    startIcon: <StoreOutlined />,
  },
  {
    url: "/admin/countries",
    name: "Planes eSIM",
    subtitle: "Disponibilidad de planes internacionales y regionales",
    tooltip: "Gestión de disponibilidad de planes internacionales y regionales",
    key: "countries",
    startIcon: <PublicOutlined fontSize="small" />,
  },
  {
    url: "/admin/esim-devices",
    name: "Dispositivos compatibles",
    subtitle: "Listado de dispositivos compatibles con eSIM",
    tooltip: "Listado de dispositivos compatibles con eSIM",
    key: "esim-devices",
    startIcon: <PhoneAndroid />,
  },
]