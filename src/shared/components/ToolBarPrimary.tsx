import { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  AppBarProps as MuiAppBarProps,
  AppBar as MuiAppBar,
  Container,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Skeleton,
} from '@mui/material';
import {
  MenuOutlined as MenuIcon,
  ExpandMoreOutlined,
  Person,
  ShoppingBasketOutlined,
  ArrowBack,
  LogoutOutlined,
  AccountCircleOutlined,
} from '@mui/icons-material';
import { useScreenSize } from '../hooks/useScreenSize';
import { useNavigate } from 'react-router-dom';

interface Props {
  openDrawer: boolean;
  collapsedDrawer?: boolean;
  drawerWidth?: number;
  title?: string;
  subtitle?: string;
  handleDrawerOpen?: () => void;
  totalNoti?: number;
  handleNotiOpen?: () => void;
  onLogOut?: () => void;
  user: {
    loading: boolean;
    avatar?: string;
    name?: string;
    rol?: string;
  };
  cart?: {
    handleCarOpen: () => void;
    count: number;
  };
  onBack?: () => void;
}

const colors = {
  primary: '#1C3680',
  primarySoft: 'rgba(28, 54, 128, 0.08)',
  textPrimary: '#101828',
  textSecondary: '#667085',
  border: 'rgba(16, 24, 40, 0.08)',
  surface: '#FFFFFF',
  hover: '#F8FAFC',
  danger: '#B42318',
  dangerSoft: '#FFF5F4',
};

export const ToolBarPrimary = ({
  openDrawer,
  collapsedDrawer = false,
  title,
  subtitle,
  drawerWidth = 260,
  handleDrawerOpen,
  totalNoti = 1,
  handleNotiOpen,
  onLogOut,
  user,
  cart,
  onBack,
}: Props) => {
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const { width } = useScreenSize();
  const navigate = useNavigate();

  const isMobile = width <= 768;

  const handleGoToAccount = () => {
    setOpenUserMenu(false);
    navigate('/admin/my-account');
  };

  const handleOpenUserMenu = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(e.currentTarget);
    setOpenUserMenu(true);
  };

  const handleCloseUserMenu = () => {
    setOpenUserMenu(false);
  };

