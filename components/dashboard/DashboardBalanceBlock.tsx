import { useLanguage } from "@/hooks/useLanguage";
import languageData from '@/metadata/translations'
import { getDashboardBorderColor } from "@/service/helpers";
import { Stack, Typography, Chip, useTheme, Skeleton } from "@mui/material";


const BalanceBlock = ({ balance, change, address, loaded }: { balance: number, change: number, address: string, loaded: boolean }) => {
  const theme = useTheme();
  const borderColor = getDashboardBorderColor(theme);
  const { language } = useLanguage();
  const isPositive = change > 0;
  const isLessThan1 = change < 1 && change > -1;
  const changeLabel = `${isPositive ? '+' : ''}${change.toFixed(isLessThan1 ? 2 : 0)}% ${(languageData[language].totalBalance.dashboard_change as string)}`;
  return (
    <a href={`https://app.safe.global/home?safe=matic:${address}`} color="inherit" target={'_blank'} >
      {loaded ?
        <Stack direction={'row'} justifyContent={'space-between'} alignItems={'center'} borderRadius={8} bgcolor={'#00872a'} width={'full'} py={2} px={3} >
          <Stack direction={'column'} spacing={0}>
            <Typography variant={'body1'} color={'text.secondary'} fontSize={14} py={0} mb={0}>Total Balance</Typography>
            <Typography variant={'h4'} fontSize={30} fontWeight={'bold'} color={'white'} py={0} mt={0}>${balance.toFixed(2)}</Typography>
          </Stack>
          <Chip label={changeLabel} color={'warning'} style={{ color: isPositive ? '#00872a' : '$FF0000' }}></Chip>
        </Stack> :
        <Skeleton variant="rounded" width={'full'} height={100} />
      }

    </a>
  )
}

export default BalanceBlock;