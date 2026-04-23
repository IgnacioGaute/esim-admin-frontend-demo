import { styled } from '@mui/material/styles';

export const MainByDrawer = styled('main', {
  shouldForwardProp: (prop) =>
    prop !== 'open' && prop !== 'enabledDrawer' && prop !== 'DrawerPrimaryWidth',
})<{
  open?: boolean;
  enabledDrawer?: boolean;
  DrawerPrimaryWidth: number;
}>(({ theme, enabledDrawer }) => ({
  flexGrow: 1,
  minWidth: 0,
  width: '100%',
  padding: enabledDrawer ? theme.spacing(2) : theme.spacing(3),
  transition: theme.transitions.create(['padding'], {
    easing: theme.transitions.easing.easeOut,
    duration: theme.transitions.duration.enteringScreen,
  }),
  backgroundColor: '#0A0A0F',
  backgroundImage: `
    radial-gradient(ellipse at 50% 0%, rgba(var(--tron-primary-rgb, 0, 255, 255), 0.05) 0%, transparent 50%)
  `,
  minHeight: '100vh',
}));
