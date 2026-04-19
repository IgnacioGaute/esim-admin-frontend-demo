import { ReactNode } from 'react';
import { ThemeProvider } from '@emotion/react';
import { CssBaseline} from '@mui/material';
import { lightTheme } from './lightTheme';


export const AppTheme = ({
    children
}:{ children: ReactNode }) => {
  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      { children }
    </ThemeProvider>
  )
}
