import { useLanguage } from "@/hooks/useLanguage";
import languageData from '@/metadata/translations'
import { getDashboardBorderColor, getTextColor } from "@/service/helpers";
import { Stack, Typography, Chip, useTheme, Skeleton, List, Divider, ListItem, Collapse, Box, IconButton } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const SupportHeader = ({ }) => {
  const theme = useTheme();
  const borderColor = getDashboardBorderColor(theme);
  const { language } = useLanguage();
  //const textColor = getTextColor(theme);
  const textColor = 'white';
  const [checked, setChecked] = useState(false);

  const elementRef = useRef<HTMLDivElement | null>(null);
  const [elementHeight, setElementHeight] = useState<number | null>(null);
  useEffect(() => {
    if (elementRef.current) {
      // Get the height of the element
      setElementHeight(elementRef.current.offsetHeight);
    }
  }, []);
  return (
    <Stack direction={'column'} justifyContent={'start'} alignItems={'start'} borderRadius={8} bgcolor={'#00872a'} py={4} px={4} >
      <Collapse in={checked} collapsedSize={elementHeight as number || 0}>
          <Box ref={elementRef}>
              <Typography variant={'h5'} sx={{fontWeight: 'bold'}} color={textColor}>{languageData[language].FAQPage.title}</Typography>
              <Typography variant={'body1'} color={textColor}>{languageData[language].FAQPage.header1}</Typography>
              {!checked && <Stack onClick={() => setChecked(!checked)} sx={{}} direction={'row'} spacing={2} justifyContent={'end'} alignItems={'center'}><Typography color={'textDisabled'}>{languageData[language].SupportPage.header_button}</Typography><ArrowForwardIosIcon color={'disabled'} /></Stack>}
          </Box>
          <List>
              {languageData[language].FAQPage.headerList1.map((item, index) => {
              return <ListItem key={index} color={textColor} sx={{color: 'white !important'}}>{item}</ListItem>
              })}
          </List>
          <Typography variant={'body1'} color={textColor}>{languageData[language].FAQPage.headerSecondary}</Typography>
          {checked && <Stack onClick={() => setChecked(!checked)} sx={{}} direction={'row'} spacing={2} justifyContent={'end'} alignItems={'center'}><ArrowUpwardIcon color={'disabled'} /></Stack>}
      </Collapse>
       
    </Stack>
  )
}

export default SupportHeader;