'use client'
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { styled, alpha, useTheme, createTheme, ThemeProvider, useThemeProps } from '@mui/material/styles';
import AccountButton from '../components/accountButton';
import LogoDark from '../public/icon-green.png';
import Logo from '../assets/images/logo-black.png';
import { Typography, InputBase, AppBar, Box, Button, Toolbar, FormControlLabel, FormGroup, Switch, Stack, Divider, List, ListItem, ListItemButton, ListItemText, Drawer, IconButton, useMediaQuery, CssBaseline, Menu, MenuItem, ButtonGroup } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { Menu as MenuIcon, ArrowBack, Check, X as XIcon, LightMode, DarkMode } from '@mui/icons-material'
import CTA from '@/components/ui/cta';
import { useAccount, useDisconnect } from 'wagmi';
import { useThemeSwitcher } from '@/hooks/useThemeSwitcher';
import { getTextColor } from '@/service/theme';
import SocialIcons from '@/components/ui/socialIcons';
import LanguageSelect from '@/components/ui/languageSelect';
import { useLanguage } from '@/hooks/useLanguage';
import languageData from '@/metadata/translations';
import { useMixpanel } from '@/hooks/useMixpanel';
//import HeaderSwitch from './ThemeMode';


const drawerWidth = 240;
function Header() {
  const mixpanel = useMixpanel();
  const searchParams = useSearchParams()
  const { language } = useLanguage();
  const navItems = [
    languageData[language].ui.swap_menu,
    languageData[language].ui.ramp_menu,
    languageData[language].ui.index_fund_menu,
    languageData[language].Menu.faq
  ];
  const wallet = searchParams.get('wallet');
  const page = searchParams.get('page');
  const router = useRouter();
  const theme = useTheme();
  const textColor = getTextColor(theme);
  const themeSwitcher = useThemeSwitcher();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  const [mobileOpen, setMobileOpen] = useState(false);
  const url = 'xucre.expo.client://ViewWallet';
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleModeChange = () => {
    themeSwitcher();
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const goBack = () => {
    window.location.assign(url);
  }

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const navigateTo = (type) => {
    if (type === navItems[0]) {
      router.replace(`/swap?wallet=${wallet}&page=${type}`)
    } else if (type === navItems[1]) {
      router.replace(`/ramp?wallet=${wallet}&page=${type}`)
    } else if (type === navItems[2]) {
      router.replace('/index-fund')
    } else if (type === navItems[3]) {
      router.replace('/about-us')
    }
  }

  useEffect(() => {
    if (mixpanel && address) {
      mixpanel.identify(address);
    }
  }, [mixpanel, address])

  const headerButton = (
    <Button variant="text" onClick={() => router.push('/')} >
      <Stack direction={'row'} spacing={2} alignItems={'center'} justifyContent={'center'}>
        <img src={'/icon-green.png'} className="side-image" alt="menuLogo" />
        {/*<Typography color={theme.palette.mode === 'dark' ? 'white' : 'black'} textTransform={'none'} fontSize={24} fontWeight={'400'} ></Typography>*/}
      </Stack>
    </Button>
  );

  const Social = () => (
    <SocialIcons discordUrl={'https://discord.gg/F4gaehZ7'} emailUrl={'mailto:support@xucre.io'} twitterUrl={'https://x.com/WalletXucre'} githubUrl={null} instagramUrl={null} governanceUrl={null} websiteUrl={'https://linktr.ee/xucrewallet'} gitbookUrl={null} />
  );

  const drawer = (
    <Stack direction={'column'} justifyContent={'center'} alignItems={'center'} spacing={2} onClick={handleDrawerToggle} sx={{ textAlign: 'center', zIndex: 100000 }}>
      {wallet !== 'xucre' && headerButton}
      <Divider />

      <Stack direction={'row'} my={2} justifyItems={'center'} alignContent={'center'} mx={'auto'} display={'block'} width={'fit-content'}>
        <AccountButton />
      </Stack>

      <List>
        {navItems.map((item) => (
          <ListItem key={item} disablePadding>
            <ListItemButton sx={{ textAlign: 'center' }} onClick={() => navigateTo(item)}>
              <ListItemText primary={item} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <LanguageSelect type={'button'} />
      <IconButton
        color={theme.palette.mode === 'dark' ? 'warning' : 'info'}
        aria-label="change theme"
        edge="start"
        onClick={handleModeChange}
        sx={{ ml: 2, }}
      >
        {theme.palette.mode === 'dark' ? <LightMode /> : <DarkMode />}
      </IconButton>
      <Social />
      <CTA type={'sidebar'} />
    </Stack>
  );

  return (
    <>
      {wallet !== 'xucre' &&
        <AppBar component="nav" position="relative" color={'transparent'} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, boxShadow: 'none', borderBottom: '1px solid', borderBottomColor: 'GrayText', mb: { xs: 0, sm: 0 } }}>
          <Toolbar sx={{ justifyContent: 'space-between', alignItems: 'center' }}>

            <Box sx={{ flexGrow: 2 }}>
              {headerButton}
            </Box>

            <ButtonGroup variant="text" size="large" color={'inherit'} aria-label="Basic button group" sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }}>
              {navItems.map((item) => (
                <Button onClick={() => navigateTo(item)} key={item} variant={'text'} sx={{ textTransform: 'capitalize', letterSpacing: 2 }}>{item}</Button>
              ))}
            </ButtonGroup>
            <Stack direction={'row'} sx={{ flexGrow: 1 }} alignContent={'end'} justifyContent={'end'}>
              <Box sx={{}}>
                {isAuthenticated && <Auth0Button />}
              </Box>
              <IconButton
                color={theme.palette.mode === 'dark' ? 'warning' : 'info'}
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { md: 'none' }, }}
              >
                {theme.palette.mode === 'dark' ? <LightMode /> : <DarkMode />}
              </IconButton>
              <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                {
                  <AccountButton />
                }

                <IconButton
                  color={theme.palette.mode === 'dark' ? 'warning' : 'info'}
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleModeChange}
                  sx={{ ml: 2, }}
                >
                  {theme.palette.mode === 'dark' ? <LightMode /> : <DarkMode />}
                </IconButton>

                <LanguageSelect type={'menu'} />

                <IconButton
                  color={theme.palette.mode === 'dark' ? 'warning' : 'info'}
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleMenuOpen}
                  sx={{ ml: 2, display: { xs: 'block', sm: 'none' }, }}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  id="basic-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleMenuClose}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button',
                  }}
                >
                  {navItems.map((item) => (
                    <MenuItem onClick={() => navigateTo(item)} key={item}>{item}</MenuItem>
                  ))}
                </Menu>
              </Box>

            </Stack>

          </Toolbar>
          {theme.palette.mode === 'light' && <Divider />}
        </AppBar>
      }

      {wallet === 'xucre' && false &&
        <AppBar component="nav" position="relative" color={'transparent'} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, boxShadow: 'none' }}>
          <Toolbar >

            <Box sx={{ flexGrow: 1 }}>
              {false &&
                <IconButton
                  color={theme.palette.mode === 'dark' ? 'warning' : 'info'}
                  aria-label="go back"
                  edge="start"
                  onClick={goBack}
                  sx={{ mr: 2, display: { sm: 'none' }, }}
                >
                  <ArrowBack />
                </IconButton>
              }
              {isConnected && false && <Check color={'success'} />}
              {!isConnected && false && <XIcon color={'warning'} />}

            </Box>

            <Stack direction={'row'} sx={{ flexGrow: 1 }} alignContent={'end'} justifyContent={'end'}>
              {!isConnected && <AccountButton />}
              {isConnected && false && <Button onClick={() => { disconnect() }} variant={'contained'}>Desconectar</Button>}
              {isConnected &&
                <IconButton
                  color={theme.palette.mode === 'dark' ? 'warning' : 'info'}
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2, display: { sm: 'none' }, }}
                >
                  <MenuIcon />
                </IconButton>
              }
            </Stack>
          </Toolbar>
        </AppBar>
      }

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          zIndex: 10000,
          '& .MuiDrawer-paper': { width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
    </>

  );
}
// 
export default Header;