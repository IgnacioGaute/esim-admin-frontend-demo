import { useState } from 'react';
import { styled, keyframes } from '@mui/material/styles';
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
import { useTronTheme } from '@/theme/TronThemeContext';

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 255, 255';
}

const glowPulse = keyframes`
  0%, 100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
`;

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

export const ToolBarPrimary = ({
  openDrawer,
  collapsedDrawer = false,
  title,
  subtitle,
  drawerWidth = 280,
  handleDrawerOpen,
  onLogOut,
  user,
  cart,
  onBack,
}: Props) => {
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const { width } = useScreenSize();
  const navigate = useNavigate();
  const { identity, glowLevel } = useTronTheme();

  const primaryColor = identity.primary;
  const primaryRgb = hexToRgb(primaryColor);

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
      $primaryColor={primaryColor}
      $glowLevel={glowLevel}
      color="inherit"
      elevation={0}
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
                border: `1px solid rgba(${primaryRgb}, 0.3)`,
                backgroundColor: 'rgba(15, 15, 25, 0.8)',
                color: primaryColor,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: `rgba(${primaryRgb}, 0.1)`,
                  boxShadow: glowLevel > 0 
                    ? `0 0 ${10 * glowLevel}px rgba(${primaryRgb}, 0.3)`
                    : 'none',
                },
              }}
            >
              <ArrowBack sx={{ fontSize: 20 }} />
            </IconButton>
          )}

          {showMenuButton && (
            <IconButton
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{
                mr: isMobile ? 0.5 : 1,
                width: 40,
                height: 40,
                border: `1px solid rgba(${primaryRgb}, 0.3)`,
                backgroundColor: 'rgba(15, 15, 25, 0.8)',
                color: primaryColor,
                flexShrink: 0,
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: `rgba(${primaryRgb}, 0.1)`,
                  boxShadow: glowLevel > 0 
                    ? `0 0 ${10 * glowLevel}px rgba(${primaryRgb}, 0.3)`
                    : 'none',
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
                    color: primaryColor,
                    fontSize: { xs: '1rem', md: '1.15rem' },
                    lineHeight: 1.1,
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    textShadow: glowLevel > 0 
                      ? `0 0 ${10 * glowLevel}px rgba(${primaryRgb}, 0.5)`
                      : 'none',
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
                    fontSize: '11px',
                    lineHeight: 1.2,
                    fontWeight: 500,
                    letterSpacing: '0.08em',
                    color: 'rgba(232, 232, 232, 0.5)',
                    textTransform: 'uppercase',
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
                  border: `1px solid rgba(255, 183, 0, 0.3)`,
                  backgroundColor: 'rgba(255, 183, 0, 0.1)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 183, 0, 0.15)',
                    boxShadow: glowLevel > 0 
                      ? '0 0 15px rgba(255, 183, 0, 0.3)'
                      : 'none',
                  },
                }}
              >
                <Badge
                  badgeContent={cart.count}
                  sx={{
                    '& .MuiBadge-badge': {
                      minWidth: 18,
                      height: 18,
                      borderRadius: '999px',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      px: 0.5,
                      backgroundColor: '#FF4136',
                      color: '#fff',
                    },
                  }}
                >
                  <ShoppingBasketOutlined sx={{ color: '#FFB700', fontSize: 21 }} />
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
                  px: { xs: 0.5, md: 1.5 },
                  py: 0.75,
                  borderRadius: '12px',
                  border: `1px solid rgba(${primaryRgb}, 0.2)`,
                  backgroundColor: 'rgba(15, 15, 25, 0.6)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: `rgba(${primaryRgb}, 0.08)`,
                    borderColor: `rgba(${primaryRgb}, 0.4)`,
                    boxShadow: glowLevel > 0 
                      ? `0 0 ${15 * glowLevel}px rgba(${primaryRgb}, 0.15)`
                      : 'none',
                  },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: 38,
                    height: 38,
                    flexShrink: 0,
                  }}
                >
                  {user.loading ? (
                    <Skeleton 
                      variant="circular" 
                      width={38} 
                      height={38}
                      sx={{ bgcolor: `rgba(${primaryRgb}, 0.2)` }}
                    />
                  ) : (
                    <Avatar
                      sx={{
                        width: 38,
                        height: 38,
                        bgcolor: `rgba(${primaryRgb}, 0.2)`,
                        color: primaryColor,
                        border: `1px solid rgba(${primaryRgb}, 0.3)`,
                        fontWeight: 700,
                        fontSize: '14px',
                        boxShadow: glowLevel > 0 
                          ? `0 0 ${10 * glowLevel}px rgba(${primaryRgb}, 0.3)`
                          : 'none',
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
                  {/* Online indicator */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: '#00FF88',
                      border: '2px solid rgba(10, 10, 18, 0.9)',
                      boxShadow: glowLevel > 0 
                        ? '0 0 8px #00FF88'
                        : 'none',
                      animation: glowLevel > 0 ? `${glowPulse} 2s ease-in-out infinite` : 'none',
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'center',
                    maxWidth: 180,
                    minWidth: 0,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      noWrap
                      sx={{
                        color: '#E8E8E8',
                        fontSize: '13px',
                        lineHeight: 1.15,
                        fontWeight: 600,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {user.loading ? (
                        <Skeleton width={80} sx={{ bgcolor: `rgba(${primaryRgb}, 0.2)` }} />
                      ) : (
                        user?.name || 'Usuario'
                      )}
                    </Typography>

                    <Typography
                      noWrap
                      sx={{
                        mt: 0.2,
                        color: primaryColor,
                        fontSize: '10px',
                        lineHeight: 1.1,
                        fontWeight: 600,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {user.loading ? (
                        <Skeleton width={50} sx={{ bgcolor: `rgba(${primaryRgb}, 0.2)` }} />
                      ) : (
                        user?.rol || ''
                      )}
                    </Typography>
                  </Box>

                  <ExpandMoreOutlined
                    sx={{
                      ml: 1,
                      fontSize: 18,
                      color: `rgba(${primaryRgb}, 0.7)`,
                      transform: openUserMenu ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
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
                    mt: 1.5,
                    minWidth: 220,
                    overflow: 'visible',
                    borderRadius: '12px',
                    border: `1px solid rgba(${primaryRgb}, 0.3)`,
                    backgroundColor: 'rgba(15, 15, 25, 0.95)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: glowLevel > 0 
                      ? `0 8px 32px rgba(0, 0, 0, 0.4), 0 0 ${20 * glowLevel}px rgba(${primaryRgb}, 0.15)`
                      : '0 8px 32px rgba(0, 0, 0, 0.4)',
                    p: 1,
                    '&::before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 18,
                      width: 10,
                      height: 10,
                      bgcolor: 'rgba(15, 15, 25, 0.95)',
                      borderTop: `1px solid rgba(${primaryRgb}, 0.3)`,
                      borderLeft: `1px solid rgba(${primaryRgb}, 0.3)`,
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
                      width: 36,
                      height: 36,
                      bgcolor: `rgba(${primaryRgb}, 0.2)`,
                      color: primaryColor,
                      fontWeight: 700,
                      fontSize: '13px',
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
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#E8E8E8',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {user?.name || 'Usuario'}
                    </Typography>
                    <Typography
                      noWrap
                      sx={{
                        fontSize: '10px',
                        fontWeight: 600,
                        color: primaryColor,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {user?.rol || ''}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 0.5, borderColor: `rgba(${primaryRgb}, 0.2)` }} />

                <MenuItem
                  onClick={handleGoToAccount}
                  sx={{
                    minHeight: 42,
                    borderRadius: '8px',
                    mx: 0.5,
                    gap: 1.2,
                    color: '#E8E8E8',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: `rgba(${primaryRgb}, 0.1)`,
                      color: primaryColor,
                    },
                  }}
                >
                  <AccountCircleOutlined sx={{ fontSize: 18 }} />
                  <Typography sx={{ fontSize: '13px', fontWeight: 500 }}>
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
                    borderRadius: '8px',
                    mx: 0.5,
                    mt: 0.5,
                    gap: 1.2,
                    color: '#FF4136',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 65, 54, 0.1)',
                    },
                  }}
                >
                  <LogoutOutlined sx={{ fontSize: 18 }} />
                  <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>
                    Cerrar sesion
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
  $primaryColor: string;
  $glowLevel: number;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => 
    prop !== 'open' && 
    prop !== 'drawerWidth' && 
    prop !== '$primaryColor' && 
    prop !== '$glowLevel',
})<AppBarProps>(({ theme, open, drawerWidth, $primaryColor, $glowLevel }) => {
  const primaryRgb = hexToRgb($primaryColor);
  
  return {
    backgroundImage: 'none',
    height: 72,
    minHeight: 72,
    width: open ? `calc(100% - ${drawerWidth}px)` : '100%',
    marginLeft: open ? `${drawerWidth}px` : 0,
    transition: theme.transitions.create(['margin-left', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    backgroundColor: 'rgba(10, 10, 18, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: `1px solid rgba(${primaryRgb}, 0.2)`,
    boxShadow: $glowLevel > 0 
      ? `0 4px ${15 * $glowLevel}px rgba(${primaryRgb}, 0.1)`
      : 'none',
  };
});
