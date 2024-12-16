import { transferSignerOwnership } from "@/service/safe";
import { getOrganizationMembers, getAllOrganizations } from "@/service/clerk";
import { getSafeAddress, getOrganizationSafeAddress, setInvoiceDetails } from "@/service/db";
import { Invoice, InvoiceStatuses } from "@/service/types";
import { uid } from "uid-promise";
import dayjs from "dayjs";

const main = async () => {
  //const ownershipresult = await transferSignerOwnership({});
const organizations = await getAllOrganizations();

for (const organization of organizations) {
  const escrowWallet = await getOrganizationSafeAddress(organization.id, "escrow");
  if (!escrowWallet) continue;
  const newInvoice: Invoice = {
    id: await uid(16),
    organizationId: organization.id,
    escrowWallet,
    status: InvoiceStatuses.Draft,
    paymentTransction: "",
    totalPaid: 0,
    totalDue: 0,
    createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    updatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    dueDate: dayjs().format("YYYY-MM-DD"),
    members: [],
  };

  await setInvoiceDetails(organization.id, newInvoice.id, newInvoice);
  console.log(`Created invoice ${newInvoice.id} for organization ${organization.id}`);
}
};

main();


// Execute - node scripts/createMonthlyInvoices.ts --env-file .env.local

