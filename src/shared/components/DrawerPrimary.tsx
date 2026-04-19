import { ReactNode, useEffect, useMemo, useState } from "react"
import { styled } from "@mui/material/styles"
import {
  Box,
  Button,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material"
import {
  CloseOutlined,
  ExitToAppOutlined,
  ExpandMore,
  SimCardOutlined,
} from "@mui/icons-material"
import { useLocation, useNavigate } from "react-router-dom"

import LogoNew from "@/assets/images/logo/esim-logo.svg"
import { NavigateLink } from "./NavigateLink"

export const DrawerPrimaryWidth = 250
export const DrawerPrimaryCollapsedWidth = 56

const colors = {
  primary: "#1C3680",
  primaryLight: "#2A4A9E",
  surface: "#FFFFFF",
  textPrimary: "#1A1D26",
  textSecondary: "#5C6370",
  border: "rgba(28, 54, 128, 0.08)",
  hoverBg: "rgba(28, 54, 128, 0.04)",
  activeBg: "rgba(28, 54, 128, 0.08)",
  childBorder: "rgba(28, 54, 128, 0.15)",
}

interface Props {
  drawerWidth?: number
  open: boolean
  collapsed?: boolean
  handleDrawerClose: () => void
  handleDrawerOpen?: () => void
  onLogOut?: () => void
  routesNav: IItemsNavDrawer[]
  routeActive: string
  isPersistent?: boolean
  isMobile?: boolean
}

export interface IItemsNavDrawer {
  url: string
  startIcon?: ReactNode
  name: string
  key: string
  subtitle?: string
  tooltip?: string
  children?: IItemsNavDrawer[]
}

export const DrawerPrimary = ({
  drawerWidth = DrawerPrimaryWidth,
  open,
  collapsed = false,
  handleDrawerClose,
  handleDrawerOpen,
  onLogOut,
  routesNav,
  routeActive,
  isPersistent = true,
  isMobile = false,
}: Props) => {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const navigate = useNavigate()
  const location = useLocation()

  const currentPath = location.pathname

  const initialOpenGroups = useMemo(() => {
    const state: Record<string, boolean> = {}

    routesNav.forEach((item) => {
      if (item.children?.length) {
        const hasActiveChild = item.children.some(
          (child) =>
            routeActive === child.url ||
            currentPath === child.url ||
            currentPath.startsWith(`${child.url}/`)
        )

        state[item.key] = hasActiveChild
      }
    })

    return state
  }, [routesNav, routeActive, currentPath])

  useEffect(() => {
    setOpenGroups((prev) => ({
      ...prev,
      ...initialOpenGroups,
    }))
  }, [initialOpenGroups])

  const toggleGroup = (key: string, forceOpen?: boolean) => {
    setOpenGroups((prev) => ({
      ...prev,
      [key]: forceOpen ?? !prev[key],
    }))
  }

  const handleItemClick = (item: IItemsNavDrawer) => {
    // drawer colapsado + item normal => navegar sin abrir
    if (collapsed && !item.children?.length) {
      navigate(item.url)
      if (isMobile) handleDrawerClose()
      return
    }

    // drawer abierto + item normal => navegar
    if (!item.children?.length) {
      navigate(item.url)
      if (isMobile) handleDrawerClose()
    }
  }

  const handleGroupClick = (item: IItemsNavDrawer) => {
    // drawer colapsado + grupo => abrir drawer y abrir el desplegable
    if (collapsed) {
      handleDrawerOpen?.()
      toggleGroup(item.key, true)
      return
    }

    // drawer abierto => toggle normal
    toggleGroup(item.key)
  }

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: isMobile ? "100%" : drawerWidth,
          boxSizing: "border-box",
          borderRight: `1px solid ${colors.border}`,
          backgroundColor: colors.surface,
          boxShadow: "0 0 40px rgba(28, 54, 128, 0.04)",
          overflowX: "hidden",
          overflowY: "auto",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": {
            display: "none",
            width: 0,
            height: 0,
          },
        },
      }}
      variant={isPersistent ? "persistent" : "temporary"}
      anchor="left"
      open={open}
    >
      <DrawerHeaderPrimary sx={{ px: collapsed ? 1 : 1.5 }}>
        <Box
          display="flex"
          width="100%"
          alignItems="center"
          justifyContent={collapsed ? "center" : "space-between"}
        >
          {collapsed ? (
            <Tooltip title="Abrir menú" placement="right" arrow>
              <IconButton
                onClick={handleDrawerOpen}
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "12px",
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.activeBg,
                  color: colors.primary,
                  "&:hover": {
                    backgroundColor: colors.hoverBg,
                  },
                }}
              >
                <ExpandMore
                  sx={{
                    fontSize: 22,
                    transform: "rotate(-90deg)",
                  }}
                />
              </IconButton>
            </Tooltip>
          ) : (
            <>
              <Box
                height="4rem"
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{ minWidth: 0, flex: 1 }}
              >
                <img
                  src={LogoNew}
                  alt="eSIM Demo Logo"
                  style={{ height: "2.5rem", width: "auto", maxWidth: "100%" }}
                />
              </Box>

              <IconButton
                onClick={handleDrawerClose}
                sx={{
                  color: colors.textSecondary,
                  "&:hover": {
                    backgroundColor: colors.hoverBg,
                    color: colors.primary,
                  },
                }}
              >
                <CloseOutlined fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>
      </DrawerHeaderPrimary>

      <Divider sx={{ borderColor: colors.border }} />

      <Box
        display="flex"
        height="100%"
        width="100%"
        flexDirection="column"
        pt={2}
        sx={{ backgroundColor: colors.surface }}
      >
        {/* ── Nav items (natural height, no flex-grow) ── */}
        <Box px={collapsed ? 1 : 1.5}>
          {!collapsed && (
            <Typography
              sx={{
                fontSize: "0.62rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                color: colors.textSecondary,
                opacity: 0.5,
                px: 1.75,
                mb: 1,
                textTransform: "uppercase",
              }}
            >
              Menú
            </Typography>
          )}

          {routesNav.map((item) => {
            const hasChildren = !!item.children?.length

            if (hasChildren) {
              const isParentActive =
                item.children!.some(
                  (child) =>
                    routeActive === child.url ||
                    currentPath === child.url ||
                    currentPath.startsWith(`${child.url}/`)
                ) || currentPath === item.url

              return (
                <Box key={item.key} mb={0.5}>
                  <NavGroupDrawer
                    title={item.name}
                    subtitle={item.subtitle}
                    tooltip={item.tooltip}
                    startIcon={item.startIcon}
                    isActive={isParentActive}
                    isOpen={!!openGroups[item.key]}
                    onToggle={() => handleGroupClick(item)}
                    collapsed={collapsed}
                  />

                  {!collapsed && (
                    <Collapse in={!!openGroups[item.key]} timeout={200} unmountOnExit>
                      <Box
                        sx={{
                          ml: 2.5,
                          mt: 0.5,
                          mb: 1,
                          pl: 1.5,
                          borderLeft: `2px solid ${colors.childBorder}`,
                        }}
                      >
                        {item.children!.map((child) => {
                          const isChildActive =
                            routeActive === child.url ||
                            currentPath === child.url ||
                            currentPath.startsWith(`${child.url}/`)

                          return (
                            <NavItemDrawer
                              key={child.key}
                              title={child.name}
                              subtitle={child.subtitle}
                              tooltip={child.tooltip}
                              isActive={isChildActive}
                              startIcon={child.startIcon}
                              to={child.url}
                              onPress={() => {
                                navigate(child.url)
                                if (isMobile) handleDrawerClose()
                              }}
                              isChild
                            />
                          )
                        })}
                      </Box>
                    </Collapse>
                  )}
                </Box>
              )
            }

            return (
              <NavItemDrawer
                key={item.key}
                title={item.name}
                subtitle={item.subtitle}
                tooltip={item.tooltip}
                isActive={
                  routeActive === item.url ||
                  currentPath === item.url ||
                  currentPath.startsWith(`${item.url}/`)
                }
                startIcon={item.startIcon}
                to={item.url}
                onPress={() => handleItemClick(item)}
                collapsed={collapsed}
              />
            )
          })}
        </Box>

        {/* ── Decorative spacer ── */}
        {!collapsed ? (
          <Box
            sx={{
              flex: 1,
              mx: 2,
              my: 2,
              borderRadius: "16px",
              overflow: "hidden",
              position: "relative",
              background: `linear-gradient(160deg, ${alpha(colors.primary, 0.07)} 0%, ${alpha(colors.primary, 0.03)} 60%, transparent 100%)`,
              border: `1px solid ${alpha(colors.primary, 0.07)}`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 80,
            }}
          >
            {/* Círculos decorativos */}
            <Box sx={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", border: `1px solid ${alpha(colors.primary, 0.07)}`, bottom: -70, right: -50, pointerEvents: "none" }} />
            <Box sx={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", border: `1px solid ${alpha(colors.primary, 0.06)}`, bottom: -30, right: -10, pointerEvents: "none" }} />
            <Box sx={{ position: "absolute", width: 80, height: 80, borderRadius: "50%", backgroundColor: alpha(colors.primary, 0.04), top: -20, left: -20, pointerEvents: "none" }} />

            <SimCardOutlined sx={{ fontSize: 30, color: alpha(colors.primary, 0.18), mb: 0.75, zIndex: 1 }} />
            <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", color: alpha(colors.primary, 0.25), textTransform: "uppercase", zIndex: 1 }}>
              eSIM Platform
            </Typography>
          </Box>
        ) : (
          <Box flex={1} />
        )}

        {/* ── Footer: logout ── */}
        <Box
          px={collapsed ? 1 : 2}
          pb={2.5}
          sx={{ borderTop: `1px solid ${colors.border}`, pt: 2 }}
        >
          {collapsed ? (
            <Tooltip title="Cerrar sesión" placement="right" arrow>
              <IconButton
                onClick={onLogOut}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  border: "1px solid rgba(241, 25, 9, 0.18)",
                  backgroundColor: "#FFF5F4",
                  color: "#EE190A",
                  "&:hover": { backgroundColor: "#FEECEB" },
                }}
              >
                <ExitToAppOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Button
              type="button"
              fullWidth
              variant="outlined"
              startIcon={<ExitToAppOutlined sx={{ fontSize: 18 }} />}
              onClick={onLogOut}
              sx={{
                height: 44,
                borderRadius: "12px",
                textTransform: "none",
                fontSize: "13.5px",
                fontWeight: 600,
                justifyContent: "flex-start",
                px: 2,
                color: "#EE190A",
                borderColor: "rgba(241, 25, 9, 0.18)",
                backgroundColor: "#FFF5F4",
                transition: "all 0.2s ease",
                "& .MuiButton-startIcon": { mr: 1 },
                "&:hover": {
                  borderColor: "rgba(245, 36, 21, 0.28)",
                  backgroundColor: "#FEECEB",
                  boxShadow: "0 6px 18px rgba(180, 35, 24, 0.10)",
                },
              }}
            >
              Cerrar sesión
            </Button>
          )}
        </Box>
      </Box>
    </Drawer>
  )
}

