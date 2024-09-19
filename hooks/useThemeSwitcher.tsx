import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
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
            main: '#D4E815',
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