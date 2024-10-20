import { useEffect, useMemo, useState } from "react";
import { writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { type BaseError, useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from "wagmi";
import erc20 from "@/public/erc20.json";
import XucreETF from "@/public/XucreETF.json";
import indexFundJson from "@/public/indexFunds.json";
import sourceTokensJson from "@/public/sourceTokens.json";
import { getAddress, TransactionReceipt, zeroAddress } from "viem";
import { useSnackbar } from 'notistack';
import { config } from "@/config";
import { distributeWeights, normalizeDevChains } from "@/service/helpers";
import { useLanguage } from "./useLanguage";
import languageData, { Language } from '@/metadata/translations'

export type PortfolioItem = {
  name: string;
  chainId: number;
  address: string;
  weight: number;
  description: {
    [key in Language]: string;
  };
  logo: string;
  active: boolean;
  poolFee: number;
  decimals: number;
  chain_logo: string;
  chartColor: string;
  links: string[];
  sourceFees: {
    [key: string]: number;
  };
}

export type IndexFund = {
  name: {
    [key in Language]: string;
  };
  cardSubtitle: {
    [key in Language]: string;
  };
  description: {
    [key in Language]: string;
  };
  image: string;
  imageSmall: string;
  color: string;
  chainId: number;
  custom: boolean | undefined;
  sourceToken: PortfolioItem | undefined;
  portfolio: PortfolioItem[]
};

const initialSourceTokens = sourceTokensJson as PortfolioItem[];
const initialFunds = indexFundJson as IndexFund[];
const contractAddressMap = {
  1: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_ETH,
  137: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  8453: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_BASE
};

//console.log(initialFunds[0].portfolio.reduce((acc, item) => acc + item.weight, 0))
export function useIndexFunds({ chainId }: { chainId: number }) {
  const [indexFunds, setIndexFunds] = useState(initialFunds.filter((item) => item.chainId === chainId));
  const [sourceTokens, setSourceTokens] = useState(initialSourceTokens.find((item) => item.chainId === chainId && item.active));

  useEffect(() => {
    setIndexFunds(initialFunds.filter((item) => item.chainId === chainId));
    setSourceTokens(initialSourceTokens.find((item) => item.chainId === chainId && item.active));
  }, [chainId])

  return useMemo(
    () => ({ indexFunds, sourceTokens }),
    [chainId, indexFunds, sourceTokens],
  );
}

export function useConnectedIndexFund({ fund }: { fund: IndexFund }) {
  const { isConnected, address, chainId, chain } = useAccount();
  const { data :nativeBalance } = useBalance({address});
  const { enqueueSnackbar } = useSnackbar();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [sourceToken, setSourceToken] = useState(initialSourceTokens.find((item) => item.chainId === normalizeDevChains(chainId) && item.active));
  const [confirmationHash, setConfirmationHash] = useState('');
  const { data: hash, error, writeContractAsync, isPending, status, } = useWriteContract()
  const { data: sourceBalance, refetch: balanceRefetch } = useReadContract({
    address: sourceToken ? getAddress(sourceToken.address) : zeroAddress,
    abi: erc20,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: false }
  })

  const { data: sourceAllowance, refetch: allowanceRefetch } = useReadContract({
    address: sourceToken ? getAddress(sourceToken.address) : zeroAddress,
    abi: erc20,
    functionName: 'allowance',
    args: [address, contractAddressMap[chainId]],
    query: { enabled: false }
  })

  const confirmedTransaction = useWaitForTransactionReceipt({
    hash: confirmationHash as `0x${string}`
  });

  const approveContract = async (amount: BigInt) => {
    setIsLoading(true);
    try {
      //console.log(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS, amount)
      const result = await writeContract(config, {
        abi: erc20,
        address: getAddress(sourceToken.address),
        functionName: 'approve',
        chainId,
        args: [
          contractAddressMap[chainId],
          amount.toString(),
        ],
        chain,
        account: address
      })
      const receipt = await waitForTransactionReceipt(config, { hash: result });
      const receipt2 = receipt as TransactionReceipt;
      if (receipt2.status === 'success') {
        enqueueSnackbar(`${languageData[language].ui.transaction_successful}:`, { variant: 'success', autoHideDuration: 5000 });
        await initiateSpot(amount);
      } else {
        enqueueSnackbar(`${languageData[language].ui.error}`, { variant: 'error', autoHideDuration: 5000 });
        setIsLoading(false);
      }
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error', autoHideDuration: 5000 });
      setIsLoading(false);
    }

    //console.log(result);
    //setIsLoading(false);

    //return 'success';
  }

  const initiateSpot = async (amount: BigInt) => {
    //const runSwap = await xucre.spotExecution(signerAddress, [ethers.utils.getAddress(DAI), ethers.utils.getAddress(WBTC), UNI_CONTRACT.address], [6000, 2000, 2000], [3000, 3000, 3000], USDT_CONTRACT.address, balanceUSDT.div(100));
    try {
      setIsLoading(true);
      const portfolio = fund.portfolio.filter((item) => item.active);
      const tokenAllocations = distributeWeights(portfolio);
      const tokenAddresses = portfolio.map((item) => getAddress(item.address));
      //const tokenAllocations = portfolio.map((item) => item.weight);
      const tokenPoolFees = portfolio.map((item) => item.sourceFees[sourceToken.address] ? item.sourceFees[sourceToken.address] : item.poolFee);
      const result = await writeContractAsync({
        abi: XucreETF.abi,
        address: getAddress(contractAddressMap[chainId]),
        functionName: 'spotExecution',
        args: [
          address,
          tokenAddresses,
          tokenAllocations,
          tokenPoolFees,
          getAddress(sourceToken.address),
          amount
        ],
        chain: chain,
        account: address
      })
      enqueueSnackbar(`${languageData[language].ui.transaction_successful}: ${result}`, { variant: 'success', autoHideDuration: 5000 });
      setConfirmationHash(result);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      enqueueSnackbar(err.message, { variant: 'error', autoHideDuration: 5000 });
    }
  }

  useEffect(() => {
    const runAsync = async () => {
      setIsLoading(true);
      await allowanceRefetch()
      await balanceRefetch()
      //await getPrices();
      setIsLoading(false);
    }

    if (confirmationHash.length > 0) {
      runAsync()
    }
  }, [confirmedTransaction])

  useEffect(() => {
    const runAsync = async () => {
      //setIsLoading(true);
      await allowanceRefetch()
      await balanceRefetch()
      //await getPrices();
      //setIsLoading(false);
    }
    if (isConnected && address && sourceToken) {
      //console.log('reloading balances');
      runAsync()
    }
  }, [isConnected, address, sourceToken])

  useEffect(() => {
    console.log(nativeBalance);
  }, [nativeBalance])

  useEffect(() => {
    if (error && error as BaseError) {
      const err = error as BaseError;
      console.log(err.details);
    }
  }, [error])

  useEffect(() => {
    setSourceToken(initialSourceTokens.find((item) => item.chainId === normalizeDevChains(chainId) && item.active));
  }, [chainId]);

  const loading = isLoading || isPending;
  const balance = getAddress(sourceToken.address) === getAddress('0x4200000000000000000000000000000000000006') ? nativeBalance.value : sourceBalance;
  const isNativeToken = getAddress(sourceToken.address) === getAddress('0x4200000000000000000000000000000000000006');

  return { balance: balance, isNativeToken, allowance: sourceAllowance, sourceToken, sourceTokens: initialSourceTokens.filter((token) => token.chainId === normalizeDevChains(chainId)), setSourceToken, approveContract, initiateSpot, hash, error, loading, status, confirmationHash }
}