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

const DEFAULT_LOGO = "/icon-green.png"

const rounder = (num: number) => {
  return Number(num.toFixed(2)).toLocaleString();
}

export default function PortfolioItemList({ portfolioItems, priceMap }: { portfolioItems: PortfolioItem[], priceMap: { [key: string]: PriceData } }) {
  const { language } = useLanguage();
  const openItem = (item: PortfolioItem) => () => {
    window.open(`https://polygonscan.com/address/${item.address}`, '_blank');
  }
  console.log(priceMap);
  return (
    <List sx={{
      maxWidth: 360,
      bgcolor: '',
      my: 4,
      //maxHeight: { xs: null, sm: 400 },
      overflowY: 'auto',
    }} style={{

    }}>
      {portfolioItems.filter((item) => item.active).map((item, i) => {
        const price = priceMap[item.address.toLowerCase()];
        return (
          <span key={item.address} >
            <ListItem alignItems="flex-start">
              <ListItemAvatar onClick={openItem(item)} sx={{ cursor: 'pointer' }}>
                <Avatar alt={item.name} src={item.logo} >
                  <Avatar alt={item.name} src={price?.logo} >
                    <Avatar alt={item.name} src={DEFAULT_LOGO} />
                  </Avatar>
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <React.Fragment>
                    <Typography
                      component="span"
                      variant="body1"
                      sx={{ color: 'text.primary', display: 'inline', fontWeight: 'bold' }}
                    >
                      {item.name} -
                    </Typography>
                    <Typography
                      component="span"
                      variant="body1"
                      sx={{ color: 'text.primary', display: 'inline', pl: 1 }}
                    >
                      ({price ?  price.items[0] && price.items[0].price ? `$${rounder(price.items[0].price)}` : price.items[1] && price.items[1].price ? `${rounder(price.items[1].price)}` : 'N/A' : 'N/A'})
                    </Typography>
                  </React.Fragment>
                }
                secondary={
                  <React.Fragment>
                    <Typography
                      component="span"
                      variant="body2"
                      sx={{ color: 'text.primary', display: 'inline' }}
                    >
                      {item.description[language]}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
            {i < portfolioItems.length - 1 && <Divider variant="inset" component="li" />}
          </span>
        )
      })}
    </List>
  );
}