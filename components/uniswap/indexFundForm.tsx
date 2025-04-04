import React, { useEffect, useState } from 'react';
import {
  Stack,
  TextField,
  Select,
  MenuItem,
  Button,
  InputLabel,
  FormControl,
  SelectChangeEvent,
  Chip,
  Avatar,
  useTheme,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Grid2 as Grid,
  Modal,
  Dialog,
  FormControlLabel,
  FormGroup
} from '@mui/material';
import UniswapPoolChecker from '@/components/uniswap/poolChecker';
import { Language } from '@/metadata/translations';
import { useSnackbar } from 'notistack';
import { useAccount } from 'wagmi';
import OpaqueCard from '../ui/OpaqueCard';
import { IndexFund, PoolData, PortfolioItem, ToleranceLevels } from '@/service/types';
import { delFundDetails, getFundDetails, setFundDetails } from '@/service/db';
import { useRouter } from 'next/navigation';
import EditPortfolioItem from './editPortfolioItem';
import { useConnectedIndexFund } from '@/hooks/useIndexFunds';
import { BuyItem } from '../portfolio/buyItem';
import { formatUnits, parseUnits } from 'viem';
import { globalChainId } from '@/service/constants';

const IndexFundForm = ({id = null} : {id: string|null}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { chainId } = useAccount();
  const theme = useTheme();
  const router = useRouter();
  const [fund, setFund] = useState<IndexFund>({
    name: {
      [Language.EN]: '',
      [Language.ES]: '',
      [Language.PT]: '',
    },
    cardSubtitle: {
      [Language.EN]: '',
      [Language.ES]: '',
      [Language.PT]: '',
    },
    description: {
      [Language.EN]: '',
      [Language.ES]: '',
      [Language.PT]: '',
    },
    image: '',
    imageSmall: '',
    color: '',
    chainId: chainId || globalChainId,
    portfolio: [],
    toleranceLevels: [],
    custom: true,
    sourceToken: undefined,
    public: false
  });
  const [currentLanguage, setCurrentLanguage] = useState<Language>(Language.EN);
  const [toleranceLevels, setToleranceLevels] = useState<string[]>([]);
  const [editItemIndex, setEditItemIndex] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  // Validation state
  const [imageUrlError, setImageUrlError] = useState<string>('');
  const [imageSmallUrlError, setImageSmallUrlError] = useState<string>('');
  const [colorError, setColorError] = useState<string>('');
  const { balance, allowance, hash, error, loading, isNativeToken, confirmationHash, approveContract, initiateSpot, sourceToken, sourceTokens, setSourceToken, status } = useConnectedIndexFund({ fund });
  const [amount, setAmount] = useState<BigInt>(BigInt(0));
  const [rawAmount, setRawAmount] = useState<string>('');

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const validateHexColor = (color: string): boolean => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(color);
  };

  const handleLanguageChange = (event: SelectChangeEvent<Language>) => {
    setCurrentLanguage(event.target.value as Language);
  };

  const handleInputChange =
    (field: 'name' | 'description' | 'cardSubtitle') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFund({
        ...fund,
        [field]: {
          ...fund[field],
          [currentLanguage]: event.target.value,
        },
      });
    };

  const handleChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      if (field === 'public') {
        setFund({
          ...fund,
          [field]: event.target.checked,
        });
        return;
      }

      setFund({
        ...fund,
        [field]: value,
      });

      if (field === 'image') {
        if (value === '' || validateUrl(value)) {
          setImageUrlError('');
        } else {
          setImageUrlError('Please enter a valid URL.');
        }
      }

      if (field === 'imageSmall') {
        if (value === '' || validateUrl(value)) {
          setImageSmallUrlError('');
        } else {
          setImageSmallUrlError('Please enter a valid URL.');
        }
      }

      if (field === 'color') {
        if (value === '' || validateHexColor(value)) {
          setColorError('');
        } else {
          setColorError('Please enter a valid hex color (e.g., #FFFFFF).');
        }
      }
    };

  const availableRiskTolerances = Object.keys(ToleranceLevels);
  const handleChangeRiskTolerance = (event: SelectChangeEvent<string>) => {
    if (typeof event.target.value !== 'string') {
      const values = (event.target.value as string).split(',') as ToleranceLevels[];
      // setFund({
      //   ...fund,
      //   toleranceLevels: values,
      // });
      setToleranceLevels(values);
      return;
    }
    
    const value = event.target.value as ToleranceLevels;
    setToleranceLevels([value]);
    // setFund({
    //   ...fund,
    //   toleranceLevels: [value],
    // });
  }

  const handlePortfolioItemRegister = (pool: PoolData) => {
    setFund({
      ...fund,
      portfolio: [
        ...fund.portfolio,
        {
          name: pool.targetToken.name,
          chainId: chainId || globalChainId,
          address: pool.targetToken.address,
          weight: 0,
          description: {
            [Language.EN]: 'Pool Description',
            [Language.ES]: '',
            [Language.PT]: '',
          },
          logo: '',
          active: true,
          poolFee: pool.feeTier,
          decimals: pool.targetToken.decimals,
          chain_logo: '',
          chartColor: '',
          links: [],
          sourceFees: {
            [pool.sourceToken.address]: pool.feeTier,
          },
        },
      ],
      sourceToken: {
        name: pool.sourceToken.name,
        address: pool.sourceToken.address,
        decimals: pool.sourceToken.decimals,
        logo: pool.sourceToken.logo as string,
        chainId: chainId || globalChainId,
        weight: 0,
        description: {
          [Language.EN]: 'Pool Description',
          [Language.ES]: '',
          [Language.PT]: '',
        },
        active: true,
        poolFee: pool.feeTier,
        chain_logo: '',
        chartColor: '',
        links: [],
        sourceFees: {
          [pool.sourceToken.address]: pool.feeTier,
        },
      },
    });
    enqueueSnackbar(`Successfully added: ${pool.targetToken.name}`, {
      variant: 'success',
      autoHideDuration: 1000,
    });
  };

  const handleCopyToClipboard = () => {
    handleSubmit(false);
  }

  const handleDelete = (address: string) => {
    setFund({
      ...fund,
      portfolio: fund.portfolio.filter((item) => item.address !== address),
    });
  }

  const handleSave = () => {
    handleSubmit(true);
  }

  const handleAmountUpdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!sourceToken) return;
    setRawAmount(event.target.value);
    setAmount(parseUnits(event.target.value, sourceToken.decimals));
  }

  const handleApproval = () => {
    approveContract(amount);
  }  

  const handleSpot = () => {
    console.log('spotting');
    initiateSpot(amount);
  }
  const allowanceString = allowance && sourceToken ? formatUnits(allowance as bigint, sourceToken.decimals) : 0;
  const allowanceAmount = allowance ? (allowance as BigInt) <= amount : true;

  const handleSubmit = async (save: boolean) => {
    // Validate before submit
    let valid = true;

    // if (fund.image && !validateUrl(fund.image)) {
    //   setImageUrlError('Please enter a valid URL.');
    //   valid = false;
    // }

    // if (fund.imageSmall && !validateUrl(fund.imageSmall)) {
    //   setImageSmallUrlError('Please enter a valid URL.');
    //   valid = false;
    // }

    if (fund.color && !validateHexColor(fund.color)) {
      setColorError('Please enter a valid hex color (e.g., #FFFFFF).');
      valid = false;
    }

    if (!valid) {
      enqueueSnackbar('Please fix the errors before submitting.', {
        variant: 'error',
      });
      return;
    }
    if (!save) {
      navigator.clipboard.writeText(JSON.stringify({...fund, toleranceLevels}, null, 2));
      // Handle form submission logic
      enqueueSnackbar('Copied to clipboard.', {
        variant: 'success',
      })
    } else if (id) {
      // Handle form submission logic
      const convertedToleranceLevels = toleranceLevels as ToleranceLevels[];
      const _fund = {...fund, toleranceLevels : convertedToleranceLevels};
      await setFundDetails(globalChainId, decodeURI(id), _fund);
      
      enqueueSnackbar('Saved.', {
        variant: 'success',
      })
      fetchFund();
    }
    
  };

  // Fix: Ensure `requiredLanguages` contains only string values
  const isFormValid = () => {
    const requiredLanguages = Object.values(Language).filter(
      (value) => typeof value === 'string'
    ) as string[];

    const allLanguageFieldsFilled = requiredLanguages.every((lang) => {
      return (
        fund.name[lang]?.trim() !== '' &&
        fund.cardSubtitle[lang]?.trim() !== '' &&
        fund.description[lang]?.trim() !== ''
      );
    });

    const allFieldsFilled =
      allLanguageFieldsFilled &&
      fund.image.trim() !== '' &&
      fund.imageSmall.trim() !== '' &&
      fund.color.trim() !== '' &&
      //!imageUrlError &&
      //!imageSmallUrlError &&
      !colorError;

    const hasEnoughPortfolioItems = fund.portfolio.length >= 2;

    return allFieldsFilled && hasEnoughPortfolioItems;
  };

  const fetchFund = async () => {
    if (!id) return;
    // Fetch fund details
    const fundDetails = await getFundDetails(globalChainId, decodeURI(id));
    setFund({...fund, ...fundDetails});
    setToleranceLevels(fundDetails.toleranceLevels ? fundDetails.toleranceLevels.map((val) => val.toString()) : []);
  }

  const deleteFund = async () => {
    if (id) {
      await delFundDetails(globalChainId, id);
      router.push('/index-manager');
    }
  }

  const handleEditItem = (index: number) => {
    setEditItemIndex(index);
    setIsEditModalOpen(true);
  };

  const handleEditItemClose = () => {
    setIsEditModalOpen(false);
    setEditItemIndex(null);
  };

  const handleEditItemSubmit = (updatedItem: PortfolioItem) => {
    if (editItemIndex !== null) {
      const updatedPortfolio = [...fund.portfolio];
      updatedPortfolio[editItemIndex] = updatedItem;
      setFund({ ...fund, portfolio: updatedPortfolio });
    }
    handleEditItemClose();
  };

  useEffect(() => {
    if (id) {
      // Fetch fund details
      fetchFund();
    }
  }, [id])

  return (
    <Stack direction="row" spacing={4} p={4}>
      <OpaqueCard sx={{ flex: 1 }}>
        <Stack spacing={2}>
          {/* Left side: Form fields */}
          <FormControl fullWidth sx={{my:2}}>
            <InputLabel id="language-select-label">Language</InputLabel>
            <Select
              labelId="language-select-label"
              value={currentLanguage}
              onChange={handleLanguageChange}
              label="Language"
            >
              <MenuItem value={Language.EN}>English</MenuItem>
              <MenuItem value={Language.ES}>Spanish</MenuItem>
              <MenuItem value={Language.PT}>Portuguese</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Fund Name"
            fullWidth
            value={fund.name[currentLanguage]}
            onChange={handleInputChange('name')}
          />
          
          <FormControl>
            <InputLabel id="riskTolerance-select-label">Risk Tolerance</InputLabel>
            <Select
              labelId={'riskTolerance-select-label'}
              id="demo-multiple-checkbox"
              value={toleranceLevels.join(',')}
              onChange={handleChangeRiskTolerance}
              label={'Risk Tolerance'}
            >
              {availableRiskTolerances.map((name) => (
                <MenuItem key={name} value={name}>
                  {/* <Checkbox checked={fund.toleranceLevels?.includes(name as ToleranceLevels)} /> */}
                  <ListItemText primary={name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            label="Fund Subtitle"
            fullWidth
            value={fund.cardSubtitle[currentLanguage]}
            onChange={handleInputChange('cardSubtitle')}
            multiline
            rows={2}
          />
          <TextField
            label="Fund Description"
            fullWidth
            multiline
            rows={4}
            value={fund.description[currentLanguage]}
            onChange={handleInputChange('description')}
          />
          <TextField
            label="Image URL"
            fullWidth
            value={fund.image}
            onChange={handleChange('image')}
            //error={Boolean(imageUrlError)}
            helperText={imageUrlError}
          />
          <TextField
            label="Small Image URL"
            fullWidth
            value={fund.imageSmall}
            onChange={handleChange('imageSmall')}
            //error={Boolean(imageSmallUrlError)}
            helperText={imageSmallUrlError}
          />
          <TextField
            label="Color"
            fullWidth
            value={fund.color}
            onChange={handleChange('color')}
            error={Boolean(colorError)}
            helperText={colorError}
          />

          <FormGroup sx={{display: 'flex', flexDirection: 'row', justifyContent: 'start'}}>
            <FormControlLabel labelPlacement={'start'} control={<Checkbox  checked={fund.public} onChange={handleChange('public')} />} label="Is Public Fund?" />
          </FormGroup>
          {!id && 
            <Button
              variant="contained"
              color={theme.palette.mode === 'dark' ? 'primary' : 'secondary'}
              onClick={handleCopyToClipboard}
              disabled={!isFormValid()}
            >
              Copy to Clipboard
            </Button>
          }
          {id && 
            <Button
              variant="contained"
              color={theme.palette.mode === 'dark' ? 'primary' : 'secondary'}
              onClick={handleSave}
              disabled={!isFormValid()}
            >
              Save
            </Button>
          }
            <Button
              variant="contained"
              color={'error'}
              onClick={deleteFund}
            >
              Delete
            </Button>
            <Button
              variant="contained"
              color={'info'}
              onClick={() => {setIsTestModalOpen(true)}}
            >
              Test
            </Button>
            
          
        </Stack>
      </OpaqueCard>

      {/* Right side: UniswapPoolChecker and portfolio list */}
      <Stack spacing={2} flex={1}>
        <UniswapPoolChecker
          registerPortfolioItem={handlePortfolioItemRegister}
        />
        {fund.portfolio.length > 0 &&
          <Grid container >
            {fund.portfolio.map((item, index) => {


              return (<Grid key={index} size={12} my={1}><OpaqueCard sx={{cursor: 'pointer'}} onClick={() => handleEditItem(index)}>
                <Grid container alignItems={'center'} justifyContent={'center'}>
                  <Grid size={4} textAlign={'center'}>
                    {/* <Avatar src={fund.sourceToken.logo} sx={{ width: 24, height: 24 }}/> */}
                    {<Checkbox disabled checked={item.active} />}
                  </Grid>
                  <Grid size={4} textAlign={'center'}>
                    <strong> {fund.sourceToken ? `${fund.sourceToken.name}/${item.name}` : `${item.name}`} </strong>
                    {/* <Avatar src={item.logo} sx={{ width: 24, height: 24 }}/>  */}
                  </Grid>
                  <Grid size={4} textAlign={'center'}>
                    <Chip label={`${item.poolFee / 10000}%`} color={'default'} />
                  </Grid>
                </Grid>
              </OpaqueCard></Grid>
              )
            })}
          </Grid>
        }
        {editItemIndex !== null && (
          <EditPortfolioItem
            open={isEditModalOpen}
            onClose={handleEditItemClose}
            portfolioItem={fund.portfolio[editItemIndex]}
            indexFund={fund}
            onSubmit={handleEditItemSubmit}
            onDelete={handleDelete}
          />
        )}
      </Stack>

      <Dialog
        open={isTestModalOpen}
        onClose={() => {setIsTestModalOpen(false)}}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <BuyItem isNativeToken={isNativeToken} confirmationHash={confirmationHash} status={status} portfolio={fund} sourceToken={sourceToken} sourceTokens={sourceTokens} setSourceToken={setSourceToken} balance={balance} allowance={allowance} rawAmount={rawAmount} handleAmountUpdate={handleAmountUpdate} amount={amount} handleApproval={handleApproval} loading={loading} allowanceAmount={allowanceAmount} handleSpot={handleSpot} />
      </Dialog>
    </Stack>
  );
};

export default IndexFundForm;