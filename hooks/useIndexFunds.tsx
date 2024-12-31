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
import { PortfolioItem, IndexFund } from "@/service/types";
import { globalChainId } from "@/service/constants";

const initialSourceTokens = sourceTokensJson as unknown as PortfolioItem[];
const initialFunds = indexFundJson as IndexFund[];
const contractAddressMap = {
  1: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_ETH,
  137: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  8453: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_BASE,
  31337 : '0xCBBe2A5c3A22BE749D5DDF24e9534f98951983e2'
};

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

export function useConnectedIndexFund({ fund }: { fund: IndexFund | undefined }) {
  const { isConnected, address, chainId, chain } = useAccount();
  const { data :nativeBalance } = useBalance({address});
  const { enqueueSnackbar } = useSnackbar();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [sourceToken, setSourceToken] = useState(initialSourceTokens.find((item) => item.chainId === normalizeDevChains(chainId || globalChainId) && item.active));
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
    args: [address, contractAddressMap[chainId || globalChainId]],
    query: { enabled: false }
  })

  const confirmedTransaction = useWaitForTransactionReceipt({
    hash: confirmationHash as `0x${string}`
  });

  const approveContract = async (amount: BigInt) => {
    setIsLoading(true);
    try {
      if (!sourceToken) return;
      const result = await writeContract(config, {
        abi: erc20,
        address: getAddress(sourceToken.address),
        functionName: 'approve',
        chainId,
        args: [
          contractAddressMap[chainId || globalChainId],
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

    //setIsLoading(false);

    //return 'success';
  }

  const initiateSpot = async (amount: BigInt) => {
    //const runSwap = await xucre.spotExecution(signerAddress, [ethers.utils.getAddress(DAI), ethers.utils.getAddress(WBTC), UNI_CONTRACT.address], [6000, 2000, 2000], [3000, 3000, 3000], USDT_CONTRACT.address, balanceUSDT.div(100));
    try {
      if (!sourceToken || !fund) return;
      setIsLoading(true);
      const portfolio = fund.portfolio.filter((item) => item.active);
      const tokenAllocations = portfolio.map((item) => item.weight); //distributeWeights(portfolio);
      //console.log(tokenAllocations);
      const tokenAddresses = portfolio.map((item) => getAddress(item.address));
      //const tokenAllocations = portfolio.map((item) => item.weight);
      const tokenPoolFees = portfolio.map((item) => item.sourceFees[sourceToken.address] ? item.sourceFees[sourceToken.address] : item.poolFee);
      const requestOptions = {
        abi: XucreETF.abi,
        address: getAddress(contractAddressMap[chainId || globalChainId]),
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
      };
      
      const result = await writeContractAsync(requestOptions);
      enqueueSnackbar(`${languageData[language].ui.transaction_successful}: ${result}`, { variant: 'success', autoHideDuration: 5000 });
      setConfirmationHash(result);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      enqueueSnackbar(err.message, { variant: 'error', autoHideDuration: 2000 });
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
      runAsync()
    }
  }, [isConnected, address, sourceToken])

  useEffect(() => {
    if (error && error as BaseError) {
      const err = error as BaseError;
    }
  }, [error])

  useEffect(() => {
    if (!chainId) return;
    setSourceToken(initialSourceTokens.find((item) => item.chainId === normalizeDevChains(chainId) && item.active));
  }, [chainId]);

  const loading = isLoading || isPending;
  const balance = sourceToken && nativeBalance && getAddress(sourceToken.address) === getAddress('0x4200000000000000000000000000000000000006') ? nativeBalance.value : sourceBalance;
  const isNativeToken = sourceToken ? getAddress(sourceToken.address) === getAddress('0x4200000000000000000000000000000000000006') : false;

  return { balance: balance, isNativeToken, allowance: sourceAllowance, sourceToken, sourceTokens: initialSourceTokens.filter((token) => token.chainId === normalizeDevChains(chainId || globalChainId)), setSourceToken, approveContract, initiateSpot, hash, error, loading, status, confirmationHash }
}