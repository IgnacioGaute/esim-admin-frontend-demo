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
            borderRadius: '4px',
            padding: '10px 24px',
            transition: 'all 0.3s ease',
          },
          contained: {
            background: `linear-gradient(135deg, ${identity.primary} 0%, ${identity.secondary} 100%)`,
            boxShadow: glowMultiplier > 0 
              ? `0 0 ${20 * glowMultiplier}px rgba(${hexToRgb(identity.glow)}, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)`
              : 'none',
            '&:hover': {
              boxShadow: `0 0 ${30 * glowMultiplier}px rgba(${hexToRgb(identity.glow)}, 0.6)`,
              transform: 'translateY(-1px)',
            },
          },
          outlined: {
            borderColor: identity.primary,
            color: identity.primary,
            borderWidth: '1px',
            '&:hover': {
              borderColor: identity.glow,
              backgroundColor: `rgba(${hexToRgb(identity.primary)}, 0.1)`,
              boxShadow: glowMultiplier > 0 
                ? `0 0 ${15 * glowMultiplier}px rgba(${hexToRgb(identity.glow)}, 0.3), inset 0 0 ${10 * glowMultiplier}px rgba(${hexToRgb(identity.glow)}, 0.1)`
                : 'none',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(15, 15, 25, 0.6)',
              backdropFilter: 'blur(10px)',
              '& fieldset': {
                borderColor: `rgba(${hexToRgb(identity.primary)}, 0.3)`,
                transition: 'all 0.3s ease',
              },
              '&:hover fieldset': {
                borderColor: `rgba(${hexToRgb(identity.primary)}, 0.5)`,
              },
              '&.Mui-focused fieldset': {
                borderColor: identity.primary,
                boxShadow: glowMultiplier > 0 
                  ? `0 0 ${10 * glowMultiplier}px rgba(${hexToRgb(identity.glow)}, 0.3)`
                  : 'none',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(232, 232, 232, 0.6)',
              '&.Mui-focused': {
                color: identity.primary,
              },
            },
            '& .MuiInputBase-input': {
              color: '#E8E8E8',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: 'rgba(15, 15, 25, 0.8)',
            backdropFilter: 'blur(20px)',
            border: `1px solid rgba(${hexToRgb(identity.primary)}, 0.2)`,
            boxShadow: glowMultiplier > 0 
              ? `0 0 ${20 * glowMultiplier}px rgba(${hexToRgb(identity.glow)}, 0.1)`
              : 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              border: `1px solid rgba(${hexToRgb(identity.primary)}, 0.4)`,
              boxShadow: glowMultiplier > 0 
                ? `0 0 ${30 * glowMultiplier}px rgba(${hexToRgb(identity.glow)}, 0.15)`
                : 'none',
            },
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
            borderColor: `rgba(${hexToRgb(identity.primary)}, 0.15)`,
          },
          head: {
            backgroundColor: 'rgba(15, 15, 25, 0.9)',
            color: identity.primary,
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: `rgba(${hexToRgb(identity.primary)}, 0.05)`,
            },
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: '4px',
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
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '4px',
          },
          outlined: {
            borderColor: `rgba(${hexToRgb(identity.primary)}, 0.5)`,
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
