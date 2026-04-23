import { ReactNode, useEffect, useMemo, useState } from "react"
import { styled, keyframes } from "@mui/material/styles"
import {
  Box,
  Button,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material"
// Note: Collapse is still used for menu groups
import {
  CloseOutlined,
  ExitToAppOutlined,
  ExpandMore,
} from "@mui/icons-material"
import { useLocation, useNavigate } from "react-router-dom"

import { NavigateLink } from "./NavigateLink"
import { useTronTheme } from "@/theme/TronThemeContext"
import { TronLogo } from "./tron/TronLogo"

export const DrawerPrimaryWidth = 280
export const DrawerPrimaryCollapsedWidth = 64

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "0, 255, 255"
}

const glowPulse = keyframes`
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
`

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
  const { identity, glowLevel } = useTronTheme()

  const currentPath = location.pathname
  const primaryColor = identity.primary
  const primaryRgb = hexToRgb(primaryColor)

  const colors = {
    surface: "rgba(10, 10, 18, 0.95)",
    border: `rgba(${primaryRgb}, 0.2)`,
    hoverBg: `rgba(${primaryRgb}, 0.1)`,
    activeBg: `rgba(${primaryRgb}, 0.15)`,
    childBorder: `rgba(${primaryRgb}, 0.3)`,
    textPrimary: "#E8E8E8",
    textSecondary: "rgba(232, 232, 232, 0.6)",
  }

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
    if (collapsed && !item.children?.length) {
      navigate(item.url)
      if (isMobile) handleDrawerClose()
      return
    }
    if (!item.children?.length) {
      navigate(item.url)
      if (isMobile) handleDrawerClose()
    }
  }

  const handleGroupClick = (item: IItemsNavDrawer) => {
    if (collapsed) {
      handleDrawerOpen?.()
      toggleGroup(item.key, true)
      return
    }
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
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: glowLevel > 0 
            ? `4px 0 ${20 * glowLevel}px rgba(${primaryRgb}, 0.1)`
            : "none",
          overflowX: "hidden",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarColor: `rgba(${primaryRgb}, 0.3) transparent`,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: `rgba(${primaryRgb}, 0.3)`,
            borderRadius: "3px",
          },
        },
      }}
      variant={isPersistent ? "persistent" : "temporary"}
      anchor="left"
      open={open}
    >
      <DrawerHeaderPrimary sx={{ px: collapsed ? 1 : 2 }}>
        <Box
          display="flex"
          width="100%"
          alignItems="center"
          justifyContent={collapsed ? "center" : "space-between"}
        >
          {collapsed ? (
            <Tooltip title="Abrir menu" placement="right" arrow>
              <IconButton
                onClick={handleDrawerOpen}
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "8px",
                  border: `1px solid ${colors.border}`,
                  backgroundColor: colors.activeBg,
                  color: primaryColor,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: colors.hoverBg,
                    boxShadow: glowLevel > 0 
                      ? `0 0 ${15 * glowLevel}px rgba(${primaryRgb}, 0.3)`
                      : "none",
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
                <TronLogo size={44} showOrbit showText text="eSIM" />
              </Box>

              <IconButton
                onClick={handleDrawerClose}
                sx={{
                  color: colors.textSecondary,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: colors.hoverBg,
                    color: primaryColor,
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
      >
        {/* Nav items */}
        <Box px={collapsed ? 1 : 2}>
          {!collapsed && (
            <Typography
              sx={{
                fontSize: "0.65rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                color: primaryColor,
                opacity: 0.7,
                px: 1,
                mb: 1.5,
                textTransform: "uppercase",
              }}
            >
              Menu
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
                    primaryColor={primaryColor}
                    glowLevel={glowLevel}
                  />

                  {!collapsed && (
                    <Collapse in={!!openGroups[item.key]} timeout={200} unmountOnExit>
                      <Box
                        sx={{
                          ml: 3,
                          mt: 0.5,
                          mb: 1,
                          pl: 2,
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
                              primaryColor={primaryColor}
                              glowLevel={glowLevel}
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
                primaryColor={primaryColor}
                glowLevel={glowLevel}
              />
            )
          })}
        </Box>

        {/* Spacer with decorative grid pattern */}
        {!collapsed ? (
          <Box
            sx={{
              flex: 1,
              mx: 2,
              my: 2,
              borderRadius: "12px",
              overflow: "hidden",
              position: "relative",
              background: `linear-gradient(160deg, rgba(${primaryRgb}, 0.08) 0%, rgba(${primaryRgb}, 0.02) 100%)`,
              border: `1px solid rgba(${primaryRgb}, 0.15)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 80,
              "&::before": {
                content: '""',
                position: "absolute",
                inset: 0,
                background: `
                  repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 19px,
                    rgba(${primaryRgb}, 0.05) 19px,
                    rgba(${primaryRgb}, 0.05) 20px
                  ),
                  repeating-linear-gradient(
                    90deg,
                    transparent,
                    transparent 19px,
                    rgba(${primaryRgb}, 0.05) 19px,
                    rgba(${primaryRgb}, 0.05) 20px
                  )
                `,
              },
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: `2px solid rgba(${primaryRgb}, 0.3)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
                animation: glowLevel > 0 ? `${glowPulse} 3s ease-in-out infinite` : "none",
              }}
            >
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  backgroundColor: `rgba(${primaryRgb}, 0.5)`,
                  boxShadow: glowLevel > 0 
                    ? `0 0 ${10 * glowLevel}px rgba(${primaryRgb}, 0.5)`
                    : "none",
                }}
              />
            </Box>
            <Typography
              sx={{
                fontSize: "0.6rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                color: `rgba(${primaryRgb}, 0.5)`,
                textTransform: "uppercase",
                zIndex: 1,
              }}
            >
              eSIM Platform
            </Typography>
          </Box>
        ) : (
          <Box flex={1} />
        )}

        {/* Footer: logout */}
        <Box
          px={collapsed ? 1 : 2}
          pb={2.5}
          sx={{ borderTop: `1px solid ${colors.border}`, pt: 2 }}
        >
          {collapsed ? (
            <Tooltip title="Cerrar sesion" placement="right" arrow>
              <IconButton
                onClick={onLogOut}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 65, 54, 0.3)",
                  backgroundColor: "rgba(255, 65, 54, 0.1)",
                  color: "#FF4136",
                  transition: "all 0.3s ease",
                  "&:hover": { 
                    backgroundColor: "rgba(255, 65, 54, 0.2)",
                    boxShadow: "0 0 15px rgba(255, 65, 54, 0.3)",
                  },
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
                borderRadius: "8px",
                textTransform: "none",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.03em",
                justifyContent: "flex-start",
                px: 2,
                color: "#FF4136",
                borderColor: "rgba(255, 65, 54, 0.3)",
                backgroundColor: "rgba(255, 65, 54, 0.08)",
                transition: "all 0.3s ease",
                "& .MuiButton-startIcon": { mr: 1.5 },
                "&:hover": {
                  borderColor: "rgba(255, 65, 54, 0.5)",
                  backgroundColor: "rgba(255, 65, 54, 0.15)",
                  boxShadow: "0 0 15px rgba(255, 65, 54, 0.2)",
                },
              }}
            >
              Cerrar sesion
            </Button>
          )}
        </Box>
      </Box>
    </Drawer>
  )
}

