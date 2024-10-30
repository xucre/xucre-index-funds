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

const AppMenu: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const theme = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    setTimeout(() => {
      setIsOpen(true);
    }, 100);
  }, []);

  const menuGroups = React.useMemo(
    () => [
      {
        items: [
          {
            icon: <HomeOutlinedIcon />,
            name: 'Home',
            path: '/dashboard',
            ref: React.createRef<HTMLButtonElement>(),
          },
          {
            icon: <BusinessOutlinedIcon />,
            name: 'Organization',
            path: '/organization',
            ref: React.createRef<HTMLButtonElement>(),
          },
          {
            icon: <AccountBalanceOutlinedIcon />,
            name: 'Billing',
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
            path: '/about-us',
            ref: React.createRef<HTMLButtonElement>(),
          },
          {
            icon: <SettingsOutlinedIcon />,
            name: 'Settings',
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
    menuGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (pathname.includes(item.path)) {
          currentItemRef = item.ref;
        }
      });
    });

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
  }, [pathname, menuGroups]);
  
  useEffect(() => {
    setTimeout(() => {
      computeHighlightPosition();
    }, 600)
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
      {menuGroups.map((group, groupIndex) => (
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
              tooltipTitle={item.name}
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
  );
};

export default AppMenu;