const showMenuButton = Boolean(handleDrawerOpen) && isMobile && !openDrawer;
  return (
    <AppBar
      position="fixed"
      open={openDrawer || collapsedDrawer}
      drawerWidth={drawerWidth}
      color="inherit"
      elevation={0}
      sx={{
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, md: 3 } }}>
      <Toolbar
        sx={{
          minHeight: '72px !important',
          px: { xs: 0, md: 2 },
          gap: showMenuButton ? 1 : 0.5,
          alignItems: 'center',
        }}
      >
          {onBack && (
            <IconButton
              onClick={onBack}
              sx={{
                mr: 0.5,
                width: 40,
                height: 40,
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.surface,
                '&:hover': {
                  backgroundColor: colors.hover,
                },
              }}
            >
              <ArrowBack sx={{ color: colors.primary, fontSize: 20 }} />
            </IconButton>
          )}

          {showMenuButton && (
            <IconButton
              color="primary"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                mr: isMobile ? 0.5 : 1,
                width: 40,
                height: 40,
                border: `1px solid ${colors.border}`,
                backgroundColor: colors.surface,
                flexShrink: 0,
                '&:hover': {
                  backgroundColor: colors.hover,
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {(title || subtitle) && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                minWidth: 0,
                ml: { xs: 0, md: 1.5 },
                maxWidth: {
                  xs: '52vw',
                  sm: '58vw',
                  md: collapsedDrawer ? '520px' : '560px',
                },
              }}
            >
              {!!title && (
                <Typography
                  noWrap
                  component="div"
                  sx={{
                    color: colors.primary,
                    fontSize: { xs: '1rem', md: '1.15rem' },
                    lineHeight: 1.1,
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {title}
                </Typography>
              )}

              {!!subtitle && (
                <Typography
                  component="div"
                  noWrap
                  sx={{
                    mt: 0.4,
                    fontSize: '12.5px',
                    lineHeight: 1.2,
                    fontWeight: 500,
                    color: colors.textSecondary,
                  }}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {cart && (
              <IconButton
                size="medium"
                aria-label="cart"
                onClick={cart.handleCarOpen}
                sx={{
                  width: 42,
                  height: 42,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: '#FFF8EB',
                  '&:hover': {
                    backgroundColor: '#FFF1CC',
                  },
                }}
              >
                <Badge
                  badgeContent={cart.count}
                  color="error"
                  sx={{
                    '& .MuiBadge-badge': {
                      minWidth: 18,
                      height: 18,
                      borderRadius: '999px',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      px: 0.5,
                    },
                  }}
                >
                  <ShoppingBasketOutlined sx={{ color: '#D97706', fontSize: 21 }} />
                </Badge>
              </IconButton>
            )}

            <Box position="relative">
              <Box
                onClick={handleOpenUserMenu}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  px: { xs: 0.5, md: 1 },
                  py: 0.5,
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: colors.hover,
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                  }}
                >
                  {user.loading ? (
                    <Skeleton variant="circular" width={40} height={40} />
                  ) : (
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: colors.primarySoft,
                        color: colors.primary,
                        border: `1px solid rgba(28, 54, 128, 0.10)`,
                        fontWeight: 700,
                      }}
                    >
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user?.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : user?.name ? (
                        user.name.charAt(0).toUpperCase()
                      ) : (
                        <Person fontSize="small" />
                      )}
                    </Avatar>
                  )}
                </Box>

                <Box
                  sx={{
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'center',
                    maxWidth: 190,
                    minWidth: 0,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      noWrap
                      sx={{
                        color: colors.textPrimary,
                        fontSize: '14px',
                        lineHeight: 1.15,
                        fontWeight: 700,
                      }}
                    >
                      {user.loading ? <Skeleton width={90} /> : user?.name || 'Usuario'}
                    </Typography>

                    <Typography
                      noWrap
                      sx={{
                        mt: 0.2,
                        color: colors.textSecondary,
                        fontSize: '12px',
                        lineHeight: 1.1,
                        fontWeight: 500,
                      }}
                    >
                      {user.loading ? <Skeleton width={60} /> : user?.rol || ''}
                    </Typography>
                  </Box>

                  <ExpandMoreOutlined
                    sx={{
                      ml: 1,
                      fontSize: 18,
                      color: colors.textSecondary,
                      transform: openUserMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </Box>
              </Box>

              <Menu
                open={openUserMenu}
                onClose={handleCloseUserMenu}
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    mt: 1,
                    minWidth: 220,
                    overflow: 'visible',
                    borderRadius: '16px',
                    border: `1px solid ${colors.border}`,
                    boxShadow: '0 16px 40px rgba(16, 24, 40, 0.12)',
                    p: 1,
                    '&::before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 18,
                      width: 10,
                      height: 10,
                      bgcolor: '#fff',
                      borderTop: `1px solid ${colors.border}`,
                      borderLeft: `1px solid ${colors.border}`,
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0,
                    },
                  },
                }}
              >
                <Box
                  sx={{
                    px: 1.5,
                    py: 1.25,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.25,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 38,
                      height: 38,
                      bgcolor: colors.primarySoft,
                      color: colors.primary,
                      fontWeight: 700,
                    }}
                  >
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user?.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : user?.name ? (
                      user.name.charAt(0).toUpperCase()
                    ) : (
                      <Person fontSize="small" />
                    )}
                  </Avatar>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      noWrap
                      sx={{
                        fontSize: '13.5px',
                        fontWeight: 700,
                        color: colors.textPrimary,
                      }}
                    >
                      {user?.name || 'Usuario'}
                    </Typography>
                    <Typography
                      noWrap
                      sx={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: colors.textSecondary,
                      }}
                    >
                      {user?.rol || ''}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 0.5 }} />

                <MenuItem
                  onClick={handleGoToAccount}
                  sx={{
                    minHeight: 42,
                    borderRadius: '10px',
                    mx: 0.5,
                    gap: 1.2,
                  }}
                >
                  <AccountCircleOutlined sx={{ fontSize: 18, color: colors.primary }} />
                  <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
                    Mi cuenta
                  </Typography>
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    setOpenUserMenu(false);
                    onLogOut?.();
                  }}
                  sx={{
                    minHeight: 42,
                    borderRadius: '10px',
                    mx: 0.5,
                    mt: 0.5,
                    gap: 1.2,
                    color: colors.danger,
                    '&:hover': {
                      backgroundColor: colors.dangerSoft,
                    },
                  }}
                >
                  <LogoutOutlined sx={{ fontSize: 18 }} />
                  <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>
                    Cerrar sesión
                  </Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
  drawerWidth: number;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open' && prop !== 'drawerWidth',
})<AppBarProps>(({ theme, open, drawerWidth }) => ({
  backgroundImage: 'none',
  height: 72,
  minHeight: 72,
  width: open ? `calc(100% - ${drawerWidth}px)` : '100%',
  marginLeft: open ? `${drawerWidth}px` : 0,
  transition: theme.transitions.create(['margin-left', 'width'], {
    easing: theme.transitions.easing.easeOut,
    duration: theme.transitions.duration.enteringScreen,
  }),
}));