export const DrawerHeaderPrimary = styled("div")(({ theme }) => ({
  height: 88,
  minHeight: 88,
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
  primaryColor: string
  glowLevel: number
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
  primaryColor,
  glowLevel,
}: INavItemDrawer) => {
  const tooltipText = tooltip ?? subtitle ?? title
  const primaryRgb = hexToRgb(primaryColor)

  const parentStyles = {
    display: "flex",
    padding: collapsed ? "12px" : "12px 16px",
    borderRadius: "8px",
    backgroundColor: isActive ? `rgba(${primaryRgb}, 0.15)` : "transparent",
    color: isActive ? primaryColor : "#E8E8E8",
    alignItems: "center",
    justifyContent: collapsed ? "center" : "flex-start",
    gap: collapsed ? 0 : 1.5,
    transition: "all 0.3s ease",
    position: "relative",
    minHeight: 48,
    border: isActive ? `1px solid rgba(${primaryRgb}, 0.3)` : "1px solid transparent",
    boxShadow: isActive && glowLevel > 0 
      ? `0 0 ${10 * glowLevel}px rgba(${primaryRgb}, 0.2), inset 0 0 ${8 * glowLevel}px rgba(${primaryRgb}, 0.1)`
      : "none",
    "&:hover": {
      backgroundColor: `rgba(${primaryRgb}, 0.1)`,
      color: primaryColor,
      borderColor: `rgba(${primaryRgb}, 0.2)`,
    },
  } as const

  const childStyles = {
    display: "flex",
    padding: "8px 12px",
    borderRadius: "6px",
    backgroundColor: isActive ? `rgba(${primaryRgb}, 0.1)` : "transparent",
    color: isActive ? primaryColor : "rgba(232, 232, 232, 0.7)",
    alignItems: "center",
    gap: 1.2,
    transition: "all 0.3s ease",
    position: "relative",
    marginLeft: "-12px",
    "&:hover": {
      backgroundColor: `rgba(${primaryRgb}, 0.08)`,
      color: primaryColor,
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
      backgroundColor: isActive ? primaryColor : `rgba(${primaryRgb}, 0.3)`,
      transition: "all 0.3s ease",
      boxShadow: isActive && glowLevel > 0 
        ? `0 0 ${6 * glowLevel}px ${primaryColor}`
        : "none",
    },
  } as const

  return (
    <Box display="flex" width="100%" flexDirection="row" alignItems="center" mb={0.5}>
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
                      fontSize: isChild ? 12.5 : 13.5,
                      lineHeight: 1.3,
                      fontWeight: isActive ? 600 : isChild ? 450 : 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      letterSpacing: "0.03em",
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
                    backgroundColor: primaryColor,
                    flexShrink: 0,
                    boxShadow: glowLevel > 0 
                      ? `0 0 ${8 * glowLevel}px ${primaryColor}`
                      : "none",
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
  primaryColor: string
  glowLevel: number
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
  primaryColor,
  glowLevel,
}: INavGroupDrawer) => {
  const tooltipText = tooltip ?? subtitle ?? title
  const primaryRgb = hexToRgb(primaryColor)

  return (
    <Box display="flex" width="100%" flexDirection="row" alignItems="center" mb={0.5}>
      <Box flex={1}>
        <Tooltip title={tooltipText} placement="right" arrow>
          <Box
            onClick={onToggle}
            sx={{
              display: "flex",
              padding: collapsed ? "12px" : "12px 16px",
              borderRadius: "8px",
              backgroundColor:
                isActive && !isOpen 
                  ? `rgba(${primaryRgb}, 0.15)` 
                  : isOpen 
                    ? `rgba(${primaryRgb}, 0.08)` 
                    : "transparent",
              color: isActive && !isOpen ? primaryColor : "#E8E8E8",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: collapsed ? 0 : 1.5,
              cursor: "pointer",
              userSelect: "none",
              transition: "all 0.3s ease",
              minHeight: 48,
              border: isActive && !isOpen 
                ? `1px solid rgba(${primaryRgb}, 0.3)` 
                : "1px solid transparent",
              boxShadow: isActive && !isOpen && glowLevel > 0
                ? `0 0 ${10 * glowLevel}px rgba(${primaryRgb}, 0.2)`
                : "none",
              "&:hover": {
                backgroundColor: `rgba(${primaryRgb}, 0.1)`,
                color: primaryColor,
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
                      fontSize: 13.5,
                      lineHeight: 1.3,
                      fontWeight: isActive ? 600 : 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      letterSpacing: "0.03em",
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
                    borderRadius: "4px",
                    backgroundColor: `rgba(${primaryRgb}, 0.1)`,
                    transition: "all 0.3s ease",
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