export const DrawerHeaderPrimary = styled("div")(({ theme }) => ({
  height: 72,
  minHeight: 72,
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  justifyContent: "flex-end",
  boxSizing: "border-box",
}))

interface INavItemDrawer {
  isActive: boolean
  title: string
  subtitle?: string
  tooltip?: string
  to: string
  startIcon?: ReactNode
  onPress?: () => void
  isChild?: boolean
  collapsed?: boolean
}

const NavItemDrawer = ({
  isActive,
  title,
  subtitle,
  tooltip,
  to,
  startIcon,
  onPress,
  isChild = false,
  collapsed = false,
}: INavItemDrawer) => {
  const tooltipText = tooltip ?? subtitle ?? title

  const parentStyles = {
    display: "flex",
    padding: collapsed ? "12px" : "12px 16px",
    borderRadius: "12px",
    backgroundColor: isActive ? colors.primary : "transparent",
    color: isActive ? "#fff" : colors.textPrimary,
    alignItems: "center",
    justifyContent: collapsed ? "center" : "flex-start",
    gap: collapsed ? 0 : 1.5,
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    minHeight: 52,
    "&:hover": {
      backgroundColor: isActive ? colors.primaryLight : colors.hoverBg,
      color: isActive ? "#fff" : colors.primary,
    },
  } as const

  const childStyles = {
    display: "flex",
    padding: "8px 12px",
    borderRadius: "8px",
    backgroundColor: isActive ? colors.activeBg : "transparent",
    color: isActive ? colors.primary : colors.textSecondary,
    alignItems: "center",
    gap: 1.2,
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    marginLeft: "-12px",
    "&:hover": {
      backgroundColor: colors.hoverBg,
      color: colors.primary,
      paddingLeft: "14px",
    },
    "&::before": {
      content: '""',
      position: "absolute",
      left: "-14px",
      top: "50%",
      transform: "translateY(-50%)",
      width: "8px",
      height: "2px",
      backgroundColor: isActive ? colors.primary : colors.childBorder,
      transition: "background-color 0.2s ease",
    },
  } as const

  return (
    <Box display="flex" width="100%" flexDirection="row" alignItems="center" mb={0.75}>
      <Box flex={1}>
        <Tooltip title={tooltipText} placement="right" arrow>
          <Box>
            <NavigateLink
              onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                e.preventDefault()
                e.stopPropagation()
                onPress?.()
              }}
              to={to}
              uiLink={{
                sx: isChild ? childStyles : parentStyles,
                underline: "none",
              }}
            >
              {startIcon && (
                <Box
                  component="span"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: isChild ? 18 : 22,
                    height: isChild ? 18 : 22,
                    opacity: isChild ? (isActive ? 1 : 0.7) : 1,
                    "& svg": {
                      fontSize: isChild ? 16 : 20,
                    },
                  }}
                >
                  {startIcon}
                </Box>
              )}

              {!collapsed && (
                <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: isChild ? 13 : 14,
                      lineHeight: 1.3,
                      fontWeight: isActive ? 600 : isChild ? 450 : 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      letterSpacing: isChild ? "0.01em" : "0.02em",
                    }}
                  >
                    {title}
                  </Typography>
                </Box>
              )}

              {isChild && isActive && !collapsed && (
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: colors.primary,
                    flexShrink: 0,
                  }}
                />
              )}
            </NavigateLink>
          </Box>
        </Tooltip>
      </Box>
    </Box>
  )
}

