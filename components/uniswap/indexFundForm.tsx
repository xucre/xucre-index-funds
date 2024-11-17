import React, { useState } from 'react';
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
} from '@mui/material';
import { IndexFund } from '@/hooks/useIndexFunds';
import UniswapPoolChecker, { PoolData } from '@/components/uniswap/poolChecker';
import { Language } from '@/metadata/translations';
import { useSnackbar } from 'notistack';
import { useAccount } from 'wagmi';
import OpaqueCard from '../ui/OpaqueCard';

const IndexFundForm = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { chainId } = useAccount();
  const theme = useTheme();
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
    chainId: chainId || 137,
    portfolio: [],
    custom: true,
    sourceToken: undefined,
  });

  const [currentLanguage, setCurrentLanguage] = useState<Language>(Language.EN);

  // Validation state
  const [imageUrlError, setImageUrlError] = useState<string>('');
  const [imageSmallUrlError, setImageSmallUrlError] = useState<string>('');
  const [colorError, setColorError] = useState<string>('');

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

  const handlePortfolioItemRegister = (pool: PoolData) => {
    setFund({
      ...fund,
      portfolio: [
        ...fund.portfolio,
        {
          name: pool.targetToken.name,
          chainId: chainId || 137,
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
        chainId: chainId || 137,
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

  const handleSubmit = () => {
    // Validate before submit
    let valid = true;

    if (fund.image && !validateUrl(fund.image)) {
      setImageUrlError('Please enter a valid URL.');
      valid = false;
    }

    if (fund.imageSmall && !validateUrl(fund.imageSmall)) {
      setImageSmallUrlError('Please enter a valid URL.');
      valid = false;
    }

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

    navigator.clipboard.writeText(JSON.stringify(fund, null, 2));
    // Handle form submission logic
    console.log('IndexFund:', fund);
    enqueueSnackbar('Copied to clipboard.', {
      variant: 'success',
    })
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
      !imageUrlError &&
      !imageSmallUrlError &&
      !colorError;

    const hasEnoughPortfolioItems = fund.portfolio.length >= 2;

    return allFieldsFilled && hasEnoughPortfolioItems;
  };

  return (
    <Stack direction="row" spacing={4} p={4} pb={10}>
      <OpaqueCard sx={{ flex: 1 }}>
        <Stack spacing={2}>
          {/* Left side: Form fields */}
          <FormControl fullWidth>
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
            error={Boolean(imageUrlError)}
            helperText={imageUrlError}
          />
          <TextField
            label="Small Image URL"
            fullWidth
            value={fund.imageSmall}
            onChange={handleChange('imageSmall')}
            error={Boolean(imageSmallUrlError)}
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
          <Button
            variant="contained"
            color={theme.palette.mode === 'dark' ? 'primary' : 'secondary'}
            onClick={handleSubmit}
            disabled={!isFormValid()}
          >
            Copy to Clipboard
          </Button>
        </Stack>
      </OpaqueCard>

      {/* Right side: UniswapPoolChecker and portfolio list */}
      <Stack spacing={2} flex={1}>
        <UniswapPoolChecker
          registerPortfolioItem={handlePortfolioItemRegister}
        />
        {fund.portfolio.length > 0 &&
          <Stack direction={'column'} spacing={2}>
            {fund.portfolio.map((item, index) => {
              console.log(fund);
              return (<OpaqueCard key={index}>
                <Stack direction={'row'} spacing={1} justifyContent={'center'} alignItems={'center'}>
                  {/* <Avatar src={fund.sourceToken.logo} sx={{ width: 24, height: 24 }}/> */}
                  <strong> {fund.sourceToken ? fund.sourceToken.name : ''} / {item.name}</strong>
                  {/* <Avatar src={item.logo} sx={{ width: 24, height: 24 }}/>  */}
                  <Chip label={`${item.poolFee / 10000}%`} color={'default'} />
                </Stack>
              </OpaqueCard>
              )
            })}
          </Stack>
        }
        
      </Stack>
    </Stack>
  );
};

export default IndexFundForm;