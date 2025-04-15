'use client'
import { useParams, useRouter } from "next/navigation";
import { IconButton, Typography } from "@mui/material";
import { Box, Stack } from "@mui/material"
import { useEffect, useState } from "react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OpaqueCard from "@/components/ui/OpaqueCard";
import { getOrganization, updateOrganizationMetadata } from "@/service/clerk";
import EditOrganization from "@/components/admin/EditOrganization";
import { Organization } from "@clerk/backend";
import { getOrganizationSafeAddress } from "@/service/db";
import { convertUsdcToUsdt } from "@/service/safe/safev2";
import { useSnackbar } from "notistack";
import { LoadingButton } from "@mui/lab";
//import { usePaidPlanCheck } from "@/hooks/usePaidPlanCheck";

const OrganizationDetails: React.FC = ({
    children,
  }: {
    children: React.ReactNode;
  }) => {
  const router = useRouter();
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();
  const organizationId = params['organization-id'] as string;
  const [organization, setOrganization] = useState(null as Organization | null);
  const [transferLoading, setTransferLoading] = useState(false);

  const fetchData = async () => {
    try {
      const org = await getOrganization(organizationId);
      setOrganization(org);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleUsdcConversion = async () => {
    try {
      setTransferLoading(true);
      // Convert USDC to USDT
      console.log('Converting USDC to USDT');
      const safeAddress = await getOrganizationSafeAddress(organizationId, 'escrow');
      const result = await convertUsdcToUsdt({safeAddress, rpcUrl: process.env.NEXT_PUBLIC_SAFE_RPC_URL as string, chainid: 137});
      //console.log('Conversion Result:', result);
      setTransferLoading(false);
      enqueueSnackbar('USDC converted to USDT', { variant: 'success' });
    } catch (error) {
      console.error('Error converting USDC to USDT:', error);
      setTransferLoading(false);
      enqueueSnackbar('Error converting USDC to USDT', { variant: 'error' });
    }
  };

  useEffect(() => {
    if (!organizationId) return;

    fetchData();
  }, [organizationId]);

  return (
    <Box maxWidth={'80vw'} m={4}>
      {organization && (
        <OpaqueCard>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent={'space-between'}>
            <IconButton onClick={() => router.back()} ><ArrowBackIcon /></IconButton>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent={'space-between'}>
              <Typography variant="h5">{organization.name}</Typography>
              <Typography variant="body1">ID: {organization.id}</Typography>
              <LoadingButton loading={transferLoading}  onClick={handleUsdcConversion}>Convert USDC to USDT</LoadingButton>
            </Stack>
            <EditOrganization
              publicMetadata={JSON.stringify(organization.publicMetadata)}
              save={async (updatedMetadata: string) => {
                await updateOrganizationMetadata(organizationId, updatedMetadata);
              }} />
          </Stack>
          {/* Additional organization details */}
        </OpaqueCard>
      )}

      {children}
    </Box>
  );
};

export default OrganizationDetails;