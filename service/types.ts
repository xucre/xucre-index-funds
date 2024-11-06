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
  idExpirationDate: number,
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