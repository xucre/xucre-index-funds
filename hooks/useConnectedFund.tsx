import { Token } from "@/service/types";
import { useState, useEffect } from "react";
import { getAddress, zeroAddress, TransactionReceipt, BaseError } from "viem";
import { writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { useAccount, useBalance, useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { useSnackbar } from 'notistack';
import { erc20, XucreETF } from "@/metadata/abi";
import { config } from '@/config';
import { distributeWeights } from "@/service/helpers";

const contractAddressMap = {
  1: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_ETH as string,
  137: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as string,
  8453: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS_BASE as string,
  31337 : '0xCBBe2A5c3A22BE749D5DDF24e9534f98951983e2' as string
} as {[key: number]: string};


const sourceTokens: Token[] = [
    {
      id: 'polygon-bridged-usdt-polygon',
      name: "USDT",
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      description: "Tether USD (USDT) is a stablecoin pegged to the US Dollar.",
      decimals: 6,
      logo: "https://xucre-public.s3.sa-east-1.amazonaws.com/tether.png",
      chainId: 137,
      symbol: "USDT"
    },
    {
      id: 'usd-coin',
      name: "USDC",
      address: "0x3c499c542cef5e3811e1192ce70d8cc03d5c3359",
      description: "USD Coin (USDC) is a stablecoin backed by US dollars.",
      decimals: 6,
      logo: "https://xucre-public.s3.sa-east-1.amazonaws.com/usdc.png",
      chainId: 137,
      symbol: "USDC"
    }
];
  

export function useConnectedFund({ portfolio, sourceToken, fees }: { portfolio: Token[] | undefined, sourceToken: Token, fees: {[key: string]: number} }) {
  const { isConnected, address, chainId, chain } = useAccount();
  const { data :nativeBalance } = useBalance({address});
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);  
  const [confirmationHash, setConfirmationHash] = useState('');
  const { data: hash, error, writeContractAsync, isPending, status, } = useWriteContract()
  const { data: sourceBalance, refetch: balanceRefetch } = useReadContract({
    address: sourceToken ? getAddress(sourceToken.address) : zeroAddress,
    abi: erc20,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { enabled: false }
  })

  const { data: sourceAllowance, refetch: allowanceRefetch } = useReadContract({
    address: sourceToken ? getAddress(sourceToken.address) : zeroAddress,
    abi: erc20,
    functionName: 'allowance',
    args: [address as `0x${string}`, contractAddressMap[chainId || 137] as `0x${string}`],
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
          contractAddressMap[chainId || 137] as `0x${string}`,
          amount.valueOf(),
        ],
        chain,
        account: address
      })
      const receipt = await waitForTransactionReceipt(config, { hash: result });
      const receipt2 = receipt as TransactionReceipt;
      if (receipt2.status === 'success') {
        enqueueSnackbar(`Success`, { variant: 'success', autoHideDuration: 2000 });
        await initiateSpot(amount);
      } else {
        enqueueSnackbar(`Error`, { variant: 'error', autoHideDuration: 5000 });
        setIsLoading(false);
      }
    } catch (err) {
      enqueueSnackbar(err instanceof Error ? err.message : 'An error occurred', { variant: 'error', autoHideDuration: 5000 });
      setIsLoading(false);
    }

    //setIsLoading(false);

    //return 'success';
  }

  const initiateSpot = async (amount: BigInt) => {
    //const runSwap = await xucre.spotExecution(signerAddress, [ethers.utils.getAddress(DAI), ethers.utils.getAddress(WBTC), UNI_CONTRACT.address], [6000, 2000, 2000], [3000, 3000, 3000], USDT_CONTRACT.address, balanceUSDT.div(100));
    try {
      if (!sourceToken || !portfolio) return;
      setIsLoading(true);
      const _portfolio = portfolio.reduce<Token[]>((acc, item) => {
        const fee = fees[item.address];
        if (fee && fee > 0) {
          return [...acc, { ...item, fee }]
        }
        return acc;
      }, []);
      const _tokenAllocations = distributeWeights(_portfolio);
      //console.log(tokenAllocations);
      const tokenAddresses = _portfolio.map((item) => getAddress(item.address) as `0x${string}`);
      const tokenAllocations = _tokenAllocations.map((item) => BigInt(item.weight));
      const tokenPoolFees = _portfolio.reduce((acc, item) => {
        if (item.fee) {
          return [...acc, item.fee]
        }
        return acc;
      }, [] as number[]);
      const requestOptions = {
        abi: XucreETF,
        address: getAddress(contractAddressMap[chainId || 137]),
        functionName: 'spotExecution' as "grantRole" | "pause" | "renounceRole" | "revokeRole" | "spotExecution" | "unpause" | "update" | "withdrawBalance" | "withdrawTokenBalance",
        args: [
          address as `0x${string}`,
          tokenAddresses,
          tokenAllocations,
          tokenPoolFees,
          getAddress(sourceToken.address) as `0x${string}`,
          amount
        ],
        chain: chain,
        account: address
      };
      
      const result = await writeContractAsync({
        ...requestOptions,
        args: [
          address as `0x${string}`,
          tokenAddresses,
          tokenAllocations,
          tokenPoolFees,
          getAddress(sourceToken.address) as `0x${string}`,
          amount
        ] as [ `0x${string}`, `0x${string}`[], bigint[], number[], `0x${string}`, bigint ]
      });
      enqueueSnackbar(`Success: ${result}`, { variant: 'success', autoHideDuration: 2000 });
      setConfirmationHash(result);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      if (err instanceof Error) {
        enqueueSnackbar(err.message, { variant: 'error', autoHideDuration: 2000 });
      } else {
        enqueueSnackbar(String(err), { variant: 'error', autoHideDuration: 2000 });
      }
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

  const loading = isLoading || isPending;
  const balance = sourceToken && nativeBalance && getAddress(sourceToken.address) === getAddress('0x4200000000000000000000000000000000000006') ? nativeBalance.value : sourceBalance;
  const isNativeToken = sourceToken ? getAddress(sourceToken.address) === getAddress('0x4200000000000000000000000000000000000006') : false;

  return { balance: balance, isNativeToken, allowance: sourceAllowance, sourceToken, sourceTokens, approveContract, initiateSpot, hash, error, loading, status, confirmationHash }
}