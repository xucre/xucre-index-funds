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
  wallets : SFDCWallet[]
}

export type SFDCWallet = {
  walletAddress: string,
  primary: boolean,
  chainId: string,
  signedMessage: string
}
