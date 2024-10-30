'use client'
import { useOrganization, useUser } from "@clerk/nextjs";
import { Box } from "@mui/material";
import React, { useEffect } from "react";
const StripePricingTable = () => {
  const { organization } = useOrganization();
  const { user } = useUser();

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
    <Box py={10} mx={4} px={2} borderRadius={25} bgcolor={'white'}>
      {organization && user &&
        ele
      }
    </Box>
  )
};
export default StripePricingTable;