import { ReactNode, useMemo, useEffect, memo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Box } from "@mui/material"
import { useSelector } from "react-redux"

import {
  DrawerPrimary,
  ToolBarPrimary,
  DrawerHeaderPrimary,
  DrawerPrimaryWidth,
  MainByDrawer,
  BoxLoading,
  DrawerPrimaryCollapsedWidth,
} from "@/shared/components"

import { USER_TYPE_CONST } from "@/shared/helpers/const/UserTypeConst"
import { useAuth, useScreenSize } from "@/shared/hooks"
import { IUsersType } from "@/shared/interfaces/user"
import type { RootState } from "@/shared/store/store"
import { CompanyIncompleteDialog } from "../components/popup/CompanyIncompleteDialog"

interface Props {
  children: ReactNode
  routesDrawer: IRouteDrawer[]
}

export interface IRouteDrawer {
  url: string
  name: string
  subtitle?: string
  tooltip?: string
  key: string
  startIcon?: React.ReactNode
  children?: IRouteDrawer[]
}

export const AdminLayout = memo(({ children, routesDrawer }: Props) => {
  const DRAWER_STATE_KEY = "admin-drawer-open"

  const [openDrawer, setOpenDrawer] = useState(() => {
    const saved = sessionStorage.getItem(DRAWER_STATE_KEY)
    if (saved === "open") return true
    if (saved === "closed") return false
    return true
  })
  const [openCompanyIncomplete, setOpenCompanyIncomplete] = useState(false)
  const [routeLoading, setRouteLoading] = useState(false)

  const { onNotAuthenticate } = useAuth()
  const { width } = useScreenSize()
  const location = useLocation()
  const navigate = useNavigate()

  const authMe = useSelector((s: RootState) => s.auth.me)
  const loadingMe = useSelector((s: RootState) => s.auth.loadingMe)

  const companyId = authMe?.companyId ?? authMe?.company?.id ?? null
  const userType = (authMe?.type as keyof IUsersType) || "SUPER_ADMIN"

  const isDesktop = width > 991
  const isMobileDrawer = width <= 991
  const isCollapsedDesktop = isDesktop && !openDrawer

  const handleDrawerOpen = () => {
    setOpenDrawer(true)
    sessionStorage.setItem(DRAWER_STATE_KEY, "open")
  }

  const handleDrawerClose = () => {
    setOpenDrawer(false)
    sessionStorage.setItem(DRAWER_STATE_KEY, "closed")
  }

  const drawerWidth = isMobileDrawer
    ? 0
    : openDrawer
      ? DrawerPrimaryWidth
      : DrawerPrimaryCollapsedWidth

  const { route, name, subtitle } = useMemo(() => {
    const arrPathName = location.pathname.split("/")

    if (arrPathName.includes("my-account")) {
      return { route: "", name: "Mi Cuenta", subtitle: "" }
    }

    let url = routesDrawer[0]?.url ?? ""
    let title = routesDrawer[0]?.name ?? ""
    let sub = routesDrawer[0]?.subtitle ?? ""

    for (const item of routesDrawer) {
      if (item.children?.length) {
        const childFound = item.children.find((child) =>
          arrPathName.includes(child.key)
        )

        if (childFound) {
          return {
            route: childFound.url,
            name: childFound.name,
            subtitle: childFound.subtitle ?? "",
          }
        }
      }

      if (arrPathName.includes(item.key)) {
        return {
          route: item.url,
          name: item.name,
          subtitle: item.subtitle ?? "",
        }
      }
    }

    return { route: url, name: title, subtitle: sub }
  }, [location.pathname, routesDrawer])

    useEffect(() => {
      if (isMobileDrawer) {
        setOpenDrawer(false)
        return
      }

      const isMyAccount = location.pathname.includes("/admin/my-account")

      if (isMyAccount) {
        setOpenDrawer(false)
      }
    }, [width, isMobileDrawer, location.pathname])

  useEffect(() => {
    if (isMobileDrawer) {
      setOpenDrawer(false)
      return
    }

    const saved = sessionStorage.getItem(DRAWER_STATE_KEY)
    if (saved === "closed") {
      setOpenDrawer(false)
    } else {
      setOpenDrawer(true)
    }
  }, [isMobileDrawer])

  useEffect(() => {
    setRouteLoading(true)
    const t = setTimeout(() => setRouteLoading(false), 220)
    return () => clearTimeout(t)
  }, [location.pathname])

  const COMPANY_DIALOG_KEY = "company-incomplete-dialog-shown"

  useEffect(() => {
    if (loadingMe) return
    if (!authMe) return
    if (authMe.type !== "ADMIN") return

    if (authMe.companyProfileIncomplete === false) {
      sessionStorage.removeItem(COMPANY_DIALOG_KEY)
      return
    }

    const isOnCompanyPage =
      location.pathname === "/admin/companies" ||
      location.pathname.startsWith("/admin/companies/edit/")

    if (isOnCompanyPage) return

    const dismissed = sessionStorage.getItem(COMPANY_DIALOG_KEY) === "1"
    if (dismissed) return

    if (companyId !== null && authMe.companyProfileIncomplete === true) {
      setOpenCompanyIncomplete(true)
    }
  }, [loadingMe, authMe, location.pathname])

  useEffect(() => {
  const isMyAccount = location.pathname.includes("/admin/my-account")

  if (!isMobileDrawer && isMyAccount) {
    setOpenDrawer(false)
    sessionStorage.setItem(DRAWER_STATE_KEY, "closed")
  }
}, [location.pathname, isMobileDrawer])

  const handleCloseIncomplete = () => {
    setOpenCompanyIncomplete(false)
    sessionStorage.setItem(COMPANY_DIALOG_KEY, "1")
  }

  const handleGoToCompany = () => {
    setOpenCompanyIncomplete(false)
    sessionStorage.setItem(COMPANY_DIALOG_KEY, "1")

    if (companyId) {
      navigate(`/admin/companies/edit/${companyId}`)
      return
    }

    navigate("/admin/companies")
  }

  const contentLoading = (loadingMe && !authMe) || routeLoading

  return (
    <Box sx={{ display: "flex", position: "relative", overflowX: "hidden" }}>
      <ToolBarPrimary
        openDrawer={openDrawer}
        collapsedDrawer={isCollapsedDesktop}
        drawerWidth={drawerWidth}
        handleDrawerOpen={handleDrawerOpen}
        onLogOut={onNotAuthenticate}
        title={name}
        subtitle={subtitle}
        user={{
          loading: !authMe && loadingMe,
          name: authMe?.name,
          rol: USER_TYPE_CONST[userType],
          avatar: authMe?.photoUrl ?? undefined,
          userType: userType,
        }}
      />

<DrawerPrimary
  drawerWidth={drawerWidth}
  open={width <= 991 ? openDrawer : true}
  collapsed={isDesktop && !openDrawer}
  handleDrawerOpen={handleDrawerOpen}
  handleDrawerClose={handleDrawerClose}
  onLogOut={onNotAuthenticate}
  routesNav={routesDrawer}
  routeActive={route}
  isPersistent={width <= 991 ? false : true}
  isMobile={width <= 580}
/>
<MainByDrawer
  open={isDesktop ? true : openDrawer}
  DrawerPrimaryWidth={drawerWidth}
  enabledDrawer={width <= 991}
  sx={{
    minHeight: "calc(100vh - 65px)",
    position: "relative",
    overflowX: "hidden",
  }}
>
        <DrawerHeaderPrimary />
        {children}

        <BoxLoading
          isLoading={contentLoading}
          positionContainer="absolute"
          title=""
          isTransparent={true}
          showGif={false}
        />
      </MainByDrawer>

      {authMe?.type === "ADMIN" && (
        <CompanyIncompleteDialog
          open={openCompanyIncomplete}
          onClose={handleCloseIncomplete}
          onGoToCompany={handleGoToCompany}
        />
      )}
    </Box>
  )
})
