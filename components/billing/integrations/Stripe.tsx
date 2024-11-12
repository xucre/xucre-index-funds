'use client'
import { useRouter } from "next/navigation";
import { getTextColor } from "@/service/theme";
import { useTheme } from "@mui/material";
import { Box, Stack } from "@mui/material"
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Campfire from "@/components/campfire";
import WalletNotConnected from "@/components/walletNotConnected";
import { useLanguage } from "@/hooks/useLanguage";
import { useMixpanel } from "@/hooks/useMixpanel";
import { useOrganization } from "@clerk/nextjs";
import { generateToken } from "@/service/billing/stripe";
import { CryptoElements, OnrampElement } from "./StripeCryptoElements";
import { loadStripeOnramp } from "@stripe/crypto";

const stripeOnrampPromise = loadStripeOnramp(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

//import { usePaidPlanCheck } from "@/hooks/usePaidPlanCheck";

export default function Stripe({ invoiceId, destination, amount }: { invoiceId: string, destination: string, amount: number }) {
    const mixpanel = useMixpanel();
    const theme = useTheme();
    const textColor = getTextColor(theme);
    const {organization} = useOrganization();
    const router = useRouter();
    const { language } = useLanguage();
    const [isLocked, setIsLocked] = useState(true);
    const [token, setToken] = useState('');
    const { isConnected, address, chainId } = useAccount();
    
    const handlePaymentLoad = async () => {
        const _token = await generateToken(invoiceId, organization.id, destination, amount);
        setToken(_token);
    }   

    const onChange = useCallback(({ session }) => {
        console.log(session);
        //setMessage(`OnrampSession is now in ${session.status} state.`);
      }, []);

    const onReady = useCallback(({ session }) => {
        console.log(session);
        //setMessage(`OnrampSession is now in ${session.status} state.`);
    }, []);

    useEffect(() => {
        handlePaymentLoad();
    }, []);

    return (
        <Box pb={4}>
        <Stack justifyContent={'center'} alignItems={'center'}>
            {/*<Typography variant={'h6'} color={textColor}>{languageData[language].ui.index_fund_title}</Typography>*/}

            <CryptoElements stripeOnramp={stripeOnrampPromise}>
                {token && (
                    <OnrampElement
                        id="onramp-element"
                        clientSecret={token}
                        appearance={{ theme: theme.palette.mode }}
                        onChange={onChange}
                        onReady={onReady}
                    />
                )}
            </CryptoElements>
        </Stack>

        </Box>
    );
};