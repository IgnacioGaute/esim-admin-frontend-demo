import { createTheme } from '@mui/material/styles';
import { customComponentsTheme } from './customTheme';

// A custom theme for this app
export const lightTheme = createTheme({
  palette: {
    background: {
      default: '#FAFBFF'
    },
    primary: {
      main: '#1C3680',
    },
    secondary: {
      main: '#F2003D',
    },
    error: {
      main: '#F2003D',
    },
  },
  components: customComponentsTheme
});
