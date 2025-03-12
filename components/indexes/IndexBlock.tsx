import { useLanguage } from "@/hooks/useLanguage";
import { getDashboardBorderColor } from "@/service/helpers";
import { Stack, Typography, Chip, useTheme, Skeleton } from "@mui/material";


const FundBlock = ({header, subheader}) => {
  const theme = useTheme();
  const borderColor = getDashboardBorderColor(theme);
  const { language, languageData } = useLanguage();
  return (
        <Stack direction={'row'} minWidth={"40vw"} justifyContent={'space-between'} alignItems={'center'} borderRadius={8} bgcolor={'#00872a'} width={'full'} py={2} px={3} >
          <Stack direction={'column'} spacing={0}>
            <Typography variant={'h4'} color={'white'} fontSize={30} py={0} mb={0} fontWeight={'bold'}>{header}</Typography>
            {subheader && <Typography variant={'body1'} fontSize={14} color={'text.secondary'} py={0} mt={0}>{subheader}</Typography>}
            
          </Stack>
          <></>
        </Stack> 
  )
}

export default FundBlock;