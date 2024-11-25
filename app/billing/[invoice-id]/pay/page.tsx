'use client'
import { useParams, useRouter } from "next/navigation";
import { getTextColor } from "@/service/theme";
import { Button, Typography, useTheme } from "@mui/material";
import { Box, Stack, Grid2 as Grid } from "@mui/material"
import { ReactElement, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Campfire from "@/components/campfire";
import WalletNotConnected from "@/components/walletNotConnected";
import { useMixpanel } from "@/hooks/useMixpanel";
import { chainValidation } from "@/service/helpers";
import { useOrganization } from "@clerk/nextjs";
import { getInvoiceDetails } from "@/service/db";
import { Invoice, InvoiceStatuses, PaymentOption } from "@/service/types";
import Unlimit from "@/components/billing/integrations/Unlimit";
import PaymentOptionCard from "@/components/billing/PaymentOptionCard";
import Stripe from "@/components/billing/integrations/Stripe";
import languageData, { Language } from '@/metadata/translations';
import { useLanguage } from "@/hooks/useLanguage";

export default function InvoicePaymentPage() {
  const mixpanel = useMixpanel();
  const theme = useTheme();
  const textColor = getTextColor(theme);
  const router = useRouter();
  const { language } = useLanguage();
  const [isLocked, setIsLocked] = useState(true);
  const { isConnected, address, chainId } = useAccount();
  const params = useParams();
  const { organization } = useOrganization();
  const [invoiceDetails, setInvoiceDetailsState] = useState({} as Invoice);
  const invoiceId = params['invoice-id'] as string;
  const [selectedProvider, setSelectedProvider] = useState({} as ReactElement);
  const openProvider = selectedProvider !== null;
  const paymentOptions = () => {
    return [
    {
      id: 'unlimit',
      image: '/unlimit.svg',//'https://xucre-public.s3.sa-east-1.amazonaws.com/unlimit.png',
      color: '#756AF3',
      component: <Unlimit invoiceId={invoiceDetails?.id} destination={invoiceDetails?.escrowWallet} amount={invoiceDetails?.totalDue} />,
      limit: 10000,
      countries: ['US', 'CA', 'MX', 'BR', 'EC', 'AR', 'PE', 'CO', 'CL', 'UY', 'PY', 'BO', 'VE', 'CR', 'PA'],
    },
    {
      id: 'stripe',
      image: '/stripe.png',//'https://xucre-public.s3.sa-east-1.amazonaws.com/unlimit.png',
      color: '#7069fe',
      component: <Stripe invoiceId={invoiceDetails?.id} destination={invoiceDetails?.escrowWallet} amount={invoiceDetails?.totalDue} />,
      limit: 10000,
      countries: ['US', 'CA', 'MX', 'BR', 'EC', 'AR', 'PE', 'CO', 'CL', 'UY', 'PY', 'BO', 'VE', 'CR', 'PA'],
    }
    ] as PaymentOption[];
  }

  const fetchInvoiceDetails = async () => {
    if (!organization) return;
    const details = (await getInvoiceDetails(organization.id, invoiceId)) as Invoice;
    setInvoiceDetailsState(details);
  }

  const handleOpenProvider = (providerId: string) => {
    const provider = paymentOptions().find(p => p.id === providerId);
    if (!provider) return;
    setSelectedProvider(provider.component);
  }

  const handleCloseProvider = () => {
    setSelectedProvider({} as ReactElement);
  }

  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceDetails();
    }
  }, [invoiceId])

  return (
    <Box p={4}>
      {invoiceDetails && invoiceDetails.status !== InvoiceStatuses.New && 
        <Stack justifyContent={'center'} alignItems={'center'}>
          <Typography variant={'h6'} color={textColor}>{languageData[language].Invoice.invoice_not_ready}</Typography>
        </Stack>
      }

      {invoiceDetails && invoiceDetails.status === InvoiceStatuses.New && !openProvider && 
        <Grid container spacing={2}>
          <Grid size={12}>
            <Typography variant={'h6'} color={textColor}>{languageData[language].Invoice.select_payment_option}</Typography>
          </Grid>
          {paymentOptions().map(option => {
            return (
              <Grid size={4} key={option.id}>
                <PaymentOptionCard option={option} openProvider={handleOpenProvider} /> 
              </Grid>
            )
          })}
          
        </Grid>
      }

      {openProvider && selectedProvider && 
        <Box>
          <Stack direction={'row'} justifyContent={'flex-start'}>
            <Button variant={'text'} color={theme.palette.mode === 'dark' ? 'primary' : 'secondary'} onClick={handleCloseProvider}>{languageData[language].Invoice.back_button}</Button>
          </Stack>
          {selectedProvider}
        </Box>      
      }

    </Box>
  );
};