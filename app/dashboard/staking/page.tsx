// filepath: /Users/jp/Desktop/Repos/xucre/xucre-index-funds/app/dashboard/staking/page.tsx
'use client'

import { useClerkUser } from "@/hooks/useClerkUser";
import { Box, Button, Card, CardContent, CircularProgress, Container, FormControl, Grid, InputLabel, MenuItem, Select, TextField, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { 
  initializeBeefyFinance, 
  getVaultsByChain, 
  getUserVaultBalance, 
  depositToVault, 
  withdrawFromVault,
  setSafeWalletAddress, 
  BeefyVault,
  BeefyVaultAPY,
  getVaultAPYs
} from "@/service/safe/features/stake";
import OpaqueCard from "@/components/ui/OpaqueCard";
import { enqueueSnackbar } from "notistack";

export default function DashboardStaking() {
  const theme = useTheme();
  const { user, safeWallet, refreshSafeWallet: syncSafeWallet } = useClerkUser();
  
  // State variables
  const [loading, setLoading] = useState<boolean>(false);
  const [vaults, setVaults] = useState<BeefyVault[]>([]);
  const [selectedVault, setSelectedVault] = useState<BeefyVault>({} as BeefyVault);
  const [vaultApys, setVaultApys] = useState<BeefyVaultAPY>({});
  //const [selectedVault, setSelectedVault] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [selectedChainId, setSelectedChainId] = useState<string>('polygon'); // Default to Ethereum Mainnet
  const [vaultBalances, setVaultBalances] = useState<{[key: string]: string}>({});
  const [txPending, setTxPending] = useState<boolean>(false);
  const [txHash, setTxHash] = useState<string>('');

  // Chain options
  const chainOptions = [
    { id: '1', name: 'Ethereum', api: 'ethereum' },
    { id: '137', name: 'Polygon', api: 'polygon' },
    { id: '56', name: 'BNB Chain', api: 'bnb' },
    { id: '43114', name: 'Avalanche', api: 'avalanche' },
    { id: '42161', name: 'Arbitrum', api: 'arbitrum' },
    { id: '10', name: 'Optimism', api: 'optimism' }
  ];

  // Fetch user's Safe wallet
  useEffect(() => {
    if (user && user.id) {
      syncSafeWallet();
    }
  }, [user]);

  // Set the safe wallet address in the BeefyFinance service
  useEffect(() => {
    if (safeWallet) {
      // Initialize Beefy Finance with the safe wallet address
      initializeBeefyFinance(safeWallet);
      setSafeWalletAddress(safeWallet);
      fetchVaults();
    }
  }, [safeWallet, selectedChainId]);

  // Fetch vaults based on selected chain
  const fetchVaults = async () => {
    if (!safeWallet) return;
    console.log(selectedChainId)
    setLoading(true);
    try {
        const chainVaults = await getVaultsByChain(selectedChainId);
        setVaults(chainVaults);
        console.log('Fetched vaults:', chainVaults);
        const _vaultApys = await getVaultAPYs();
        setVaultApys(_vaultApys);
        console.log('Fetched vault APYs:', _vaultApys);
        // Reset selected vault when changing chains
        //setSelectedVault('');
        setSelectedVault({} as BeefyVault);
        // Clear previous balances
        setVaultBalances({});
    } catch (error) {
        console.error('Error fetching vaults:', error);
    } finally {
        setLoading(false);
    }
  };

  // Fetch user's balance for the selected vault
  const fetchVaultBalance = async (vaultAddress: string) => {
    if (!safeWallet || !vaultAddress) return;
    
    try {
      const balance = await getUserVaultBalance(
        vaultAddress as `0x${string}`,
        safeWallet as `0x${string}`
      );
      
      setVaultBalances(prev => ({
        ...prev,
        [vaultAddress]: balance
      }));
    } catch (error) {
      console.error('Error fetching vault balance:', error);
      setVaultBalances(prev => ({
        ...prev,
        [vaultAddress]: '0'
      }));
    }
  };

  // Handle vault selection
  const handleVaultChange = (event: any) => {
    const vaultAddress = event.target.value;
    const _vault = vaults.find(v => v.earnContractAddress === vaultAddress);
    console.log('Selected vault:', _vault);
    if (!_vault) return;
    setSelectedVault(_vault);
    
    if (vaultAddress) {
      //fetchVaultBalance(vaultAddress);
    }
  };

  // Handle deposit
  const handleDeposit = async () => {
    if (!safeWallet || !selectedVault || !depositAmount) return;
    
    setTxPending(true);
    setTxHash('');
    
    try {
      const vault = vaults.find(v => v.earnContractAddress === selectedVault.earnContractAddress);
      if (!vault) throw new Error('Vault not found');
      
      // Get the vault's underlying token
      const tokenAddress = vault.tokenAddress as `0x${string}`;
      
      // Execute deposit
      const hash = await depositToVault(
        selectedVault.earnContractAddress as `0x${string}`,
        tokenAddress,
        selectedVault.earnContractAddress as `0x${string}`,
        depositAmount,
        safeWallet
      );
      
      setTxHash(hash);
      
      // Refresh balance after transaction
      setTimeout(() => {
        fetchVaultBalance(selectedVault.earnContractAddress);
      }, 5000);
    } catch (error) {
      enqueueSnackbar(`${error.message}`, {variant: 'error', autoHideDuration: 3000})
          
      console.error('Error depositing to vault:', error);
    } finally {
      setTxPending(false);
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!safeWallet || !selectedVault || !withdrawAmount) return;
    
    setTxPending(true);
    setTxHash('');
    
    try {
      // Execute withdrawal
      const hash = await withdrawFromVault(
        selectedVault.earnContractAddress as `0x${string}`,
        withdrawAmount,
        safeWallet
      );
      
      setTxHash(hash);
      
      // Refresh balance after transaction
      setTimeout(() => {
        fetchVaultBalance(selectedVault.earnContractAddress as `0x${string}`);
      }, 5000);
    } catch (error) {
      console.error('Error withdrawing from vault:', error);
    } finally {
      setTxPending(false);
    }
  };

  // Get APY for the selected vault
  const getSelectedVaultAPY = () => {
    if (!selectedVault.id) return 0;
    
    const apy = vaultApys[selectedVault.id];
    console.log('Selected apy:', apy);
    if (!apy) return 0;
    
    return apy as number;
  };

  const apy = getSelectedVaultAPY();

  if (!safeWallet) {
    return (
      <Container>
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="h5">
            Please connect your wallet to use staking features
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Stake your assets in Beefy Finance vaults to earn yield
        </Typography>
      </Box>

      <OpaqueCard sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Select Chain and Vault
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="chain-select-label">Blockchain</InputLabel>
                <Select
                  labelId="chain-select-label"
                  id="chain-select"
                  value={selectedChainId}
                  label="Blockchain"
                  onChange={(e) => setSelectedChainId(e.target.value)}
                >
                  {chainOptions.map((chain) => (
                    <MenuItem key={chain.id} value={chain.api}>
                      {chain.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="vault-select-label">Vault</InputLabel>
                <Select
                  labelId="vault-select-label"
                  id="vault-select"
                  value={selectedVault.earnContractAddress || ''}
                  label="Vault"
                  onChange={handleVaultChange}
                  disabled={loading || vaults.length === 0}
                >
                  {vaults.map((vault) => (
                    <MenuItem key={vault.earnContractAddress} value={vault.earnContractAddress}>
                      {vault.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {selectedVault.earnContractAddress && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body1">
                <strong>Your Balance:</strong> {vaultBalances[selectedVault.earnContractAddress] || '0'} tokens
              </Typography>
              <Typography variant="body1">
                <strong>APY:</strong> {apy !== null && apy !== undefined ? `${(apy * 100).toFixed(2)}%` : 'Loading...'}
              </Typography>
              <Typography variant="body1">
                <strong>Vault Address:</strong> {selectedVault.earnContractAddress}
              </Typography>
            </Box>
          )}
        </CardContent>
      </OpaqueCard>

      {selectedVault.earnContractAddress && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <OpaqueCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Deposit
                </Typography>
                <TextField
                  fullWidth
                  label="Amount"
                  variant="outlined"
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  sx={{ mb: 2 }}
                  disabled={txPending}
                />
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleDeposit}
                  disabled={!depositAmount || txPending}
                >
                  {txPending ? <CircularProgress size={24} color="inherit" /> : 'Deposit'}
                </Button>
              </CardContent>
            </OpaqueCard>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <OpaqueCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Withdraw
                </Typography>
                <TextField
                  fullWidth
                  label="Amount"
                  variant="outlined"
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  sx={{ mb: 2 }}
                  disabled={txPending}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  onClick={handleWithdraw}
                  disabled={!withdrawAmount || txPending}
                >
                  {txPending ? <CircularProgress size={24} color="inherit" /> : 'Withdraw'}
                </Button>
              </CardContent>
            </OpaqueCard>
          </Grid>
        </Grid>
      )}

      {txHash.length > 0 && (
        <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Typography variant="body1">
            <strong>Transaction Hash:</strong> {txHash}
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export const dynamic = "force-dynamic";
