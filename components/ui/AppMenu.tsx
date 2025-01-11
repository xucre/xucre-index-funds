import React, { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Badge,
  Box,
  SpeedDial,
  SpeedDialAction,
  Stack,
  useTheme,
} from '@mui/material';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CasesOutlinedIcon from '@mui/icons-material/CasesOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import anime from 'animejs';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';
import { useSFDC } from '@/hooks/useSFDC';
import { isNull } from '@/service/helpers';
import { SignOutButton, useAuth } from '@clerk/nextjs';

const AppMenu: React.FC = () => {
  const {language} = useLanguage();
  const {isAdmin, isSuperAdmin} = useIsAdmin();
  const {signOut} = useAuth();
  //const isAdmin = false;
  const [isOpen, setIsOpen] = React.useState(true);
  const router = useRouter();
  const theme = useTheme();
  const pathname = usePathname();
  const {sfdcUser, isLoaded} = useSFDC();
  const [isOnboardingComplete, setIsOnboardingComplete] = React.useState(false);
  const [hideHighlight, setHideHighlight] = React.useState(false);
  const [staticRef, setStaticRef] = React.useState<React.RefObject<HTMLButtonElement>>();
  useEffect(() => {
    if (isLoaded) {
      const _isOnboardingComplete = !isNull(sfdcUser.lastName) && !isNull(sfdcUser.firstName) && !isNull(sfdcUser.street) && !isNull(sfdcUser.riskTolerance) && !isNull(sfdcUser.salaryContribution)
      setIsOnboardingComplete(_isOnboardingComplete);
    }    
  }, [sfdcUser, isLoaded]);
  const menuGroups = React.useMemo(
    () => [
      {
        items: [
          {
            icon: <HomeOutlinedIcon />,
            name: 'Home',
            apiName: 'dashboard',
            path: '/dashboard',
            ref: React.createRef<HTMLButtonElement>(),
          },
          {
            icon: <AccountBalanceWalletOutlinedIcon />,
            name: 'Balance',
            apiName: 'balance',
            path: '/dashboard/balances',
            ref: React.createRef<HTMLButtonElement>(),
          },
          {
            icon: <FormatListBulletedOutlinedIcon />,
            name: 'Transactions',
            apiName: 'transactions',
            path: '/dashboard/transactions',
            ref: React.createRef<HTMLButtonElement>(),
          },
        ],
      },
      {
        items: [
          {
            icon: <CasesOutlinedIcon />,
            name: 'Funds',
            apiName: 'fund',
            path: '/fund',
            ref: React.createRef<HTMLButtonElement>(),
          }
        ],
      },
      {
        items: [
          {
            icon: <HelpOutlineOutlinedIcon />,
            name: 'Help',
            apiName: 'help',
            path: '/support',
            ref: React.createRef<HTMLButtonElement>(),
          },
          {
            icon: isOnboardingComplete ? <SettingsOutlinedIcon /> : <Badge badgeContent={"!"} color="warning" overlap="circular" variant="dot"><SettingsOutlinedIcon /></Badge>,
            name: 'Settings',
            apiName: 'settings',
            path: '/settings',
            ref: React.createRef<HTMLButtonElement>(),
          },
          {
            icon: <LogoutIcon />,
            name: 'Sign Out',
            apiName: 'sign_out',
            path: '/sign-out',
            content: <SignOutButton />,
            ref: React.createRef<HTMLButtonElement>(),
          },
          
        ],
      },
    ],
    [isOnboardingComplete]
  );

  const adminMenuGroups = React.useMemo(
    () => [
      {
        items: [
          {
            icon: <HomeOutlinedIcon />,
            name: 'Home',
            apiName: 'dashboard',
            path: '/dashboard',
            ref: React.createRef<HTMLButtonElement>(),
          },
          {
            icon: <BusinessOutlinedIcon />,
            name: 'Organization',
            apiName: 'organization',
            path: '/organization',
            ref: React.createRef<HTMLButtonElement>(),
          },
          {
            icon: <AccountBalanceOutlinedIcon />,
            name: 'Billing',
            apiName: 'billing',
            path: '/billing',
            ref: React.createRef<HTMLButtonElement>(),
          },
        ],
      },
      {
        items: [
          {
            icon: <CasesOutlinedIcon />,
            name: 'Funds',
            apiName: 'fund',
            path: '/fund',
            ref: React.createRef<HTMLButtonElement>(),
          }
        ],
      },
      {
        items: [
          {
            icon: <HelpOutlineOutlinedIcon />,
            name: 'Help',
            apiName: 'help',
            path: '/support',
            ref: React.createRef<HTMLButtonElement>(),
          },
          {
            icon: isOnboardingComplete ? <SettingsOutlinedIcon /> : <Badge badgeContent={"!"} color="warning" overlap="circular" variant="dot"><SettingsOutlinedIcon /></Badge>,
            name: 'Settings',
            apiName: 'settings',
            path: '/settings',
            ref: React.createRef<HTMLButtonElement>(),
          },
          {
            icon: <LogoutIcon />,
            name: 'Sign Out',
            apiName: 'sign_out',
            path: '/sign-out',
            content: <SignOutButton />,
            ref: React.createRef<HTMLButtonElement>(),
          },
        ],
      },
    ],
    [isOnboardingComplete]
  );

  const superAdminMenuGroups = React.useMemo(
    () => [
      {
        items: [
          {
            icon: <PeopleOutlineIcon />,
            name: 'Organizations',
            apiName: 'organizations',
            path: '/organizations',
            ref: React.createRef<HTMLButtonElement>(),
          },
          {
            icon: <ManageAccountsOutlinedIcon />,
            name: 'Index Manager',
            apiName: 'index_manager',
            path: '/index-manager',
            ref: React.createRef<HTMLButtonElement>(),
          }
        ],
      }
    ],
    [isSuperAdmin]
  );

  const handleNavigation = (path: string) => {
    if (path === '/sign-out') {
      signOut({redirectUrl: '/sign-in'});
    } else {
      router.push(path);
    }    
  };

  const backgroundRef = useRef<HTMLDivElement>(null);

  const computeHighlightPosition = () => {
    let currentItemRef: React.RefObject<HTMLButtonElement> | null = null as React.RefObject<HTMLButtonElement> | null;
    if (isAdmin) {
      adminMenuGroups.forEach((group) => {
        group.items.forEach((item) => {
          if (pathname.includes(item.path)) {
            currentItemRef = item.ref;
          }
        });
      });
    } else {
      menuGroups.forEach((group) => {
        group.items.forEach((item) => {
          if (pathname.includes(item.path)) {
            currentItemRef = item.ref;
          }
        });
      });
    }

    if (isSuperAdmin) {
      superAdminMenuGroups.forEach((group) => {
        group.items.forEach((item) => {
          if (pathname.includes(item.path)) {
            currentItemRef = item.ref;
          }
        });
      });
    }
    if (currentItemRef && !currentItemRef.current) {
      console.log('No current item ref found');
      if (isAdmin) {
        currentItemRef = adminMenuGroups[0].items[0].ref;
      } else {
        currentItemRef = menuGroups[0].items[0].ref;
      }
    };
    

    if (currentItemRef && currentItemRef.current && backgroundRef.current) {
      setHideHighlight(false);
      setStaticRef(currentItemRef);
      const itemRect = currentItemRef.current.getBoundingClientRect();
      const containerRect = backgroundRef.current.parentElement!.getBoundingClientRect();
      const translateY = itemRect.top - containerRect.top;

      anime({
        targets: backgroundRef.current,
        translateY: translateY,
        duration: 500,
        easing: 'easeOutQuad',
      });
    } else { 
      setStaticRef(undefined);
      setHideHighlight(true);
    }
  }

  useEffect(() => {
    computeHighlightPosition();
  }, [pathname, isAdmin, isSuperAdmin, isOpen]);
  
  useEffect(() => {
    // const id = setInterval(() => {
    //   computeHighlightPosition();
    // }, 2000)

    // return () => {
    //   clearInterval(id)
    // }
  }, [])  

  useEffect(() => {
    setIsOpen(true);
  }, []);

  return (
    <>
      {true && 
        <Stack
          direction="column"
          py={2}
          spacing={2}
          alignItems="flex-end"
          justifyContent="center"
          sx={{ position: 'relative' }}
        >
          <Box
            ref={backgroundRef}
            hidden={hideHighlight}
            sx={{
              position: 'absolute',
              right: 0,
              top: -8,
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: 'white',
              boxShadow: theme.shadows[3],
              zIndex: -1,
            }}
          />
          {!isAdmin && menuGroups.map((group, groupIndex) => (
            <SpeedDial
              key={groupIndex}
              ariaLabel={`SpeedDial navigation menu group ${groupIndex}`}
              direction="down"
              sx={{ borderRadius: 25 }}
              className={'opaqueMenu'}
              icon={null}
              FabProps={{ sx: { display: 'none' } }}
              open={isOpen}
            >
              {group.items.map((item, itemIndex) => (
                <SpeedDialAction
                  key={`${groupIndex}-${itemIndex}`}
                  icon={item.icon}
                  tooltipTitle={languageData[language].Menu[item.apiName]}
                  onClick={() => handleNavigation(item.path)}
                  ref={item.ref} // Move ref here
                  FabProps={{
                    sx: {
                      padding: theme.spacing(1),
                      color: (!pathname.startsWith('/organizations') && pathname === item.path || (item.path === '/settings' && pathname.includes(item.path))) || (staticRef === item.ref)
                        ? theme.palette.success.main
                        : 'default',
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                    },
                  }}
                />
              ))}
            </SpeedDial>
          ))}

          {isAdmin && adminMenuGroups.map((group, groupIndex) => (
            <SpeedDial
              key={groupIndex}
              ariaLabel={`SpeedDial navigation menu group ${groupIndex}`}
              direction="down"
              sx={{ borderRadius: 25 }}
              className={'opaqueMenu'}
              icon={null}
              FabProps={{ sx: { display: 'none' } }}
              open={isOpen}
            >
              {group.items.map((item, itemIndex) => (
                <SpeedDialAction
                  key={`${groupIndex}-${itemIndex}`}
                  icon={item.icon}
                  tooltipTitle={languageData[language].Menu[item.apiName]}
                  onClick={() => handleNavigation(item.path)}
                  ref={item.ref} // Move ref here
                  FabProps={{
                    sx: {
                      padding: theme.spacing(1),
                      color: (!pathname.startsWith('/organizations') && pathname.includes(item.path)) || (staticRef === item.ref)
                        ? theme.palette.success.main
                        : 'default',
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                    },
                  }}
                />
              ))}
            </SpeedDial>
          ))}

          {isSuperAdmin && superAdminMenuGroups.map((group, groupIndex) => (
            <SpeedDial
              key={groupIndex}
              ariaLabel={`SpeedDial navigation menu group ${groupIndex}`}
              direction="down"
              sx={{ borderRadius: 25 }}
              className={'opaqueMenu'}
              icon={null}
              FabProps={{ sx: { display: 'none' } }}
              open={isOpen}
            >
              {group.items.map((item, itemIndex) => (
                <SpeedDialAction
                  key={`superAdmin-${groupIndex}-${itemIndex}`}
                  icon={item.icon}
                  tooltipTitle={languageData[language].Menu[item.apiName]}
                  onClick={() => handleNavigation(item.path)}
                  ref={item.ref} // Move ref here
                  FabProps={{
                    sx: {
                      padding: theme.spacing(1),
                      color: pathname.includes(item.path)
                        ? theme.palette.success.main
                        : 'default',
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                    },
                  }}
                />
              ))}
            </SpeedDial>
          ))}
        </Stack>
      }
    </>
    
  );
};

export default AppMenu;