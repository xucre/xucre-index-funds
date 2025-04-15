'use client'
import BillingHeader from "@/components/billing/BillingHeader";
import StripePricingTable from "@/components/billing/StripePricingTable";
import { useStripeBilling } from "@/hooks/useStripeBilling";
import { updateOrganizationLicenses } from "@/service/clerk";
import { upsertOrganization } from "@/service/sfdc";
import { checkoutSuccess } from "@/service/billing/stripe";
import { Box, Button, Skeleton, useTheme } from "@mui/material"
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import InvoiceTable from "@/components/billing/InvoiceTable";
import { setOrganizationSafeAddress } from "@/service/db";
import { useOrganizationWallet } from "@/hooks/useOrganizationWallet";
import EmptyEscrowWallet from "@/components/onboarding/EmptyEscrowWallet";
import languageData, { Language } from '@/metadata/translations';
import { useLanguage } from "@/hooks/useLanguage";
import TransferEscrowWallet from "@/components/onboarding/TransferEscrowWallet";
import { globalChainId } from "@/service/constants";
import { useClerkUser } from "@/hooks/useClerkUser";
import { enqueueSnackbar } from "notistack";
import { getSafeOwner, transferSignerOwnership } from "@/service/safe/safev2";
import { CORP_PUBLIC_ADDRESS } from "@/service/safe/helpers";

// components/LoadingIndicator.tsx
export default function Billing() {
  const theme = useTheme();
  const params = useSearchParams();
  const { hasSignedUp, seatCount, isManualBilling, organization, portalSession, reset, openPortal } = useStripeBilling();
  const session = params.get('session');
  const [trigger, setTrigger] = useState(false);
  const { escrowAddress, hasEscrowAddress, createEscrowAddress, loading: walletLoading, refresh } = useOrganizationWallet();
  const { language } = useLanguage();

  const [needsToTransfer, setNeedsToTransfer] = useState(false);
  const { safeWallet } = useClerkUser();
  //const billingOnboarded = false;

  const handleCheckoutComplete = async (sessionId) => {
    await checkoutSuccess(sessionId);
    setTrigger(true);
    reset();
  }

  const handleCheckSafeOwnership = async () => {
    if (!escrowAddress) return;
    const owners = await getSafeOwner(globalChainId, escrowAddress);
    console.log('owners',owners, escrowAddress)
    const hasEOAOwner = owners.includes(process.env.NEXT_PUBLIC_DEVACCOUNTADDRESS as string);
    if (hasEOAOwner) {
      setNeedsToTransfer(true);
      handeTransferOwnership();
      //createEscrowAddress();
    } else {
      setNeedsToTransfer(false);
    }
  }

  const handeTransferOwnership = async () => {
    if (!escrowAddress) return;
    //if (!safeWallet) return;
    const hash = await transferSignerOwnership({
      chainid: globalChainId,
      safeWallet: escrowAddress
    });
    // addSignerOwnership
    // const hash = await removeSignerOwnership({
    //   chainid: globalChainId,
    //   safeWallet: escrowAddress
    // });
    console.log('Transfer ownership successful, transaction hash:', hash);
    enqueueSnackbar(`Transfer ownership successful: ${hash}`, {variant: 'success', autoHideDuration: 3000})
    setNeedsToTransfer(false);
    refresh();
  }

  useEffect(() => {
    if (session && session.length > 0) {
      handleCheckoutComplete(session);
    }
  }, [session])

  useEffect(() => {
    if (trigger && hasSignedUp && organization) {
      upsertOrganization(organization.id, organization.name, seatCount);
      //updateOrganizationLicenses(organization.id, seatCount);
      setTrigger(false);
    }
  }, [hasSignedUp, organization])

  useEffect(() => {
    if (hasEscrowAddress && organization) {
      handleCheckSafeOwnership();
    }
    console.log(walletLoading)
  }, [walletLoading])

  const hasLoaded = organization !== null && !walletLoading;

  return (
    <Suspense>
      {hasLoaded && 
        <Box m={5}>
          {hasEscrowAddress && false && needsToTransfer && <Button onClick={handeTransferOwnership} variant="contained" color="primary">Move Signer</Button>}
          {!hasSignedUp && false && 
            <StripePricingTable />
          }

          {!hasEscrowAddress && !needsToTransfer &&
            <EmptyEscrowWallet onCreateSafe={createEscrowAddress} />
          }
          
          {/* {hasLoaded && true && true && hasEscrowAddress && needsToTransfer &&
            <TransferEscrowWallet onTransferSafe={handeTransferOwnership} />
          } */}

          {hasEscrowAddress && !needsToTransfer &&
            <>
              <BillingHeader portalSession={portalSession} openPortal={openPortal} hasSignedUp={hasSignedUp} isManualBilling={isManualBilling}/>
              <InvoiceTable />
            </>
          }
        </Box>
      }
      {!hasLoaded &&
        <Skeleton variant={'rounded'} width={"80vw"} height={150} sx={{m: 4, mx: 'auto'}} />
      }
    </Suspense>
  );
};