'use server'

import { createPublicClient, http, parseUnits, formatUnits, encodeFunctionData } from 'viem';
import { mainnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import request from 'superagent';
import dotenv from 'dotenv';
import { createContractInteractionTransaction, executeBatchTransaction, TransactionData } from './transaction';
import erc20 from "@/public/erc20.json";
import vaultAbi from "@/public/beefyV7Vault.json";
import xucreStakerAbi from "@/public/xucreStaker.json";

// Load environment variables
dotenv.config();

// Shared client and state
let publicClient: ReturnType<typeof createPublicClient> | null = null;
let account: ReturnType<typeof privateKeyToAccount> | null = null;
let defaultSafeWalletAddress = '';



export interface BeefyVault {
  id: string;
  name: string;
  type: string;
  token: string;
  tokenAddress: string;
  tokenDecimals: number;
  earnedToken: string;
  earnedTokenAddress: string;
  earnContractAddress: string;
  oracle: string;
  oracleId: string;
  status: 'active' | 'eol' | 'paused';
  createdAt: number;
  platformId: string;
  assets: string[];
  risks: string[];
  strategyTypeId: string;
  buyTokenUrl: string;
  network: string;
  zaps: {
    strategyId: string;
  }[];
  lendingOracle?: {
    provider: string;
    address: string;
  };
  isGovVault: boolean;
  chain: string;
  strategy: string;
  pricePerFullShare: string;
  lastHarvest: number;
  apy?: number; // Adding this as it's referenced in your code but not in the JSON
}
export interface BeefyVaultAPY {
  [vaultId: string]: number;
}

/**
 * Initialize the client if not already done
 */
function initializeClient() {
  if (!publicClient) {
    if (!process.env.NEXT_PUBLIC_SAFE_RPC_URL) {
      throw new Error('NEXT_PUBLIC_SAFE_RPC_URL is not defined in the environment variables');
    }

    if (!process.env.DEVACCOUNTKEY) {
      throw new Error('DEVACCOUNTKEY is not defined in the environment variables');
    }
    
    const alchemyTransport = http(`${process.env.NEXT_PUBLIC_SAFE_RPC_URL}`);
    
    publicClient = createPublicClient({
      chain: mainnet,
      transport: alchemyTransport,
    });
    
    account = privateKeyToAccount(process.env.DEVACCOUNTKEY as `0x${string}`);
  }
}

/**
 * Initialize the Beefy Finance service with default parameters
 * @param safeWalletAddress Safe wallet address to use for transactions
 */
export async function initializeBeefyFinance(safeWalletAddress?: string) {
  initializeClient();
  
  if (safeWalletAddress) {
    defaultSafeWalletAddress = safeWalletAddress;
  }
}

/**
 * Set the Safe wallet address to use for transactions
 * @param safeWalletAddress The Safe wallet address to use
 */
export async function setSafeWalletAddress(safeWalletAddress: string) {
  defaultSafeWalletAddress = safeWalletAddress;
}

/**
 * Get all active vaults from Beefy Finance API
 * @returns Array of active Beefy Finance vaults
 */
export async function getActiveVaults() {
  try {
    initializeClient();
    const response = await request.get('https://api.beefy.finance/vaults');
    
    response.body.forEach((vault: any) => {
      if (vault.status !== 'active' || vault.network !== 'polygon'){

      } else {
        //console.log(vault);
      }
      
    });
    return response.body.filter((vault: any) => vault.status === 'active') as BeefyVault[];
  } catch (error) {
    console.error('Error fetching active vaults:', error);
    throw new Error('Failed to fetch active vaults');
  }
}

/**
 * Get APY data for Beefy Finance vaults
 * @returns Object with vault APYs by vault ID
 */
export async function getVaultAPYs() {
  try {
    initializeClient();
    const response = await request.get('https://api.beefy.finance/apy');
    return response.body as BeefyVaultAPY;
  } catch (error) {
    console.error('Error fetching vault APYs:', error);
    throw new Error('Failed to fetch vault APYs');
  }
}

/**
 * Get vault information by chain ID
 * @param chainId The blockchain chain ID
 * @returns Array of vaults for the specified chain
 */
export async function getVaultsByChain(network: string) {
  try {
    initializeClient();
    const vaults = await getActiveVaults();
    return vaults.filter((vault: any) => vault.network === network);
  } catch (error) {
    console.error(`Error fetching vaults for chain ${network}:`, error);
    throw new Error(`Failed to fetch vaults for chain ${network}`);
  }
}

/**
 * Deposit tokens into a Beefy Finance vault using Safe transaction service
 * @param vaultAddress The address of the vault
 * @param tokenAddress The address of the token to deposit
 * @param rewardTokenAddress The address of the reward token
 * @param amount The amount to deposit as a string
 * @param safeAddress Safe wallet address to use (overrides default)
 * @param decimals The token decimals (default: 18)
 * @returns Transaction hash
 */
export async function depositToVault(
  vaultAddress: `0x${string}`, 
  tokenAddress: `0x${string}`, 
  rewardTokenAddress: `0x${string}`,
  amount: string,
  safeAddress?: string,
  decimals: number = 18
) {
  try {
    initializeClient();
    
    if (!publicClient) {
      throw new Error('Client not initialized');
    }
    
    const amountInWei = parseUnits(amount, decimals);
    const effectiveSafeAddress = safeAddress || defaultSafeWalletAddress;
    const stakerContractAddress = process.env.NEXT_PUBLIC_SAFE_BEEFY_STAKE_POLYGON_ADDRESS as `0x${string}`;
    if (!effectiveSafeAddress) {
      throw new Error('No Safe wallet address provided');
    }
    
    // Check allowance first
    const allowanceData = {
      address: tokenAddress,
      abi: erc20,
      functionName: 'allowance',
      args: [effectiveSafeAddress as `0x${string}`, stakerContractAddress],
    };
    //console.log(allowanceData);
    let allowance: bigint = BigInt(0);
    try {
      allowance = await publicClient.readContract(allowanceData) as bigint;
    } catch (error) {
      console.error('Error fetching allowance:', error);
    }
    
    const transactions: TransactionData[] = [];
    
    // If allowance is insufficient, add approve transaction
    console.log('Allowance compared to amount: ', allowance, amountInWei);
    if (allowance < amountInWei) {
      const approveData = encodeFunctionData({
        abi: erc20,
        functionName: 'approve',
        args: [stakerContractAddress, amountInWei],
      });
      
      await executeBatchTransaction(
        [await createContractInteractionTransaction(
          tokenAddress,
          approveData,
          '0'
        )],
        effectiveSafeAddress,
        undefined, // Use default chainId
        undefined, // Use default RPC URL
        true // Use sponsored transaction by default
      );
    } else {
      console.log('skipping allowance');
    }
    
    // Add deposit transaction
    const _depositData = {
      abi: vaultAbi,
      functionName: 'deposit',
      args: [amountInWei],
    };
    // const _depositData = {
    //   address: stakerContractAddress,
    //   abi: xucreStakerAbi.abi,
    //   functionName: 'stakeTokens',
    //   args: [effectiveSafeAddress, tokenAddress, vaultAddress, rewardTokenAddress, amountInWei],
    // };
    
    let { abi : _vaultAbi, ...consoleData } = _depositData;
    console.log('depositData',consoleData);
    const depositData = encodeFunctionData(_depositData);
    
    console.log('Deposit data:', depositData);
    // Execute batch transaction
    console.log('Submitting deposit transaction via Safe transaction service');
    return executeBatchTransaction(
      [
        await createContractInteractionTransaction(
          stakerContractAddress,
          depositData,
          '0'
        )
      ],
      effectiveSafeAddress,
      undefined, // Use default chainId
      undefined, // Use default RPC URL
      true // Use sponsored transaction by default
    );
  } catch (error) {
    console.error('Error depositing to vault:', error);
    throw new Error(`Failed to deposit to vault: ${error}`);
  }
}

/**
 * Withdraw tokens from a Beefy Finance vault using Safe transaction service
 * @param vaultAddress The address of the vault
 * @param shares The amount of shares to withdraw as a string
 * @param safeAddress Safe wallet address to use (overrides default)
 * @param decimals The token decimals (default: 18)
 * @returns Transaction hash
 */
export async function withdrawFromVault(
  vaultAddress: `0x${string}`, 
  shares: string,
  safeAddress?: string,
  decimals: number = 18
) {
  try {
    initializeClient();
    
    const sharesInWei = parseUnits(shares, decimals);
    const effectiveSafeAddress = safeAddress || defaultSafeWalletAddress;
    
    if (!effectiveSafeAddress) {
      throw new Error('No Safe wallet address provided');
    }
    
    // Create withdraw transaction data
    const withdrawData = encodeFunctionData({
      abi: vaultAbi,
      functionName: 'withdraw',
      args: [sharesInWei],
    });
    
    // Execute transaction
    console.log('Submitting withdrawal via Safe transaction service');
    return executeBatchTransaction(
      [
        await createContractInteractionTransaction(
          vaultAddress,
          withdrawData,
          '0'
        )
      ],
      effectiveSafeAddress,
      undefined, // Use default chainId
      undefined, // Use default RPC URL
      true // Use sponsored transaction by default
    );
  } catch (error) {
    console.error('Error withdrawing from vault:', error);
    throw new Error(`Failed to withdraw from vault: ${error}`);
  }
}

/**
 * Get user's vault balance and calculate the underlying asset amount
 * @param vaultAddress The address of the vault
 * @param userAddress The user's wallet address
 * @param decimals The token decimals (default: 18)
 * @returns User's balance in the underlying asset
 */
export async function getUserVaultBalance(
  vaultAddress: `0x${string}`, 
  userAddress: `0x${string}`,
  decimals: number = 18
) {
  try {
    initializeClient();
    
    if (!publicClient) {
      throw new Error('Client not initialized');
    }
    
    // Get user's share balance
    const shares = await publicClient.readContract({
      address: vaultAddress,
      abi: vaultAbi,
      functionName: 'balanceOf',
      args: [userAddress],
    }) as string;
    
    // If user has no shares, return 0
    if (BigInt(shares) === BigInt(0)) {
      return '0';
    }
    
    // Get price per share
    const pricePerShare = await publicClient.readContract({
      address: vaultAddress,
      abi: vaultAbi,
      functionName: 'getPricePerFullShare',
    }) as string;
    
    // Calculate underlying balance
    const underlyingBalance = (BigInt(shares) * BigInt(pricePerShare)) / BigInt(10 ** decimals);
    return formatUnits(underlyingBalance, decimals);
  } catch (error) {
    console.error('Error getting user vault balance:', error);
    throw new Error(`Failed to get user vault balance: ${error}`);
  }
}

/**
 * Check if a vault is valid and active
 * @param vaultAddress The address of the vault to check
 * @returns Boolean indicating if the vault is valid
 */
export async function isValidVault(vaultAddress: `0x${string}`) {
  try {
    initializeClient();
    const vaults = await getActiveVaults();
    return vaults.some((vault: any) => 
      vault.earnContractAddress.toLowerCase() === vaultAddress.toLowerCase() && 
      vault.status === 'active'
    );
  } catch (error) {
    console.error('Error checking vault validity:', error);
    return false;
  }
}

/**
 * Get comprehensive vault information including APY
 * @param vaultAddress The address of the vault
 * @returns Detailed information about the vault
 */
export async function getVaultInfo(vaultAddress: `0x${string}`) {
  try {
    initializeClient();
    const vaults = await getActiveVaults();
    const vault = vaults.find((v: any) => 
      v.earnContractAddress.toLowerCase() === vaultAddress.toLowerCase()
    );
    
    if (!vault) {
      throw new Error('Vault not found');
    }
    
    const apys = await getVaultAPYs();
    const apy = apys[vault.id] || 0;
    
    return {
      ...vault,
      apy,
    };
  } catch (error) {
    console.error('Error getting vault info:', error);
    throw new Error(`Failed to get vault info: ${error}`);
  }
}
