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
import { generateToken } from "@/service/billing/stripe";
import { CryptoElements, OnrampElement } from "./StripeCryptoElements";
import { loadStripeOnramp } from "@stripe/crypto";
import { setStripePaymentId } from "@/service/db";
import { useClerkOrganization } from "@/hooks/useClerkOrganization";

const stripeOnrampPromise = loadStripeOnramp(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

//import { usePaidPlanCheck } from "@/hooks/usePaidPlanCheck";

export default function Stripe({ invoiceId, destination, amount }: { invoiceId: string, destination: string, amount: number }) {
    const mixpanel = useMixpanel();
    const theme = useTheme();
    const textColor = getTextColor(theme);
    const {organization} = useClerkOrganization();
    const router = useRouter();
    const { language } = useLanguage();
    const [isLocked, setIsLocked] = useState(true);
    const [token, setToken] = useState('');
    const [redirectUrl, setRedirectUrl] = useState('');
    const { isConnected, address, chainId } = useAccount();
    
    const handlePaymentLoad = async () => {
        if (!organization) return;
        const session = await generateToken(invoiceId, organization.id, destination, amount);
        //await setStripePaymentId(organization.id, invoiceId, session.id);

        const _token = session.client_secret;
        //setToken(_token);
        const _redirectUrl = session.redirect_url;
        setRedirectUrl(_redirectUrl);
        window.open(_redirectUrl, "_blank")
    }   

    const onChange = useCallback(({ session }) => {
        //setMessage(`OnrampSession is now in ${session.status} state.`);
      }, []);

    const onReady = useCallback(({ session }) => {
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