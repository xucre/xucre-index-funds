import { ThemeProvider } from '@emotion/react';
import { DarkMode, LightMode } from '@mui/icons-material';
import { createTheme, IconButton, useTheme } from '@mui/material';
import React, { useEffect } from 'react';
import { useAppKitTheme } from '@reown/appkit/react'

const ThemeSwitcherContext = React.createContext(function toggleColorMode() { });

export const useThemeSwitcher = () => React.useContext(ThemeSwitcherContext);

export const ThemeSwitcherProvider = ({ children }: { children: any }) => {
  const [mode, setMode] = React.useState<'light' | 'dark'>('dark');
  const { themeMode, themeVariables, setThemeMode, setThemeVariables } = useAppKitTheme()

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          //mode: 'dark',
          mode: mode,
          primary: {
            //main: mode === 'dark' ? '#D4E815' : '#1B1E3F',
            main: '#00872a'
          },
          secondary: {
            main: '#1B1E3F',
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
                backgroundImage: mode === 'dark' ? 'radial-gradient(at left top, #010101, #084D3E)' : 'transparent', // radial-gradient(at left top, #C2EB96, #084D3E, #C2EB96)
                '&:before': mode === 'light' ? { 
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundSize: '20px 20px',
                  pointerEvents: 'none',
                  zIndex: -1,
                  backgroundRepeat: 'repeat',
                  backgroundImage: 'radial-gradient(rgba(37, 165, 137, 0.5) 1px, transparent 1px)' 
                } : {}
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
      setThemeMode(existingItem as 'light' | 'dark')
    }

    // setThemeVariables({
    //   '--w3m-color-mix': '#00872a',
    //   '--w3m-color-mix-strength': 40
    // })
  }, [])

  const toggleColorMode = () => {
    const colorMode = mode === 'light' ? 'dark' : 'light';
    localStorage.setItem('color-mode', colorMode);
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    setThemeMode(colorMode);
  }

  return <ThemeSwitcherContext.Provider value={toggleColorMode}><ThemeProvider theme={theme}>{children}</ThemeProvider></ThemeSwitcherContext.Provider>
};


export const ThemeSwitcherElement = () => {
  const theme = useTheme();
  const toggleColorMode = useThemeSwitcher();

  return (
    <IconButton
      color={theme.palette.mode === 'dark' ? 'inherit' : 'inherit'}
      aria-label="open drawer"
      edge="start"
      onClick={toggleColorMode}
      sx={{ ml: 2, }}
    >
      {theme.palette.mode === 'dark' ? <LightMode /> : <DarkMode />}
    </IconButton>
  );
}