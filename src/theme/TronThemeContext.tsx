import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { ThemeProvider, createTheme, Theme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { IDENTITIES, Identity, IdentityName, GlowLevel } from './identities';

// Storage keys
const STORAGE_KEY_IDENTITY = 'tron-identity';
const STORAGE_KEY_GLOW = 'tron-glow-level';

interface TronThemeContextType {
  identity: Identity;
  glowLevel: GlowLevel;
  setIdentity: (name: IdentityName) => void;
  setGlowLevel: (level: GlowLevel) => void;
  theme: Theme;
}

const TronThemeContext = createContext<TronThemeContextType | null>(null);

// Create MUI theme based on identity
function createTronTheme(identity: Identity, glowLevel: GlowLevel): Theme {
  const glowMultiplier = [0, 0.5, 1, 1.5][glowLevel];
  
  return createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#0A0A0F',
        paper: 'rgba(15, 15, 25, 0.9)',
      },
      primary: {
        main: identity.primary,
        light: identity.glow,
        dark: identity.secondary,
      },
      secondary: {
        main: identity.secondary,
      },
      error: {
        main: '#FF4136',
      },
      warning: {
        main: '#FFB700',
      },
      success: {
        main: '#00FF88',
      },
      text: {
        primary: '#E8E8E8',
        secondary: 'rgba(232, 232, 232, 0.7)',
      },
      divider: `rgba(${hexToRgb(identity.primary)}, 0.2)`,
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        letterSpacing: '0.05em',
      },
      h2: {
        fontWeight: 700,
        letterSpacing: '0.04em',
      },
      h3: {
        fontWeight: 600,
        letterSpacing: '0.03em',
      },
      h4: {
        fontWeight: 600,
        letterSpacing: '0.02em',
      },
      h5: {
        fontWeight: 600,
        letterSpacing: '0.02em',
      },
      h6: {
        fontWeight: 600,
        letterSpacing: '0.01em',
      },
      button: {
        textTransform: 'uppercase',
        fontWeight: 600,
        letterSpacing: '0.1em',
      },
    },
    shape: {
      borderRadius: 4,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':root': {
            '--tron-primary': identity.primary,
            '--tron-secondary': identity.secondary,
            '--tron-glow': identity.glow,
            '--tron-accent': identity.accent,
            '--tron-glow-multiplier': glowMultiplier,
            '--tron-bg-dark': '#0A0A0F',
            '--tron-bg-surface': 'rgba(15, 15, 25, 0.9)',
            '--tron-border': `rgba(${hexToRgb(identity.primary)}, 0.3)`,
          },
          body: {
            backgroundColor: '#0A0A0F',
            backgroundImage: `
              radial-gradient(ellipse at 50% 0%, rgba(${hexToRgb(identity.primary)}, 0.08) 0%, transparent 50%),
              linear-gradient(180deg, #0A0A0F 0%, #0D0D15 100%)
            `,
            minHeight: '100vh',
          },
          '*::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '*::-webkit-scrollbar-track': {
            background: 'rgba(15, 15, 25, 0.5)',
          },
          '*::-webkit-scrollbar-thumb': {
            background: `rgba(${hexToRgb(identity.primary)}, 0.4)`,
            borderRadius: '4px',
            '&:hover': {
              background: `rgba(${hexToRgb(identity.primary)}, 0.6)`,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            padding: '10px 20px',
            transition: 'all 0.2s ease',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '13px',
            letterSpacing: '0.02em',
          },
          contained: {
            background: `linear-gradient(135deg, ${identity.primary} 0%, ${identity.secondary} 100%)`,
            boxShadow: glowMultiplier > 0 
              ? `0 4px 14px rgba(${hexToRgb(identity.glow)}, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)`
              : `0 2px 8px rgba(0,0,0,0.2)`,
            '&:hover': {
              boxShadow: glowMultiplier > 0 
                ? `0 6px 20px rgba(${hexToRgb(identity.glow)}, 0.4)`
                : `0 4px 12px rgba(0,0,0,0.3)`,
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(0)',
            },
          },
          outlined: {
            borderColor: `rgba(${hexToRgb(identity.primary)}, 0.5)`,
            color: identity.primary,
            borderWidth: '1px',
            backgroundColor: 'transparent',
            '&:hover': {
              borderColor: identity.primary,
              backgroundColor: `rgba(${hexToRgb(identity.primary)}, 0.08)`,
              boxShadow: glowMultiplier > 0 
                ? `0 0 ${12 * glowMultiplier}px rgba(${hexToRgb(identity.glow)}, 0.2)`
                : 'none',
              transform: 'translateY(-1px)',
            },
          },
          text: {
            color: identity.primary,
            '&:hover': {
              backgroundColor: `rgba(${hexToRgb(identity.primary)}, 0.08)`,
            },
          },
          sizeSmall: {
            padding: '6px 14px',
            fontSize: '12px',
          },
          sizeLarge: {
            padding: '12px 28px',
            fontSize: '14px',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(15, 15, 25, 0.6)',
              backdropFilter: 'blur(10px)',
              borderRadius: '10px',
              transition: 'all 0.2s ease',
              '& fieldset': {
                borderColor: `rgba(${hexToRgb(identity.primary)}, 0.25)`,
                transition: 'all 0.2s ease',
              },
              '&:hover': {
                backgroundColor: 'rgba(15, 15, 25, 0.8)',
                '& fieldset': {
                  borderColor: `rgba(${hexToRgb(identity.primary)}, 0.4)`,
                },
              },
              '&.Mui-focused': {
                backgroundColor: 'rgba(15, 15, 25, 0.85)',
                boxShadow: glowMultiplier > 0 
                  ? `0 0 0 3px rgba(${hexToRgb(identity.primary)}, 0.15)`
                  : `0 0 0 3px rgba(${hexToRgb(identity.primary)}, 0.1)`,
                '& fieldset': {
                  borderColor: identity.primary,
                  borderWidth: '1px',
                },
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(232, 232, 232, 0.5)',
              fontSize: '13px',
              fontWeight: 500,
              '&.Mui-focused': {
                color: identity.primary,
              },
            },
            '& .MuiInputBase-input': {
              color: '#E8E8E8',
              fontSize: '14px',
              '&::placeholder': {
                color: 'rgba(232, 232, 232, 0.4)',
                opacity: 1,
              },
            },
            '& .MuiInputBase-inputSizeSmall': {
              fontSize: '13px',
              padding: '10px 14px',
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: '10px',
          },
          notchedOutline: {
            borderColor: `rgba(${hexToRgb(identity.primary)}, 0.25)`,
          },
        },
      },
      MuiInputAdornment: {
        styleOverrides: {
          root: {
            color: 'rgba(232, 232, 232, 0.5)',
          },
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            marginLeft: '4px',
            marginTop: '6px',
            fontSize: '11px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgba(15, 15, 25, 0.85)',
            backdropFilter: 'blur(20px)',
            border: `1px solid rgba(${hexToRgb(identity.primary)}, 0.15)`,
            borderRadius: '16px',
            boxShadow: glowMultiplier > 0 
              ? `0 4px 24px rgba(0, 0, 0, 0.3), 0 0 ${15 * glowMultiplier}px rgba(${hexToRgb(identity.glow)}, 0.08)`
              : '0 4px 24px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.25s ease',
            '&:hover': {
              border: `1px solid rgba(${hexToRgb(identity.primary)}, 0.3)`,
              boxShadow: glowMultiplier > 0 
                ? `0 8px 32px rgba(0, 0, 0, 0.35), 0 0 ${20 * glowMultiplier}px rgba(${hexToRgb(identity.glow)}, 0.12)`
                : '0 8px 32px rgba(0, 0, 0, 0.35)',
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '20px',
            '&:last-child': {
              paddingBottom: '20px',
            },
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            padding: '16px 20px',
            borderBottom: `1px solid rgba(${hexToRgb(identity.primary)}, 0.1)`,
          },
          title: {
            fontSize: '16px',
            fontWeight: 700,
          },
          subheader: {
            fontSize: '12px',
            color: 'rgba(232, 232, 232, 0.5)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgba(15, 15, 25, 0.9)',
            backgroundImage: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: 'rgba(10, 10, 18, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRight: `1px solid rgba(${hexToRgb(identity.primary)}, 0.2)`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgba(10, 10, 18, 0.85)',
            backdropFilter: 'blur(20px)',
            borderBottom: `1px solid rgba(${hexToRgb(identity.primary)}, 0.2)`,
            boxShadow: glowMultiplier > 0 
              ? `0 4px ${15 * glowMultiplier}px rgba(${hexToRgb(identity.glow)}, 0.1)`
              : 'none',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: `rgba(${hexToRgb(identity.primary)}, 0.12)`,
            padding: '14px 16px',
            fontSize: '13px',
          },
          head: {
            backgroundColor: 'rgba(15, 15, 25, 0.95)',
            color: identity.primary,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontSize: '11px',
            borderBottom: `2px solid rgba(${hexToRgb(identity.primary)}, 0.3)`,
            whiteSpace: 'nowrap',
          },
          body: {
            color: '#E8E8E8',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'all 0.15s ease',
            '&:hover': {
              backgroundColor: `rgba(${hexToRgb(identity.primary)}, 0.06)`,
            },
            '&.Mui-selected': {
              backgroundColor: `rgba(${hexToRgb(identity.primary)}, 0.12)`,
              '&:hover': {
                backgroundColor: `rgba(${hexToRgb(identity.primary)}, 0.15)`,
              },
            },
          },
        },
      },
      MuiTableContainer: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            border: `1px solid rgba(${hexToRgb(identity.primary)}, 0.15)`,
            backgroundColor: 'rgba(15, 15, 25, 0.8)',
            backdropFilter: 'blur(20px)',
          },
        },
      },
      MuiTablePagination: {
        styleOverrides: {
          root: {
            color: 'rgba(232, 232, 232, 0.7)',
            borderTop: `1px solid rgba(${hexToRgb(identity.primary)}, 0.12)`,
          },
          selectIcon: {
            color: identity.primary,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            margin: '2px 8px',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: `rgba(${hexToRgb(identity.primary)}, 0.1)`,
            },
            '&.Mui-selected': {
              backgroundColor: `rgba(${hexToRgb(identity.primary)}, 0.15)`,
              borderLeft: `3px solid ${identity.primary}`,
              '&:hover': {
                backgroundColor: `rgba(${hexToRgb(identity.primary)}, 0.2)`,
              },
            },
          },
        },
      },
      MuiAccordion: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgba(15, 15, 25, 0.8)',
            border: `1px solid rgba(${hexToRgb(identity.primary)}, 0.15)`,
            borderRadius: '12px !important',
            marginBottom: '8px',
            boxShadow: 'none',
            '&:before': {
              display: 'none',
            },
            '&.Mui-expanded': {
              borderColor: `rgba(${hexToRgb(identity.primary)}, 0.3)`,
              boxShadow: glowMultiplier > 0 
                ? `0 4px 20px rgba(0, 0, 0, 0.2), 0 0 ${10 * glowMultiplier}px rgba(${hexToRgb(identity.glow)}, 0.08)`
                : '0 4px 20px rgba(0, 0, 0, 0.2)',
            },
          },
        },
      },
      MuiAccordionSummary: {
        styleOverrides: {
          root: {
            borderRadius: '12px',
            padding: '0 20px',
            minHeight: '56px',
            '&.Mui-expanded': {
              minHeight: '56px',
              borderBottom: `1px solid rgba(${hexToRgb(identity.primary)}, 0.1)`,
            },
          },
          content: {
            margin: '14px 0',
            '&.Mui-expanded': {
              margin: '14px 0',
            },
          },
          expandIconWrapper: {
            color: identity.primary,
          },
        },
      },
      MuiAccordionDetails: {
        styleOverrides: {
          root: {
            padding: '20px',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '12px',
            letterSpacing: '0.02em',
            transition: 'all 0.2s ease',
          },
          outlined: {
            borderColor: `rgba(${hexToRgb(identity.primary)}, 0.4)`,
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: `rgba(${hexToRgb(identity.primary)}, 0.08)`,
            },
          },
          filled: {
            backgroundColor: `rgba(${hexToRgb(identity.primary)}, 0.15)`,
            color: identity.primary,
            '&:hover': {
              backgroundColor: `rgba(${hexToRgb(identity.primary)}, 0.25)`,
            },
          },
          colorPrimary: {
            backgroundColor: `rgba(${hexToRgb(identity.primary)}, 0.15)`,
            color: identity.primary,
          },
          colorSuccess: {
            backgroundColor: 'rgba(0, 255, 136, 0.12)',
            color: '#00FF88',
          },
          colorError: {
            backgroundColor: 'rgba(255, 65, 54, 0.12)',
            color: '#FF4136',
          },
          colorWarning: {
            backgroundColor: 'rgba(255, 183, 0, 0.12)',
            color: '#FFB700',
          },
          deleteIcon: {
            color: 'inherit',
            opacity: 0.7,
            '&:hover': {
              opacity: 1,
              color: 'inherit',
            },
          },
          sizeSmall: {
            height: '24px',
            fontSize: '11px',
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            backgroundColor: `rgba(${hexToRgb(identity.primary)}, 0.1)`,
            borderRadius: '2px',
          },
          bar: {
            background: `linear-gradient(90deg, ${identity.secondary} 0%, ${identity.primary} 100%)`,
            boxShadow: glowMultiplier > 0 
              ? `0 0 ${10 * glowMultiplier}px rgba(${hexToRgb(identity.glow)}, 0.5)`
              : 'none',
          },
        },
      },
      MuiCircularProgress: {
        styleOverrides: {
          root: {
            color: identity.primary,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: 'rgba(15, 15, 25, 0.95)',
            border: `1px solid rgba(${hexToRgb(identity.primary)}, 0.3)`,
            backdropFilter: 'blur(10px)',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: 'rgba(15, 15, 25, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `1px solid rgba(${hexToRgb(identity.primary)}, 0.3)`,
            boxShadow: glowMultiplier > 0 
              ? `0 0 ${40 * glowMultiplier}px rgba(${hexToRgb(identity.glow)}, 0.2)`
              : 'none',
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            backgroundColor: 'rgba(15, 15, 25, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `1px solid rgba(${hexToRgb(identity.primary)}, 0.2)`,
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: `rgba(${hexToRgb(identity.primary)}, 0.3)`,
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: `rgba(${hexToRgb(identity.primary)}, 0.5)`,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: identity.primary,
            },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: identity.primary,
              '& + .MuiSwitch-track': {
                backgroundColor: identity.secondary,
              },
            },
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            backgroundColor: identity.primary,
            boxShadow: glowMultiplier > 0 
              ? `0 0 ${10 * glowMultiplier}px rgba(${hexToRgb(identity.glow)}, 0.5)`
              : 'none',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            color: 'rgba(232, 232, 232, 0.6)',
            '&.Mui-selected': {
              color: identity.primary,
            },
          },
        },
      },
    },
  });
}

