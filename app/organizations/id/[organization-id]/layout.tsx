'use client'
import { useParams, useRouter } from "next/navigation";
import { getTextColor } from "@/service/theme";
import { Button, IconButton, Modal, Tab, Tabs, Typography, useTheme } from "@mui/material";
import { Box, Stack } from "@mui/material"
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Campfire from "@/components/campfire";
import WalletNotConnected from "@/components/walletNotConnected";
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLanguage } from "@/hooks/useLanguage";
import { useMixpanel } from "@/hooks/useMixpanel";
import { chainValidation } from "@/service/helpers";
import OpaqueCard from "@/components/ui/OpaqueCard";
import { getOrganization, getOrganizationMembers, updateOrganizationMetadata } from "@/service/clerk";
import { OrganizationUserData, SFDCUserData } from "@/service/types";
import UserDetails from "@/components/admin/UserDetails";
import EditOrganization from "@/components/admin/EditOrganization";
import { Organization } from "@clerk/backend";
import { getUserDetails } from "@/service/db";
import BulkAddUsers from "@/components/admin/BulkAddUsers";
import AddUser from "@/components/admin/AddUser";
import OrganizationInvoiceTable from "@/components/admin/OrganizationInvoiceTable";
//import { usePaidPlanCheck } from "@/hooks/usePaidPlanCheck";

const OrganizationDetails: React.FC = ({
    children,
  }: {
    children: React.ReactNode;
  }) => {
  const router = useRouter();
  const params = useParams();
  const organizationId = params['organization-id'] as string;
  const [organization, setOrganization] = useState(null as Organization | null);

  const fetchData = async () => {
    try {
      const org = await getOrganization(organizationId);
      setOrganization(org);
    } catch (error) {
      console.error('Error fetching data:', error);
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
              <Typography variant="body1">
                Max Members: {organization.maxAllowedMemberships}
              </Typography>
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