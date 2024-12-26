import { Language } from "@/metadata/translations";
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
  street: string,
  street2: string,
  city: string,
  province: string,
  postalCode: string,
  country: string,
  placeId: string,
  idCardNumber: string,
  idExpirationDate: string,
  idIssueDate: string,
  frontImage: string,
  backImage: string,
  riskDisclosureSigned?: boolean,
  riskDisclosureSignedDate?: string,
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

export type PortfolioItem = {
  name: string;
  chainId: number;
  address: string;
  weight: number;
  description: {
    [key in Language]: string;
  };
  logo: string;
  active: boolean;
  poolFee: number;
  decimals: number;
  chain_logo: string;
  chartColor: string;
  links: string[];
  sourceFees: {
    [key: string]: number;
  };
}

export enum ToleranceLevels {
  Aggressive = 'Aggressive',
  Moderate = 'Moderate',
  Conservative = 'Conservative',
}

export type IndexFund = {
  id?: string;
  toleranceLevels?: ToleranceLevels[];
  name: {
    [key in Language]: string;
  };
  cardSubtitle: {
    [key in Language]: string;
  };
  description: {
    [key in Language]: string;
  };
  image: string;
  imageSmall: string;
  color: string;
  chainId: number;
  custom: boolean | undefined;
  sourceToken: PortfolioItem | undefined;
  portfolio: PortfolioItem[]
};

export interface PoolData {
  id: string;
  sourceToken: Token;
  targetToken: Token;
  feeTier: number;
  liquidity: string;
}

export interface Token {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  logo?: string;
}

export type TokenListResponse = {
  tokens: Token[];
}