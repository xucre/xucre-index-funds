import React, { useEffect, useState } from 'react';
import { Stack, Typography, Divider, useTheme, Box, Avatar, ListItem, ListItemAvatar, ListItemText } from '@mui/material';
import dayjs from 'dayjs';
import { retrieveTransactionDetails, TransactionDetails } from '@/service/eip155';
import { CovalentTransactionV3, Item } from '@/hooks/useWalletData';
import { getDashboardBorderColor } from '@/service/helpers';
import truncateEthAddress from 'truncate-eth-address';
import relativeTime from 'dayjs/plugin/relativeTime';
import { formatEther, formatUnits, transactionType } from 'viem';
import { TokenDetails } from '@/service/types';
dayjs.extend(relativeTime)

interface DashboardBalanceItemProps {
  metadata: TokenDetails;
  details: Item;
  address: string;
}


const DashboardBalanceItem: React.FC<DashboardBalanceItemProps> = ({ details, metadata, address }) => {
  const theme = useTheme();
  const borderColor = getDashboardBorderColor(theme);
  const openItem = (item: Item) => () => {
    window.open(`https://polygonscan.com/address/${item.contract_address}`, '_blank');
  }
  const computedAmount = details.holdings[0].close.quote < 1 ? details.holdings[0].close.quote : details.holdings[0].close.quote.toFixed(2);
  return (
    <ListItem alignItems="flex-start"
      secondaryAction={
        <Typography variant="body2" color="text.primary" fontWeight={'bold'}>
          ${computedAmount}
        </Typography>
      }

    >
      <ListItemAvatar onClick={openItem(details)} sx={{ cursor: 'pointer' }}>
        <Avatar alt={details.contract_name} src={metadata.logo} sx={{ border: metadata.defaultLogo ? 'solid 2px' : '' }}>
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
              {details.contract_name}
            </Typography>
          </React.Fragment>
        }
        secondary={
          <React.Fragment>
            <Typography
              component="span"
              variant="body2"
              sx={{ color: 'text.secondary', display: 'inline' }}
            >
              {truncateEthAddress(details.contract_address)}
            </Typography>
          </React.Fragment>
        }
      />
    </ListItem>
  );
};

export default DashboardBalanceItem;