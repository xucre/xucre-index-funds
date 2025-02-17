'use client'
import LoadingButton from "@mui/lab/LoadingButton";
import { useEffect, useState } from "react";
import { Token } from "@/service/types";
import {useConnectedFund} from "@/hooks/useConnectedFund";

export const BuyButton = ({ sourceToken, tokenList, amount, fees } : { sourceToken: Token, tokenList: Token[], amount: bigint, fees: {[key: string]: number} }) => {
  const { balance, allowance, loading, isNativeToken, confirmationHash, approveContract, initiateSpot, status } = useConnectedFund({ sourceToken, fees, portfolio: tokenList });
  const [isLoading, setIsLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState('');
  const isReadyToApprove = amount > BigInt(0);
  const isReadyToBuy = isReadyToApprove && ((allowance && BigInt(allowance) >= BigInt(amount)) || (isNativeToken && BigInt(balance as bigint) >= BigInt(amount)));

  useEffect(() => { setIsLoading(false) }, []);

  const handleApproval = () => {
    approveContract(amount);
  }  

  const handleSpot = () => {
    console.log('spotting');
    initiateSpot(amount);
  }

  const executeCombinedFlow = async () => {
    setIsLoading(true)
    try {
      if (!isReadyToBuy) {
        await handleApproval();
        setCurrentAction('approve');
      } else {
        await handleSpot();
        setCurrentAction('spot');
      }
    } catch (error) {console.error(error)}

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
  }, [confirmationHash, isReadyToBuy, currentAction]);

  if (!sourceToken) return null;
  return (
    <LoadingButton variant="contained" fullWidth disabled={!isReadyToApprove} onClick={executeCombinedFlow} loading={isLoading} loadingIndicator={"Executing..."}>
      {isReadyToBuy ? "Buy" : "Approve & Buy"}
    </LoadingButton>
  )
};