interface INavGroupDrawer {
  isActive: boolean
  isOpen: boolean
  title: string
  subtitle?: string
  tooltip?: string
  startIcon?: ReactNode
  onToggle: () => void
  collapsed?: boolean
}

const NavGroupDrawer = ({
  isActive,
  isOpen,
  title,
  subtitle,
  tooltip,
  startIcon,
  onToggle,
  collapsed = false,
}: INavGroupDrawer) => {
  const tooltipText = tooltip ?? subtitle ?? title

  return (
    <Box display="flex" width="100%" flexDirection="row" alignItems="center" mb={0.75}>
      <Box flex={1}>
        <Tooltip title={tooltipText} placement="right" arrow>
          <Box
            onClick={onToggle}
            sx={{
              display: "flex",
              padding: collapsed ? "12px" : "12px 16px",
              borderRadius: "12px",
              backgroundColor:
                isActive && !isOpen ? colors.primary : isOpen ? colors.activeBg : "transparent",
              color: isActive && !isOpen ? "#fff" : colors.textPrimary,
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: collapsed ? 0 : 1.5,
              cursor: "pointer",
              userSelect: "none",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              minHeight: 52,
              "&:hover": {
                backgroundColor: isActive && !isOpen ? colors.primaryLight : colors.hoverBg,
                color: isActive && !isOpen ? "#fff" : colors.primary,
              },
            }}
          >
            {startIcon && (
              <Box
                component="span"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 22,
                  height: 22,
                  "& svg": {
                    fontSize: 20,
                  },
                }}
              >
                {startIcon}
              </Box>
            )}

            {!collapsed && (
              <>
                <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: 14,
                      lineHeight: 1.3,
                      fontWeight: isActive ? 600 : 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {title}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    borderRadius: "6px",
                    backgroundColor:
                      isActive && !isOpen ? "rgba(255,255,255,0.15)" : colors.hoverBg,
                    transition: "transform 0.2s ease",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <ExpandMore sx={{ fontSize: 18 }} />
                </Box>
              </>
            )}
          </Box>
        </Tooltip>
      </Box>
    </Box>
  )
}