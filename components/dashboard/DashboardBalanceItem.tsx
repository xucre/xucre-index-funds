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
import { useLanguage } from "@/hooks/useLanguage";
import WithdrawTokenToWallet from '../fund/WithdrawTokenToWallet';
import WithdrawTokenToSource from '../fund/WithdrawTokenToSource';
dayjs.extend(relativeTime)

interface DashboardBalanceItemProps {
  metadata: TokenDetails;
  details: Item;
  address: string;
  refreshAll: any;
}


const DashboardBalanceItem: React.FC<DashboardBalanceItemProps> = ({ details, metadata, address, refreshAll }) => {
  const theme = useTheme();
  const {language, languageData} = useLanguage();
  const borderColor = getDashboardBorderColor(theme);
  const [modalOpen, setModalOpen] = useState(false);
  const [exitModalOpen, setExitModalOpen] = useState(false);

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

  const handleCloseWidthdrawModal = (event) => {
    setModalOpen(false);
    if (event === 'refresh') refreshAll(true);
  }

  const handleOpenExitModal = () => {
    handleClose();
    setExitModalOpen(true);
  }

  const handleCloseExitModal = (event) => {
    setExitModalOpen(false);
    if (event === 'refresh') refreshAll(true);
  }
  const quote = details.holdings[0].quote_rate === null ? details.holdings[1].close.quote : details.holdings[0].close.quote;
  const computedAmount = quote < 1 ? quote : quote.toFixed(2);
  return (
    <ListItem alignItems="flex-start"
      secondaryAction={
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end">
          <Typography variant="body2" color="text.primary" fontWeight={'bold'}>
            ${computedAmount}
          </Typography>
          <IconButton
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
              {languageData[language].Dashboard.withdraw_to_wallet}
            </MenuItem>
            <MenuItem onClick={handleOpenExitModal}>              
              {languageData[language].Dashboard.exit_position}
            </MenuItem>
          </Menu>
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
      {modalOpen && <WithdrawTokenToWallet address={address} details={details} metadata={metadata} open={modalOpen} closeFunction={handleCloseWidthdrawModal} />}
      {exitModalOpen && <WithdrawTokenToSource details={details} metadata={metadata} open={exitModalOpen} closeFunction={handleCloseExitModal} />}
    </ListItem>
  );
};

export default DashboardBalanceItem;