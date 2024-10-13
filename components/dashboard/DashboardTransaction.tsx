import React, { useEffect, useState } from 'react';
import { Stack, Typography, Divider, useTheme, Box } from '@mui/material';
import dayjs from 'dayjs';
import { retrieveTransactionDetails, TransactionDetails } from '@/service/eip155';
import { CovalentTransactionV3 } from '@/hooks/useWalletData';
import { getDashboardBorderColor } from '@/service/helpers';
import truncateEthAddress from 'truncate-eth-address';
import relativeTime from 'dayjs/plugin/relativeTime';
import { formatEther, formatUnits } from 'viem';
dayjs.extend(relativeTime)

interface DashboardTransactionProps {
  transaction: CovalentTransactionV3;
  address: string;
}


const DashboardTransaction: React.FC<DashboardTransactionProps> = ({ transaction, address }) => {
  const theme = useTheme();
  const borderColor = getDashboardBorderColor(theme);
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails>(null);
  const [transactionType, setTransactionType] = useState<"Unknown" | "Deposit" | "Withdrawal">('Unknown');

  const computeTransactionType = (details) => {
    if (details.erc20Transfers.length > 0) {
      const received = details.erc20Transfers.find((transfer) => transfer.to === address);
      const sent = details.erc20Transfers.find((transfer) => transfer.from === address);

      if (received) {
        return 'Deposit';
      }
      if (sent) {
        return 'Withdrawal';
      }
      return 'Unknown';
    }
    return 'Unknown';
  }

  useEffect(() => {
    const fetchTransactionDetails = async () => {
      const details = await retrieveTransactionDetails(address, transaction.tx_hash);
      setTransactionDetails(details);
      setTransactionType(computeTransactionType(details));
    };

    if (transaction && address) fetchTransactionDetails();
  }, [transaction, address]);

  if (!transactionDetails) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box width={'full'}>
      {transactionDetails !== null &&
        <Stack direction={'row'} spacing={1} justifyContent={'space-between'} alignItems={'center'} width={'100%'} >
          <a href={`https://polygonscan.com/tx/${transaction.tx_hash}`} target={'_blank'} ><Typography>{transactionType} tx ({truncateEthAddress(transaction.tx_hash)})</Typography></a>
          {transactionType === 'Deposit' &&
            <Typography fontWeight={'bold'}>{`+${formatUnits(BigInt(transactionDetails.erc20Transfers[0].value), 6)}`}</Typography>
          }
          {transactionType === 'Withdrawal' &&
            <Typography fontWeight={'bold'}>{`-${formatUnits(BigInt(transactionDetails.erc20Transfers[0].value), 6)}`}</Typography>
          }
        </Stack>

      }
    </Box>

  );
};

export default DashboardTransaction;