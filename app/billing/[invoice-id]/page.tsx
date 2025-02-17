'use client'
import BillingHeader from "@/components/billing/BillingHeader";
import InvoiceDetailTable from "@/components/billing/InvoiceDetailTable";
import StripePricingTable from "@/components/billing/StripePricingTable";
import { updateOrganizationLicenses } from "@/service/clerk";
import { getInvoiceDetails, getOrganizationSafeAddress, setInvoiceDetails } from "@/service/db";
import { upsertOrganization } from "@/service/sfdc";
import { Invoice, InvoiceMember, InvoiceStatuses } from "@/service/types";
import { Box, Stack, useTheme } from "@mui/material"
import dayjs from "dayjs";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { uid } from 'uid-promise'
import InvoiceDetail from "@/components/billing/InvoiceDetail";
import { useEscrowBalance } from "@/hooks/useEscrowBalance";
import { useLanguage } from "@/hooks/useLanguage";
import languageData, { Language } from '@/metadata/translations';
import { useStripeBilling } from "@/hooks/useStripeBilling";
import { useClerkOrganization } from "@/hooks/useClerkOrganization";

// components/LoadingIndicator.tsx
export default function InvoicePage() {
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();
  const { language } = useLanguage();
  const { organization } = useClerkOrganization();
  const invoiceId = params['invoice-id'] as string;
  const [invoiceDetails, setInvoiceDetailsState] = useState(null as Invoice | null);
  const [escrowWallet, setEscrowWallet] = useState('');
  const [trigger, setTrigger] = useState(false);
  const {balance: usdcBalance, refresh} = useEscrowBalance(organization ? organization.id : '');
  const { subscription } = useStripeBilling();
  //const billingOnboarded = false;

  const saveMembers = async (members: InvoiceMember[]) => {
    if (!invoiceDetails || !organization) return;
    const total = members.reduce((acc, member) => acc + Number(member.salaryContribution) + Number(member.organizationContribution), 0);
    const _invoice = {
      ...invoiceDetails,
      members,
      status: invoiceDetails.status === InvoiceStatuses.Draft ? InvoiceStatuses.New : invoiceDetails.status,
      updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      totalDue: total,
    };
    await setInvoiceDetails(organization.id, _invoice.id, _invoice);
    fetchInvoiceDetails();
  }

  const fetchInvoiceDetails = async () => {
    if (!organization) return;
    try {
      const details = (await getInvoiceDetails(organization.id, invoiceId)) as Invoice;
      if (!details) {
        createInvoice();
      } else {
        setInvoiceDetailsState(details);
      }
    } catch (err) { 
      createInvoice();
    }
    
  }

  const createInvoice = async () => {
    if (!organization) return;
    const escrowWallet = await getOrganizationSafeAddress(organization.id, 'escrow');
    const newInvoice: Invoice = {
      id: invoiceId,
      organizationId: organization.id,
      escrowWallet: escrowWallet,
      status: InvoiceStatuses.Draft,
      paymentTransction: '',
      totalPaid: 0,
      totalDue: 0,
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      updatedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      dueDate: dayjs().format('YYYY-MM-DD'),
      members: [],
    };
    await setInvoiceDetails(organization.id, newInvoice.id, newInvoice);
    setInvoiceDetailsState(newInvoice);
  }

  useEffect(() => {
    if (invoiceId !== 'new' && organization) {
      fetchInvoiceDetails();
    } else {
      //createInvoice();
    }
  }, [invoiceId, organization])

  const showButtons = (invoiceDetails && (invoiceDetails.status === InvoiceStatuses.Draft || invoiceDetails.status === InvoiceStatuses.New)) as boolean;

  return (
    <Suspense>
      {invoiceDetails && 
        <Stack direction={'column'} spacing={2} mx={2}>
          <InvoiceDetail invoice={invoiceDetails} usdcBalance={usdcBalance} reload={fetchInvoiceDetails}/>
          <InvoiceDetailTable
            saveMembers={saveMembers}
            showButtons={showButtons}
            existingMembers={
              invoiceDetails && invoiceDetails.members.length > 0
                ? invoiceDetails.members
                : undefined
            }
          />
        </Stack>
      }
      
    </Suspense>
  );
};