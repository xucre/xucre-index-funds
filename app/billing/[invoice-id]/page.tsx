'use client'
import BillingHeader from "@/components/billing/BillingHeader";
import InvoiceDetailTable from "@/components/billing/InvoiceDetailTable";
import StripePricingTable from "@/components/billing/StripePricingTable";
import { updateOrganizationLicenses } from "@/service/clerk";
import { getInvoiceDetails, getOrganizationSafeAddress, setInvoiceDetails } from "@/service/db";
import { upsertOrganization } from "@/service/sfdc";
import { Invoice, InvoiceStatuses } from "@/service/types";
import { useOrganization } from "@clerk/nextjs";
import { Box, Stack, useTheme } from "@mui/material"
import dayjs from "dayjs";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { uid } from 'uid-promise'
import InvoiceDetail from "@/components/billing/InvoiceDetail";
import { useEscrowBalance } from "@/hooks/useEscrowBalance";

// components/LoadingIndicator.tsx
export default function InvoicePage() {
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();
  const { organization } = useOrganization();
  const invoiceId = params['invoice-id'] as string;
  const [invoiceDetails, setInvoiceDetailsState] = useState(null as Invoice | null);
  const [escrowWallet, setEscrowWallet] = useState('');
  const [trigger, setTrigger] = useState(false);
  const {balance: usdcBalance, refresh} = useEscrowBalance(organization.id);
  //const billingOnboarded = false;

  const saveMembers = async (members) => {
    console.log('saveMembers');
    const total = members.reduce((acc, member) => acc + Number(member.salaryContribution), 0);
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
    const details = (await getInvoiceDetails(organization.id, invoiceId)) as Invoice;
    setInvoiceDetailsState(details);
  }

  const createInvoice = async () => {
    const escrowWallet = await getOrganizationSafeAddress(organization.id, 'escrow');
    const newInvoice: Invoice = {
      id: await uid(16),
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
    router.push(`/billing/${newInvoice.id}`);
  }

  useEffect(() => {
    if (invoiceId !== 'new') {
      fetchInvoiceDetails();
    } else {
      createInvoice();
    }
  }, [invoiceId])

  const showButtons = invoiceDetails && (invoiceDetails.status === InvoiceStatuses.Draft || invoiceDetails.status === InvoiceStatuses.New)

  return (
    <Suspense>
      {invoiceDetails && 
        <Stack direction={'column'} spacing={2} mx={2}>
          <InvoiceDetail invoice={invoiceDetails} usdcBalance={usdcBalance}/>
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