// Helper to convert hex to RGB values
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '0, 255, 255';
}

// Load saved preferences
function loadSavedIdentity(): IdentityName {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_IDENTITY);
    if (saved && saved in IDENTITIES) {
      return saved as IdentityName;
    }
  } catch {
    // localStorage not available
  }
  return 'TRON';
}

function loadSavedGlowLevel(): GlowLevel {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_GLOW);
    if (saved) {
      const level = parseInt(saved, 10);
      if (level >= 0 && level <= 3) {
        return level as GlowLevel;
      }
    }
  } catch {
    // localStorage not available
  }
  return 2;
}

interface TronThemeProviderProps {
  children: ReactNode;
}

export function TronThemeProvider({ children }: TronThemeProviderProps) {
  const [identityName, setIdentityName] = useState<IdentityName>(loadSavedIdentity);
  const [glowLevel, setGlowLevelState] = useState<GlowLevel>(loadSavedGlowLevel);

  const identity = IDENTITIES[identityName];

  const theme = useMemo(() => createTronTheme(identity, glowLevel), [identity, glowLevel]);

  const setIdentity = useCallback((name: IdentityName) => {
    setIdentityName(name);
    try {
      localStorage.setItem(STORAGE_KEY_IDENTITY, name);
    } catch {
      // localStorage not available
    }
  }, []);

  const setGlowLevel = useCallback((level: GlowLevel) => {
    setGlowLevelState(level);
    try {
      localStorage.setItem(STORAGE_KEY_GLOW, level.toString());
    } catch {
      // localStorage not available
    }
  }, []);

  // Update CSS variables when theme changes
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--tron-primary', identity.primary);
    root.style.setProperty('--tron-secondary', identity.secondary);
    root.style.setProperty('--tron-glow', identity.glow);
    root.style.setProperty('--tron-accent', identity.accent);
    root.style.setProperty('--tron-glow-multiplier', [0, 0.5, 1, 1.5][glowLevel].toString());
  }, [identity, glowLevel]);

  const contextValue = useMemo<TronThemeContextType>(() => ({
    identity,
    glowLevel,
    setIdentity,
    setGlowLevel,
    theme,
  }), [identity, glowLevel, setIdentity, setGlowLevel, theme]);

  return (
    <TronThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </TronThemeContext.Provider>
  );
}

export function useTronTheme() {
  const context = useContext(TronThemeContext);
  if (!context) {
    throw new Error('useTronTheme must be used within a TronThemeProvider');
  }
  return context;
}

export { TronThemeContext };
