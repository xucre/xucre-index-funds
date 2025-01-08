import React, { useEffect, useState } from 'react';
import { Stack, Typography, Divider, useTheme, Box, Avatar, ListItem, ListItemAvatar, ListItemText, IconButton, Menu, MenuItem } from '@mui/material';
import dayjs from 'dayjs';
import { retrieveTransactionDetails, TransactionDetails } from '@/service/eip155';
import { CovalentTransactionV3, Item } from '@/hooks/useWalletData';
import { getDashboardBorderColor } from '@/service/helpers';
import truncateEthAddress from 'truncate-eth-address';
import relativeTime from 'dayjs/plugin/relativeTime';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { formatEther, formatUnits, transactionType } from 'viem';
import { TokenDetails } from '@/service/types';
import WithdrawTokenToWallet from '../fund/WithdrawTokenToWallet';
dayjs.extend(relativeTime)

interface DashboardBalanceItemProps {
  metadata: TokenDetails;
  details: Item;
  address: string;
}


const DashboardBalanceItem: React.FC<DashboardBalanceItemProps> = ({ details, metadata, address }) => {
  const theme = useTheme();
  const borderColor = getDashboardBorderColor(theme);
  const [modalOpen, setModalOpen] = useState(false);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const openItem = (item: Item) => () => {
    window.open(`https://polygonscan.com/address/${item.contract_address}`, '_blank');
  }

  const handleOpenWidthdrawModal = () => {
    handleClose();
    setModalOpen(true);
  }

  const handleCloseWidthdrawModal = () => {
    setModalOpen(false);
  }
  
  const computedAmount = details.holdings[0].close.quote < 1 ? details.holdings[0].close.quote : details.holdings[0].close.quote.toFixed(2);
  return (
    <ListItem alignItems="flex-start"
      secondaryAction={
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end">
          <Typography variant="body2" color="text.primary" fontWeight={'bold'}>
            ${computedAmount}
          </Typography>
          {/*<IconButton
            aria-label="more"
            id="long-button"
            aria-controls={open ? 'long-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-haspopup="true"
            onClick={handleMenuClick}
          >
            <MoreVertIcon />
          </IconButton>
           <Menu
            id="long-menu"
            MenuListProps={{
              'aria-labelledby': 'long-button',
            }}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            slotProps={{
              paper: {
                style: {
                  width: '20ch',
                },
              },
            }}
          >
            <MenuItem onClick={handleOpenWidthdrawModal}>
              Withdraw
            </MenuItem>
          </Menu> */}
        </Stack>
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
      {modalOpen && <WithdrawTokenToWallet details={details} metadata={metadata} open={modalOpen} closeFunction={handleCloseWidthdrawModal} />}
    </ListItem>
  );
};

export default DashboardBalanceItem;