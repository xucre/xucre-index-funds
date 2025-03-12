'use client'
import FundHeader from "@/components/fund/FundSelector";
import IndexSelector from "@/components/indexes/IndexSelector";
import { getAllFunds, getFundDetails } from "@/service/db";
import { IndexFund } from "@/service/types";
import { Box, Stack, useMediaQuery, useTheme } from "@mui/material"
import { Suspense, useEffect, useState } from "react";
import { globalChainId, isDev } from "@/service/constants";
//import '@covalenthq/goldrush-kit/styles.css'

// components/LoadingIndicator.tsx
export default function IndexLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const [allPublicFunds, setAllPublicFunds] = useState<IndexFund[]>([]);
  
  useEffect(() => {
    retrieveFunds();
  }, []);

  const retrieveFunds = async () => {
    const funds = await getAllFunds(globalChainId);
    const fundDetailList = await Promise.all( funds.map(async (fund) => {
        return await getFundDetails(isDev ? 1155111: globalChainId, fund);
    }));
    const _funds = fundDetailList.reduce((acc, fund) => {
      if (fund.public === true) return [...acc, fund];
      return acc;
    }, [] as IndexFund[]);
    setAllPublicFunds(_funds);
  }

  return (
    <Suspense>
      <Box px={5}>
         <Box mt={{ xs: 0 }} mx={2}>
            <IndexSelector fundList={allPublicFunds}/>
          </Box>
          {children}   
      </Box>
    </Suspense>
  );
};

export const dynamic = "force-dynamic"