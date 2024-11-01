import React, { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  SpeedDial,
  SpeedDialAction,
  Stack,
  useTheme,
} from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import anime from 'animejs';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';

const AppMenu: React.FC = () => {
  const {language} = useLanguage();
  const {isAdmin} = useIsAdmin();
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const theme = useTheme();
  const pathname = usePathname();

  useEffect(() => {
      setIsOpen(true);
  }, []);

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
          }
        ],
      },
      {
        items: [
          {
            icon: <HelpOutlineOutlinedIcon />,
            name: 'FAQ',
            apiName: 'faq',
            path: '/about-us',
            ref: React.createRef<HTMLButtonElement>(),
          },
          {
            icon: <SettingsOutlinedIcon />,
            name: 'Settings',
            apiName: 'settings',
            path: '/settings',
            ref: React.createRef<HTMLButtonElement>(),
          },
        ],
      },
    ],
    []
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
            icon: <HelpOutlineOutlinedIcon />,
            name: 'FAQ',
            apiName: 'faq',
            path: '/about-us',
            ref: React.createRef<HTMLButtonElement>(),
          },
          {
            icon: <SettingsOutlinedIcon />,
            name: 'Settings',
            apiName: 'settings',
            path: '/settings',
            ref: React.createRef<HTMLButtonElement>(),
          },
        ],
      },
    ],
    []
  );

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const backgroundRef = useRef<HTMLDivElement>(null);

  const computeHighlightPosition = () => {
    let currentItemRef: React.RefObject<HTMLButtonElement> | null = null;
    if (isAdmin) {
      adminMenuGroups.forEach((group) => {
        group.items.forEach((item) => {
          if (pathname.includes(item.path) || (pathname === '/edit' && item.path === '/dashboard')) {
            currentItemRef = item.ref;
          }
        });
      });
    } else {
      menuGroups.forEach((group) => {
        group.items.forEach((item) => {
          if (pathname.includes(item.path) || (pathname === '/edit' && item.path === '/dashboard')) {
            currentItemRef = item.ref;
          }
        });
      });
    }
    

    if (currentItemRef?.current && backgroundRef.current) {
      const itemRect = currentItemRef.current.getBoundingClientRect();
      const containerRect =
        backgroundRef.current.parentElement!.getBoundingClientRect();
      const translateY = itemRect.top - containerRect.top;

      anime({
        targets: backgroundRef.current,
        translateY: translateY,
        duration: 500,
        easing: 'easeOutQuad',
      });
    }
  }

  useEffect(() => {
    computeHighlightPosition();
  }, [pathname, menuGroups, adminMenuGroups, isAdmin, isOpen]);
  
  useEffect(() => {
    setTimeout(() => {
      //
    }, 6000)
    computeHighlightPosition();
  }, [])  

  return (
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
                  color: pathname.includes(item.path) || (pathname === '/edit' && item.path === '/dashboard')
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
                  color: pathname.includes(item.path) || (pathname === '/edit' && item.path === '/dashboard')
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
  );
};

export default AppMenu;