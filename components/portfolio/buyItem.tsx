import LoadingButton from "@mui/lab/LoadingButton";
import { Stack, ButtonBase, Avatar, Typography, Menu, MenuItem, TextField, Button, Card, CardActions, CardContent, CardMedia, Collapse, Stepper, StepLabel, Step } from "@mui/material";
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useWaitForTransactionReceipt } from 'wagmi'
import { useLanguage } from "@/hooks/useLanguage";
import languageData from '@/metadata/translations';
import { useMixpanel } from "@/hooks/useMixpanel";

export const BuyItem = ({ status, confirmationHash, portfolio, sourceToken, sourceTokens, setSourceToken, balance, rawAmount, handleAmountUpdate, amount, handleApproval, loading, allowance, allowanceAmount, handleSpot }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const mixpanel = useMixpanel();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState('');
  const isReadyToApprove = amount > BigInt(0);
  const isReadyToBuy = isReadyToApprove && BigInt(allowance) >= BigInt(amount);
  const step = isReadyToBuy ? 1 : 0;

  useEffect(() => { setIsLoading(false) }, []);
  const executeCombinedFlow = async () => {
    setIsLoading(true)
    try {
      if (!isReadyToBuy) {
        if (mixpanel) mixpanel.track('Approve and Buy', { fund: portfolio.name[language] });
        await handleApproval();
        setCurrentAction('approve');
      } else {
        if (mixpanel) mixpanel.track('Execute Spot', { fund: portfolio.name[language] });
        await handleSpot();
        setCurrentAction('spot');
      }
    } catch (error) { }

  };

  useEffect(() => {
    /*if (!loading && status === 'success') {
      if (currentAction === 'approve' && isReadyToBuy) {
        handleSpot();
        setCurrentAction('spot');
      } else {
        setCurrentAction('');
        setIsLoading(false);
      }
    } else*/ if (!loading && status === 'error') {
      setCurrentAction('');
      setIsLoading(false);
    } else if (!loading && status === 'idle') {
      setCurrentAction('');
      setIsLoading(false);
    }

  }, [loading, status]);

  useEffect(() => {
    if (confirmationHash.length > 0) {
      if (currentAction === 'approve' && isReadyToBuy) {
        setCurrentAction('spot');
      } else {
        setCurrentAction('');
        setIsLoading(false);
      }
    }
  }, [confirmationHash]);

  useEffect(() => {
    //console.log(sourceToken);
  }, [sourceToken])
  //useEffect(() => { console.log('buyItemBalance', balance) }, [balance])

  if (!sourceToken) return null;
  return (
    <Stack justifyContent={'center'} alignItems={'center'} spacing={2} >
      <Card sx={{ maxWidth: 500 }}>
        <Collapse in={!isReadyToApprove}>
          <CardMedia
            sx={{ height: 340, width: 350, display: { xs: 'none', sm: 'block' } }}
            image={portfolio.imageSmall}
            title={portfolio.name[language]}
          />
        </Collapse>
        <CardContent>
          <Stack direction={'column'} spacing={2}>
            <Stack direction={'row'} spacing={2} justifyContent={'center'} alignItems={'center'}>
              <ButtonBase aria-label="Change funding source." id="basic-button" onClick={handleClick} sx={{}}>
                <Stack direction={'row'} spacing={2} sx={{}}>
                  <Avatar src={sourceToken.logo} sx={{ width: 24, height: 24 }} />
                  <Typography color='text.primary'>{sourceToken.name}</Typography>
                  <ArrowDropDownIcon />
                </Stack>
              </ButtonBase>
            </Stack>

            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              {sourceTokens.filter((token) => token.active).map((token) => (
                <MenuItem key={token.address} onClick={() => { setSourceToken(token); handleClose(); }}>
                  <Stack direction={'row'} spacing={2}>
                    <Avatar src={token.logo} sx={{ width: 24, height: 24 }} />
                    <Typography color='text.primary'>{token.name}</Typography>
                  </Stack>

                </MenuItem>
              ))}
            </Menu>
            {/*<Typography color='text.primary'> Balance: {balance ? formatUnits(balance as bigint, sourceToken.decimals) : 0}</Typography>
            <Typography color='text.primary'> Allowance: {allowanceAmount ? '0' : formatUnits(allowance as bigint, sourceToken.decimals)}</Typography>*/}
            <TextField
              label={languageData[language].ui.amount}
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
              value={rawAmount}
              color={'success'}
              helperText={`${languageData[language].ui.balance}: $${balance ? formatUnits(balance as bigint, sourceToken.decimals) : 0}`}
              onChange={handleAmountUpdate}
            />
            <Collapse in={isReadyToApprove} sx={{}}>
              <Stepper activeStep={step} orientation="vertical" sx={{ paddingY: 2, alignItems: 'center', display: 'block' }}>
                <Step>
                  <StepLabel>
                    {languageData[language].ui.approve_in_wallet}
                  </StepLabel>
                </Step>
                <Step>
                  <StepLabel>
                    {languageData[language].ui.confirm_swap}
                  </StepLabel>
                </Step>
              </Stepper>


            </Collapse>
          </Stack>
        </CardContent>
        <CardActions>
          {/*<LoadingButton variant="contained" fullWidth disabled={amount === BigInt(0)} onClick={handleApproval} loading={loading} loadingIndicator="Approve">
            Approve
          </LoadingButton>*/}

          <LoadingButton variant="contained" fullWidth disabled={!isReadyToApprove} onClick={executeCombinedFlow} loading={isLoading} loadingIndicator={languageData[language].ui.executing}>
            {isReadyToBuy ? languageData[language].Buttons_Header.buy : languageData[language].ui.approve_and_buy}
          </LoadingButton>
        </CardActions>
      </Card>
    </Stack>
  )
};