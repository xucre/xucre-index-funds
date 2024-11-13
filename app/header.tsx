'use client'
import { use, useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Typography, AppBar, Box, Button, Toolbar, Stack, Divider, Drawer, IconButton, Menu, MenuItem, ButtonGroup } from '@mui/material';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Menu as MenuIcon, LightMode, DarkMode } from '@mui/icons-material'
import { useAccount, useDisconnect } from 'wagmi';
import { useThemeSwitcher } from '@/hooks/useThemeSwitcher';
import { getTextColor } from '@/service/theme';
import SocialIcons from '@/components/ui/socialIcons';
import LanguageSelect from '@/components/ui/languageSelect';
import { useLanguage } from '@/hooks/useLanguage';
import languageData from '@/metadata/translations';
import { useMixpanel } from '@/hooks/useMixpanel';
import { SignedIn, SignedOut, useOrganization, UserButton, useUser, OrganizationSwitcher } from '@clerk/nextjs';
//import HeaderSwitch from './ThemeMode';
import { dark } from "@clerk/themes";
import { useIsAdmin } from '../hooks/useIsAdmin';
import AccountButton from '@/components/accountButton';
import {useOrganizationWallet} from '@/hooks/useOrganizationWallet';


const drawerWidth = 240;
function Header() {
  const mixpanel = useMixpanel();
  const { user } = useUser();
  const { organization } = useOrganization();
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { language } = useLanguage();
  const navItems = [
    //languageData[language].Menu.home,
    languageData[language].Menu.dashboard,
    languageData[language].Menu.index_funds//,
    //languageData[language].Menu.faq
  ];
  const adminNavItems = [
    //languageData[language].Menu.home,
    languageData[language].Menu.dashboard,
    languageData[language].Menu.index_funds,
    //languageData[language].Menu.index_builder,
    //languageData[language].Menu.faq,
    languageData[language].Menu.organization,
    languageData[language].Menu.billing,
  ];
  const publicNavItems = [
    languageData[language].Menu.home,
    languageData[language].Menu.index_funds,
    languageData[language].Menu.faq
  ]
  const page = searchParams.get('page');
  const router = useRouter();
  const theme = useTheme();
  const textColor = getTextColor(theme);
  const themeSwitcher = useThemeSwitcher();
  const { isConnected, address } = useAccount();
  const { hasEscrowAddress, loading : isOrganizationWalletLoading } = useOrganizationWallet();
  const { isAdmin } = useIsAdmin();

  const [mobileOpen, setMobileOpen] = useState(false);
  const url = 'xucre.expo.client://ViewWallet';
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const isDarkTheme = theme.palette.mode === 'dark';
  const hideLoginButton =  pathname === '/' || pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/forgot-password' || pathname === '/reset-password' || pathname === '/verify-email'
  const isHome = pathname === '/';

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

  const handleUserOpen = (event: React.MouseEvent<HTMLButtonElement>) => { }

  const navigateTo = (type) => {
    if (type === languageData[language].Menu.index_funds) {
      router.replace('/index-fund')
    } else if (type === languageData[language].Menu.faq) {
      router.replace('/about-us')
    } else if (type === languageData[language].Menu.organization) {
      router.replace('/organization')
    } else if (type === languageData[language].Menu.billing) {
      router.replace('/billing')
    } else if (type === languageData[language].Menu.index_builder) {
      router.replace('/index-builder')
    } else if (type === languageData[language].Menu.dashboard) {
      router.replace('/dashboard')
    } else if (type === languageData[language].Menu.home) {
      router.replace('/')
    }
  }

  useEffect(() => {
    if (mixpanel && address) {
      mixpanel.identify(address);
    }
  }, [mixpanel, address])

  useEffect(() => {
    if (isAdmin && !hasEscrowAddress && !isOrganizationWalletLoading) {
      router.replace('/organization')
    }
  }, [isAdmin, hasEscrowAddress, isOrganizationWalletLoading])

  const headerButton = (
    <Button variant="text" onClick={() => router.push('/')} >
      <Stack direction={'row'} spacing={2} alignItems={'center'} justifyContent={'center'}>
        <img src={'/icon_new2.png'} className="side-image" alt="menuLogo" />
        {<Typography color={theme.palette.mode === 'dark' ? 'white' : 'black'} textTransform={'none'} fontSize={24} fontWeight={'400'} >{languageData[language].Home.title_2}</Typography>}
      </Stack>
    </Button>
  );

  const Social = () => (
    <SocialIcons discordUrl={'https://discord.gg/F4gaehZ7'} emailUrl={'mailto:support@xucre.io'} twitterUrl={'https://x.com/WalletXucre'} githubUrl={null} instagramUrl={null} governanceUrl={null} websiteUrl={'https://linktr.ee/xucrewallet'} gitbookUrl={null} />
  );

  const drawer = (
    <Stack direction={'column'} justifyContent={'space-between'} alignItems={'center'} spacing={2} onClick={handleDrawerToggle} sx={{ textAlign: 'center', zIndex: 100000, height: '95vh' }}>
      <Box width={'100%'}>
        {/*<Stack direction={'row'} my={2} justifyItems={'center'} alignContent={'center'} mx={'auto'} display={'block'} width={'fit-content'}>
        <AccountButton />
      </Stack>*/}
        <SignedIn>
          {isAdmin &&
            <ButtonGroup variant="text" size="large" color={'inherit'} aria-label="Basic button group" sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', alignItems: 'center' }}>
              {adminNavItems.map((item) => (
                <Button onClick={() => navigateTo(item)} key={item} variant={'text'} sx={{ textTransform: 'capitalize', letterSpacing: 2 }}>{item}</Button>
              ))}
            </ButtonGroup>
          }
          {!isAdmin &&
            <ButtonGroup variant="text" size="large" color={'inherit'} aria-label="Basic button group" sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', alignItems: 'center' }}>
              {navItems.map((item) => (
                <Button onClick={() => navigateTo(item)} key={item} variant={'text'} sx={{ textTransform: 'capitalize', letterSpacing: 2 }}>{item}</Button>
              ))}
            </ButtonGroup>
          }
        </SignedIn>
      </Box>
      <Stack direction={'column'} spacing={2} width={'100%'} alignItems={'center'}>

        <SignedOut>
          {!hideLoginButton &&
            <AccountButton />
          }          
        </SignedOut>
        <LanguageSelect type={'button'} />

        <IconButton
          color={theme.palette.mode === 'dark' ? 'default' : 'default'}
          aria-label="change theme"
          edge="start"
          onClick={handleModeChange}
          sx={{ ml: 2, }}
        >
          {theme.palette.mode === 'dark' ? <LightMode /> : <DarkMode />}
        </IconButton>

        <Social />
      </Stack>
    </Stack>
  );

  return (
    <div>
      {user && 
        <>
          <AppBar component="nav" position="relative" color={'transparent'} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, boxShadow: 'none', borderBottom: '0px solid', borderBottomColor: 'GrayText', mb: { xs: 0, sm: 0 } }}>
            <Toolbar sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{}}>
                {!isHome && headerButton}
              </Box>

              {/* <SignedIn>
                {isAdmin &&
                  <ButtonGroup variant="text" size="large" color={'inherit'} aria-label="Basic button group" sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', alignItems: 'center' }}>
                    {adminNavItems.map((item) => (
                      <Button onClick={() => navigateTo(item)} key={item} variant={'text'} sx={{ textTransform: 'capitalize', letterSpacing: 2 }}>{item}</Button>
                    ))}
                  </ButtonGroup>
                }
                {!isAdmin &&
                  <ButtonGroup variant="text" size="large" color={'inherit'} aria-label="Basic button group" sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', alignItems: 'center' }}>
                    {navItems.map((item) => (
                      <Button onClick={() => navigateTo(item)} key={item} variant={'text'} sx={{ textTransform: 'capitalize', letterSpacing: 2 }}>{item}</Button>
                    ))}
                  </ButtonGroup>
                }
              </SignedIn>
              <SignedOut>
                <ButtonGroup variant="text" size="large" color={'inherit'} aria-label="Basic button group" sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', alignItems: 'center' }}>
                  {publicNavItems.map((item) => (
                    <Button onClick={() => navigateTo(item)} key={item} variant={'text'} sx={{ textTransform: 'capitalize', letterSpacing: 2 }}>{item}</Button>
                  ))}
                </ButtonGroup>
              </SignedOut> */}

              <Stack direction={'row'} sx={{}} alignContent={'end'} justifyContent={'end'}>
                <Box sx={{}}>
                </Box>
                <Box sx={{ mr: 4, mt: 1, display: { xs: 'block', sm: 'none' } }}>
                  <SignedIn>
                    {user && user.publicMetadata.superAdmin &&
                      <OrganizationSwitcher
                        appearance={{
                          baseTheme: isDarkTheme ? dark : undefined,
                        }}
                        organizationProfileProps={{
                          appearance: {
                            baseTheme: isDarkTheme ? dark : undefined,
                          }
                        }}
                        organizationProfileMode='navigation'
                        organizationProfileUrl='/organization'
                      />
                    }
                    {user && !user.publicMetadata.superAdmin &&
                      <UserButton
                        appearance={{
                          baseTheme: isDarkTheme ? dark : undefined,
                        }}
                        userProfileProps={{
                          appearance: {
                            baseTheme: isDarkTheme ? dark : undefined,
                          }
                        }}
                        userProfileUrl='/settings'
                        userProfileMode='navigation'
                      />
                    }
                  </SignedIn>
                </Box>
                <IconButton
                  color={theme.palette.mode === 'dark' ? 'default' : 'default'}
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2, display: { md: 'none' }, }}
                >
                  <MenuIcon />
                </IconButton>

                <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                  {
                    /*<AccountButton />*/
                  }

                  <SignedIn>
                    <Stack direction={'row'} spacing={2} alignItems={'center'} justifyContent={'center'}>
                      {user && user.publicMetadata.superAdmin &&
                        <OrganizationSwitcher
                          appearance={{
                            baseTheme: isDarkTheme ? dark : undefined,
                          }}
                          organizationProfileProps={{
                            appearance: {
                              baseTheme: isDarkTheme ? dark : undefined,
                            }
                          }}
                          hidePersonal={true}
                          organizationProfileMode='navigation'
                          organizationProfileUrl='/organization'
                        />
                      }
                      <Box sx={{width: 20}}/>
                      {user &&
                        <UserButton
                          appearance={{
                            baseTheme: isDarkTheme ? dark : undefined,
                          }}
                          userProfileProps={{
                            appearance: {
                              baseTheme: isDarkTheme ? dark : undefined,
                            }
                          }}
                          userProfileUrl='/settings'
                          userProfileMode='navigation'
                          
                        />
                      }
                    </Stack>
                  </SignedIn>
                  {/* <AccountButton /> */}
                  <IconButton
                    color={theme.palette.mode === 'dark' ? 'default' : 'default'}
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
            {/* {theme.palette.mode === 'light' && <Divider />} */}
          </AppBar>    

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
      }
      
    </div>

  );
}
// 
export default Header;