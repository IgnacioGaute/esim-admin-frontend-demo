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
}));