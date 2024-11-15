import { OrganizationMembership } from "@clerk/backend";
import { ReactElement } from "react";

export type PriceItem = {
  date: string,
  price: number,
  prettyPrice: string,
};

export type PriceData = {
  items: PriceItem[],
  chainId: number,
  chainName: string,
  address: string,
  lastModified: number,
  logo: string,
  decimals: number,
  name: string,
  symbol: string,
  currency: string,
}

export type SFDCUserData = {
  userEmail: string,
  userId: string,
  role: string,
  riskTolerance: string,
  status: string,
  organizationId: string,
  salaryContribution: number,
  firstName: string,
  middleName: string,
  lastName: string,
  address: string,
  placeId: string,
  idCardNumber: string,
  idExpirationDate: string,
  frontImage: string,
  backImage: string,
  wallets : SFDCWallet[]
}

export type SFDCWallet = {
  walletAddress: string,
  primary: boolean,
  chainId: string,
  signedMessage: string
}

export type TokenDetails = {
  decimals: number,
  logo: string,
  name: string,
  symbol: string,
  defaultLogo: boolean
}

export type OrganizationUserData = {
  id: string,
  firstName: string,
  lastName: string,
  emailAddress: string
}

export enum Roles {
  Admin = 'org:admin',
  Member = 'org:member',
  SuperAdmin = 'org:superadmin',
}

export type InvoiceMember = OrganizationMembership & {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  active: boolean;
  salaryContribution: number;
  safeWalletAddress: string;
};

export enum InvoiceStatuses {
  New = 'New',
  Draft = 'Draft',
  Sent = 'Sent',
  Paid = 'Paid',
  Disbursed = 'Disbursed',
  Cancelled = 'Cancelled',
}


export type Invoice = {
  id: string;
  organizationId: string;
  escrowWallet: string;
  status: InvoiceStatuses;
  dueDate: string;
  paymentTransction: string;
  totalPaid: number;
  totalDue: number;
  members: InvoiceMember[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentOptionProps {
  option: PaymentOption;
  openProvider: (providerId: string) => void;
}

export type PaymentOption = {
  id: string;
  image: string;
  color: string;
  component: ReactElement; //React.FC<PaymentOptionProps>;
  countries: string[];
  limit: number;
};