import { ThemeProvider } from '@emotion/react';
import { DarkMode, LightMode } from '@mui/icons-material';
import { createTheme, IconButton, useTheme } from '@mui/material';
import React, { useEffect } from 'react';

const ThemeSwitcherContext = React.createContext(function toggleColorMode() { });

export const useThemeSwitcher = () => React.useContext(ThemeSwitcherContext);

export const ThemeSwitcherProvider = ({ children }: { children: any }) => {
  const [mode, setMode] = React.useState<'light' | 'dark'>('dark');
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
    }),
    [],
  );

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          //mode: 'dark',
          mode: mode,
          primary: {
            main: mode === 'dark' ? '#D4E815' : '#1B1E3F',
          },
          secondary: {
            main: '#1B1E3F',
          },
          warning: {
            main: '#ffffff'
          },
          info: {
            main: '#000000'
          }
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                minHeight: '100vh',
                backgroundColor: mode === 'dark' ? '#010101' : '#ffffff', // '#1b6756'
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundImage: mode === 'dark' ? 'radial-gradient(at left top, #010101, #084D3E)' : 'radial-gradient(at left top, #77af3a, #ffffff, #77af3a)',
              },
            },
          },
        }
      }),
    [mode],
  );
  useEffect(() => {
    const existingItem = localStorage.getItem('color-mode');
    if (existingItem) {
      setMode(existingItem as 'light' | 'dark');
    }
  }, [])

  const toggleColorMode = () => {
    localStorage.setItem('color-mode', mode === 'light' ? 'dark' : 'light');
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  }

  return <ThemeSwitcherContext.Provider value={toggleColorMode}><ThemeProvider theme={theme}>{children}</ThemeProvider></ThemeSwitcherContext.Provider>
};


export const ThemeSwitcherElement = () => {
  const theme = useTheme();
  const toggleColorMode = useThemeSwitcher();

  return (
    <IconButton
      color={theme.palette.mode === 'dark' ? 'warning' : 'info'}
      aria-label="open drawer"
      edge="start"
      onClick={toggleColorMode}
      sx={{ ml: 2, }}
    >
      {theme.palette.mode === 'dark' ? <LightMode /> : <DarkMode />}
    </IconButton>
  );
}