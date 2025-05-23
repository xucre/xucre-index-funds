'use client'
import { use, useEffect, useRef, useState } from 'react';
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
import languageData, { Language } from '@/metadata/translations';
import { useMixpanel } from '@/hooks/useMixpanel';
import { SignedIn, SignedOut, UserButton, OrganizationSwitcher } from '@clerk/nextjs';
//import HeaderSwitch from './ThemeMode';
import { dark } from "@clerk/themes";
import { useIsAdmin } from '../hooks/useIsAdmin';
import AccountButton from '@/components/accountButton';
import {useOrganizationWallet} from '@/hooks/useOrganizationWallet';
import { KnockFeedProvider, KnockI18nProvider, KnockProvider, NotificationFeedPopover, NotificationIconButton, I18nContent, Translations } from '@knocklabs/react';
import { syncKnock } from '@/service/knock';
import { useClerkUser } from '@/hooks/useClerkUser';
import AppMenu from '@/components/ui/AppMenu';


const drawerWidth = 240;

const knockPublicKey = process.env.NEXT_PUBLIC_KNOCK_API_KEY as string;
const knockInternalChannelId = process.env.NEXT_PUBLIC_KNOCK_IN_APP_MESSAGE_CHANNEL_ID as string;

function Header() {
  const mixpanel = useMixpanel();
  const { user } = useClerkUser();
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
  const { isAdmin, isSuperAdmin } = useIsAdmin();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const url = 'xucre.expo.client://ViewWallet';
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const notifButtonRef = useRef(null);
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
      router.replace('/fund')
    } else if (type === languageData[language].Menu.faq) {
      router.replace('/support')
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
    if (user) {
      syncKnock(user.id, user.fullName ? user.fullName : '', user.primaryEmailAddress ? user.primaryEmailAddress.emailAddress : '');
    }
  }, [user])

  const headerButton = (
    <Button variant="text" onClick={() => router.push('/dashboard')} >
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
          <Box minWidth={200} justifyItems={'center'}>
            <AppMenu />
          </Box>
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

  const languageCode = language === Language.EN ? 'en' : language === Language.ES ? 'es' : 'pt';
        
  return (
    <div>
      {true && 
        <KnockProvider
          apiKey={knockPublicKey}
          userId={user ? user.id : 'unknown'}
        >
          <KnockI18nProvider i18n={{
            translations: {
              notifications: languageData[language].Notifications.notifications,
              markAllAsRead: languageData[language].Notifications.markAllAsRead,
              archiveRead: languageData[language].Notifications.archiveRead,
              emptyFeedTitle: languageData[language].Notifications.emptyFeedTitle,
              emptyFeedBody: languageData[language].Notifications.emptyFeedBody,
              poweredBy: languageData[language].Notifications.poweredBy,
              archiveNotification: languageData[language].Notifications.archiveNotification,
              all: languageData[language].Notifications.all,
              unread: languageData[language].Notifications.unread,
              read: languageData[language].Notifications.read,
              unseen: languageData[language].Notifications.unseen,
            },
            locale: languageCode,
          } as I18nContent}>
            <KnockFeedProvider feedId={knockInternalChannelId} colorMode={theme.palette.mode}>
              <AppBar component="nav" position="relative" color={'transparent'} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, boxShadow: 'none', borderBottom: '0px solid', borderBottomColor: 'GrayText', mb: { xs: 0, sm: 0 } }}>
                <Toolbar sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{}}>
                    {!isHome && headerButton}
                  </Box>

                  <Stack direction={'row'} sx={{}} alignContent={'end'} justifyContent={'end'}>
                    <Box sx={{}}>
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
                        <Stack direction={'row'} spacing={2} alignItems={'center'} justifyContent={'center'} sx={{ display: { xs: 'none', md: 'flex' } }}>
                          {
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
                              hidePersonal={false}
                              afterSelectOrganizationUrl={'/billing'}
                              afterSelectPersonalUrl={'/dashboard'}
                            />
                          }
                          <NotificationIconButton
                            ref={notifButtonRef}
                            onClick={(e) => setIsNotificationOpen(!isNotificationOpen)}
                          />
                          <NotificationFeedPopover
                            buttonRef={notifButtonRef}
                            isVisible={isNotificationOpen}
                            onClose={() => setIsNotificationOpen(false)}
                          />
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
                              userProfileMode='modal'
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
                        sx={{ ml: 2, display: { xs: 'block', md: 'none' }, }}
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
            </KnockFeedProvider>
          </KnockI18nProvider>
        </KnockProvider>
      }
      
    </div>

  );
}
// 
export default Header;