import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  FormControlLabel,
  Checkbox,
  Typography,
  Menu,
  Fab
} from '@mui/material';
import PercentIcon from '@mui/icons-material/Percent';
import { IndexFund, PoolData, PortfolioItem } from '@/service/types';
import { Token as UniswapToken } from '@uniswap/sdk-core';
import IUniswapV3PoolABI from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'

import { config } from '@/config';
import { Language } from '@/metadata/translations';
import { computePoolAddress, FeeAmount } from '@uniswap/v3-sdk';
import { getAddress, zeroAddress } from 'viem';
import { normalizeDevChains } from '@/service/helpers';
import { readContract } from 'wagmi/actions';

interface EditPortfolioItemProps {
  open: boolean;
  onClose: () => void;
  portfolioItem: PortfolioItem;
  indexFund: IndexFund;
  onSubmit: (item: PortfolioItem) => void;
  onDelete: (address: string) => void;
}

const poolContractMap = {
  1: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  137: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  8453: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
  43114 : '0x740b1c1de25031C31FF4fC9A62f554A55cdC1baD',
  42161: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  56: '0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7',
  10: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
}

const USDT = process.env.NEXT_PUBLIC_USDT_ADDRESS as string;
const USDC = process.env.NEXT_PUBLIC_USDC_ADDRESS as string;
const feeTiers = [FeeAmount.LOWEST, FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH];
const EditPortfolioItem: React.FC<EditPortfolioItemProps> = ({ open, onClose, portfolioItem, onSubmit, indexFund, onDelete }) => {
  const [item, setItem] = useState<PortfolioItem>(portfolioItem);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(Language.EN);
  const [poolData, setPoolData] = useState<PoolData | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const deleteItem = () => {
    onDelete(item.address);
    onClose();
  };    

  const handleLanguageChange = (event: SelectChangeEvent<Language>) => {
    setCurrentLanguage(event.target.value as Language);
  };

  const handleInputChange =
    (field: keyof PortfolioItem) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setItem({
        ...item,
        [field]: field === 'weight' ? parseFloat(event.target.value) : event.target.value,
      });
    };

  const handleCheckboxChange =
    (field: keyof PortfolioItem) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setItem({
        ...item,
        [field]: event.target.checked,
      });
    };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setItem({
      ...item,
      description: {
        ...item.description,
        [currentLanguage]: event.target.value,
      },
    });
  };

  const handleFabClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSave = () => {
    onSubmit(item);
    onClose();
  };

  const handleMenuItemClick = (feeAmount: number) => {
    setItem((prev) => (
      {...prev, poolFee: feeAmount}
    ));
    setAnchorEl(null);
    queryPools();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const queryPools = async () => {
    setPoolData(null);
    try {
      const souceAddress = indexFund.sourceToken?.address || USDT;
      const targetAddress = item.address;

      const poolAddress = computePoolAddress({
        factoryAddress: poolContractMap[normalizeDevChains(item.chainId)],
        tokenA: new UniswapToken(item.chainId, souceAddress, indexFund.sourceToken?.decimals || 0, indexFund.sourceToken?.name || 'USDT'),
        tokenB: new UniswapToken(item.chainId, targetAddress, item.decimals, item.name),
        fee: item.poolFee,
      })
      if (!config) return;
      const liquidity = await readContract(config, {
        abi: IUniswapV3PoolABI.abi,
        address: getAddress(poolAddress),
        functionName: 'liquidity',
      });
      const data = {
        id: poolAddress,
        feeTier: item.poolFee,
        liquidity: BigInt(liquidity as bigint).toString()
      } as PoolData;
      setPoolData(data);
    } catch (err) {
      setPoolData(null);
    }

  };

  useEffect(() => {
    queryPools();
  }, []);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Portfolio Item</DialogTitle>
      <DialogContent>
          <Stack spacing={2}>
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
              label="Name"
              value={item.name}
              onChange={handleInputChange('name')}
              fullWidth
            />
            <TextField
              label="Description"
              value={item.description[currentLanguage]}
              onChange={handleDescriptionChange}
              fullWidth
              multiline
            />
            <TextField
              label="Address"
              value={item.address}
              onChange={handleInputChange('address')}
              fullWidth
            />
            <TextField
              label="Logo"
              value={item.logo}
              onChange={handleInputChange('logo')}
              fullWidth
            />
            <TextField
              label="Weight"
              type="number"
              value={item.weight}
              onChange={handleInputChange('weight')}
              fullWidth
            />
            <>
              <Fab color={'default'} size="small" onClick={handleFabClick}>
                {item.poolFee ? `${item.poolFee / 10000}%` : <PercentIcon />}
              </Fab>
              <Menu
                id="fee-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {feeTiers.map((feeAmount) => (
                  <MenuItem
                    key={feeAmount}
                    selected={feeAmount === item.poolFee}
                    onClick={() => handleMenuItemClick(feeAmount)}
                  >
                    {feeAmount / 10000}%
                  </MenuItem>
                ))}
              </Menu>
            </>
            <FormControlLabel
              control={
                <Checkbox
                  checked={item.active}
                  onChange={handleCheckboxChange('active')}
                />
              }
              label="Active"
            />
            <Typography variant="h6">Pool Data</Typography>
            <Typography>Fee Tier: {item.poolFee}</Typography>
            <Typography>Liquidity: {poolData?.liquidity || 'N/A'}</Typography>
          </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={deleteItem}>Delete</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPortfolioItem;
