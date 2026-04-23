import { ReactNode } from 'react';
import { TronThemeProvider } from './TronThemeContext';
import './tron.css';

export const AppTheme = ({
  children
}: { children: ReactNode }) => {
  return (
    <TronThemeProvider>
      {children}
    </TronThemeProvider>
  );
};
