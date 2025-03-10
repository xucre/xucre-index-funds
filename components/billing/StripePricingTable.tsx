'use client'
import { useClerkOrganization } from "@/hooks/useClerkOrganization";
import { useClerkUser } from "@/hooks/useClerkUser";
import { Box } from "@mui/material";
import React, { useEffect } from "react";
const StripePricingTable = () => {
  const { organization } = useClerkOrganization();
  const { user } = useClerkUser();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.stripe.com/v3/pricing-table.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);
  const ele = organization && user ? React.createElement("stripe-pricing-table", {
    "pricing-table-id": 'prctbl_1Q648YK2fAEU0BHq1KnembPh',
    "publishable-key": process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    "client-reference-id": organization.id,
    "customer-email": user.emailAddresses[0].emailAddress
  }) : <></>;

  return (
    <Box py={10} mx={4} px={2} borderRadius={25} bgcolor={'#1b6756'}>
      {organization && user &&
        ele
      }
    </Box>
  )
};
export default StripePricingTable;