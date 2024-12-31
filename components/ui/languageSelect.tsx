'use client'
import { useLanguage } from "@/hooks/useLanguage";
import { Button, ButtonGroup, Menu, MenuItem, useMediaQuery, useTheme } from "@mui/material"

import { useState } from "react";
import { Language, languages } from "@/metadata/translations";
import React from "react";

// components/LoadingIndicator.tsx
export default function LanguageSelect({ type }: { type: 'button' | 'menu' }) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { language, setLanguage } = useLanguage();
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      {
        type === 'menu' &&
        <>
          <Button
            color={theme.palette.mode === 'dark' ? 'inherit' : 'inherit'}
            aria-label="open drawer"
            onClick={handleMenuOpen}
            sx={{ ml: 2 }}
          >
            {Language[language]}
          </Button>
          <Menu
            id="basic-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            {languages.map((item) => (
              <MenuItem onClick={() => { setLanguage(item); handleMenuClose; }} key={item}>{Language[item]}</MenuItem>
            ))}
          </Menu>
        </>
      }

      {type === 'button' &&
        <ButtonGroup variant="contained" color={theme.palette.mode === 'dark' ? 'inherit' : 'inherit'} disableElevation>
          {languages.map((item) => (
            <Button onClick={() => setLanguage(item)} key={item} variant={'text'} sx={{ textTransform: 'capitalize', letterSpacing: 2, fontWeight: language === item ? 900 : 200 }}>{Language[item]}</Button>
          ))}
        </ButtonGroup>
      }

    </>
  );
};
