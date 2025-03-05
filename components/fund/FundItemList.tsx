'use client'
import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { PortfolioItem, PriceData } from '@/service/types';
import { useLanguage } from '@/hooks/useLanguage';
import { Box, Grid2, Stack, Tooltip } from '@mui/material';
import OpaqueCard from '../ui/OpaqueCard';
import { truncateString } from '@/service/helpers';

import Popover from '@mui/material/Popover';

const DEFAULT_LOGO = "/icon-green.png"

const rounder = (num: number) => {
  return Number(num.toFixed(2)).toLocaleString();
}

const PortfolioItemComponent = ({ item, priceMap, openItem }: { item: PortfolioItem, priceMap: { [key: string]: PriceData }, openItem: (item: PortfolioItem) => () => void }) => {
  const { language } = useLanguage();
  const price = priceMap[item.address.toLowerCase()];

  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Grid2 key={item.address} size={{xs: 6, md: 4}} spacing={2}>
      <OpaqueCard sx={{m:2}} 
        aria-owns={open ? 'mouse-over-popover' : undefined}
        aria-haspopup="true"
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}>
          <Stack direction="row" spacing={1} onClick={openItem(item)} justifyContent={'start'} alignItems={'center'}>
            <Avatar alt={item.name} src={item.logo} >
              <Avatar alt={item.name} src={price?.logo} >
                <Avatar alt={item.name} src={DEFAULT_LOGO} />
              </Avatar>
            </Avatar>
            <Stack direction="column" spacing={0}>
              <React.Fragment>
                <Typography
                  component="span"
                  variant="body1"
                  sx={{ color: 'text.primary', display: 'inline', fontWeight: 'bold' }}
                >
                  {item.name}
                </Typography>
                {/* <Typography
                  component="span"
                  variant="body1"
                  sx={{ color: 'text.primary', display: 'inline', pl: 1 }}
                >
                  ({price ?  price.items[0] && price.items[0].price ? `$${rounder(price.items[0].price)}` : price.items[1] && price.items[1].price ? `${rounder(price.items[1].price)}` : 'N/A' : 'N/A'})
                </Typography> */}
              </React.Fragment>
              <React.Fragment>
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ color: 'text.primary', display: 'inline' }}
                >
                  {truncateString(item.description[language], 22)}
                </Typography>
              </React.Fragment>
            </Stack>
            
          </Stack>
      </OpaqueCard>
      <Popover
        id="mouse-over-popover"
        sx={{ pointerEvents: 'none' }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <Box p={2}>
          <Typography>{price ?  price.items[0] && price.items[0].price ? `$${rounder(price.items[0].price)}` : price.items[1] && price.items[1].price ? `${rounder(price.items[1].price)}` : 'N/A' : 'N/A'}</Typography>
          <Typography>{item.description[language]}</Typography>
        </Box>
      </Popover>
    </Grid2>
  )
}

export default function FundItemList({ portfolioItems, priceMap }: { portfolioItems: PortfolioItem[], priceMap: { [key: string]: PriceData } }) {
  const { language } = useLanguage();
  const openItem = (item: PortfolioItem) => () => {
    window.open(`https://polygonscan.com/address/${item.address}`, '_blank');
  }
  console.log(priceMap);
  return (
    <Grid2 container >
      {portfolioItems.filter((item) => item.active).map((item) => {
        return (
          <PortfolioItemComponent key={item.address} item={item} priceMap={priceMap} openItem={openItem} />
        )
      })}
    </Grid2>
  );
}