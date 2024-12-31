
// Create a custom in-memory kv implementation
const kvStore: Record<string, any> = {};

const kv2 = {
  hmset: jest.fn(async (key: string, value: Record<string, any>) => {
    kvStore[key] = { ...(kvStore[key] || {}), ...value };
  }),
  hget: jest.fn(async (key: string, field: string) => {
    return kvStore[key]?.[field] || null;
  }),
  hgetall: jest.fn(async (key: string) => {
    return kvStore[key] || null;
  }),
  sadd: jest.fn(async (key: string, value: any) => {
    if (!kvStore[key]) {
      kvStore[key] = new Set();
    }
    kvStore[key].add(value);
  }),
  smembers: jest.fn(async (key: string) => {
    return Array.from(kvStore[key] || []);
  }),
  srem: jest.fn(async (key: string, value: any) => {
    kvStore[key]?.delete(value);
  }),
  del: jest.fn(async (key: string) => {
    delete kvStore[key];
  }),
};
//jest.mock("@vercel/kv");

jest.mock('@vercel/kv', () => {
  return {
    createClient: jest.fn(() => kv2),
    kv: kv2
  };
});
// jest.mock('@vercel/kv', () => ({
//   kv: kv2
// }))
import { kv } from "@vercel/kv";
import {
  setSafeAddress,
  getSafeAddress,
  setTransactionDetailsDb,
  getTransactionDetailsDb,
  setUserDetails,
  getUserDetails,
  setOrganizationSafeAddress,
  getOrganizationSafeAddress,
  getAllOrganizationInvoices,
  getInvoiceDetails,
  setInvoiceDetails,
  getStripePaymentId,
  setStripePaymentId,
  getTokenMetadata,
  setTokenMetadata,
  getAllFunds,
  getFundDetails,
  setFundDetails,
  delFundDetails,
  createFailureLog,
  getAllFailureLogs,
  getFailureLog,
  delFailureLog,
} from "../../service/db";

import { TransactionDetails } from "../../service/eip155";
import {
  IndexFund,
  Invoice,
  InvoiceStatuses,
  SFDCUserData,
  TokenDetails,
} from "../../service/types";
import { isDev } from "../../service/constants";


describe("db.ts", () => {
  const tenant = isDev ? "dev" : "prod";

  beforeEach(() => {
    //(kv as jest.Mock).mockImplementation(() => kv);
    // for (const key in kvStore) {
    //   delete kvStore[key];
    // }
  });

  describe("setSafeAddress and getSafeAddress", () => {
    it("should set and get safe address", async () => {
      const userId = "user123";
      const walletAddress = "0xabc";
      //(kv.hmset as jest.Mock).mockResolvedValue(null);
      await setSafeAddress(userId, walletAddress);
      expect(kv.hmset).toHaveBeenCalledWith(`${tenant}:user:wallet:${userId}`, {
        safeWalletAddress: walletAddress,
      });

      (kv.hget as jest.Mock).mockResolvedValue(walletAddress);
      const result = await getSafeAddress(userId);
      expect(kv.hget).toHaveBeenCalledWith(
        `${tenant}:user:wallet:${userId}`,
        "safeWalletAddress"
      );
      expect(result).toBe(walletAddress);
    });
  });

  describe("setTransactionDetailsDb and getTransactionDetailsDb", () => {
    it("should set and get transaction details", async () => {
      const kvKey = "transaction:key";
      const transactionDetails: TransactionDetails = {
        /* mock data */
        transactionHash: "0x123",
        erc20Transfers: [],
        contractCreated: true,
      };

      await setTransactionDetailsDb(kvKey, transactionDetails);
      expect(kv.hmset).toHaveBeenCalledWith(kvKey, {
        transactionDetails: JSON.stringify(transactionDetails),
      });

      (kv.hgetall as jest.Mock).mockResolvedValue({
        transactionDetails: JSON.stringify(transactionDetails),
      });
      const result = await getTransactionDetailsDb(kvKey);
      expect(kv.hgetall).toHaveBeenCalledWith(kvKey);
      expect(result).toEqual(transactionDetails);
    });
  });

  describe("setUserDetails and getUserDetails", () => {
    it("should set and get user details", async () => {
      const userId = "user123";
      const userDetails: SFDCUserData = {
        userEmail: "",
        userId: "",
        role: "",
        riskTolerance: "",
        status: "",
        organizationId: "",
        salaryContribution: 0,
        firstName: "",
        middleName: "",
        lastName: "",
        address: "",
        street: "",
        street2: "",
        city: "",
        province: "",
        postalCode: "",
        country: "",
        placeId: "",
        idCardNumber: "",
        idExpirationDate: "",
        idIssueDate: "",
        frontImage: "",
        backImage: "",
        beneficiaries: [],
        wallets: [],
      };

      await setUserDetails(userId, userDetails);
      expect(kv.hmset).toHaveBeenCalledWith(
        `${tenant}:user:${userId}`,
        userDetails
      );

      (kv.hgetall as jest.Mock).mockResolvedValue(userDetails);
      const result = await getUserDetails(userId);
      expect(kv.hgetall).toHaveBeenCalledWith(`${tenant}:user:${userId}`);
      expect(result).toEqual(userDetails);
    });
  });

  describe("setOrganizationSafeAddress and getOrganizationSafeAddress", () => {
    it("should set and get organization safe address", async () => {
      const organizationId = "org123";
      const walletAddress = "0xdef";
      const type = "escrow" as "escrow" | "self";

      await setOrganizationSafeAddress(organizationId, walletAddress, type);
      expect(kv.hmset).toHaveBeenCalledWith(
        `${tenant}:organization:wallet:${type}:${organizationId}`,
        { safeWalletAddress: walletAddress }
      );

      (kv.hget as jest.Mock).mockResolvedValue(walletAddress);
      const result = await getOrganizationSafeAddress(organizationId, type);
      expect(kv.hget).toHaveBeenCalledWith(
        `${tenant}:organization:wallet:${type}:${organizationId}`,
        "safeWalletAddress"
      );
      expect(result).toBe(walletAddress);
    });
  });

  describe("getAllOrganizationInvoices", () => {
    it("should get all organization invoices", async () => {
      const organizationId = "org123";
      const invoices = ["invoice1", "invoice2"];

      (kv.smembers as jest.Mock).mockResolvedValue(invoices);
      const result = await getAllOrganizationInvoices(organizationId);
      expect(kv.smembers).toHaveBeenCalledWith(
        `${tenant}:organization:invoices:${organizationId}`
      );
      expect(result).toEqual(invoices);
    });
  });

  describe("setInvoiceDetails and getInvoiceDetails", () => {
    it("should set and get invoice details", async () => {
      const organizationId = "org123";
      const invoiceId = "inv123";
      const invoice: Invoice = {
        id: "",
        organizationId: "",
        escrowWallet: "",
        status: InvoiceStatuses.New,
        dueDate: "",
        paymentTransction: "",
        totalPaid: 0,
        totalDue: 0,
        members: [],
        createdAt: "",
        updatedAt: "",
      };

      await setInvoiceDetails(organizationId, invoiceId, invoice);
      expect(kv.sadd).toHaveBeenCalledWith(
        `${tenant}:organization:invoices:${organizationId}`,
        invoiceId
      );
      expect(kv.hmset).toHaveBeenCalledWith(
        `${tenant}:invoice:${organizationId}:${invoiceId}`,
        invoice
      );

      (kv.hgetall as jest.Mock).mockResolvedValue(invoice);
      const result = await getInvoiceDetails(organizationId, invoiceId);
      expect(kv.hgetall).toHaveBeenCalledWith(
        `${tenant}:invoice:${organizationId}:${invoiceId}`
      );
      expect(result).toEqual(invoice);
    });
  });

  describe("setStripePaymentId and getStripePaymentId", () => {
    it("should set and get stripe payment id", async () => {
      const organizationId = "org123";
      const invoiceId = "inv123";
      const paymentId = "pay123";

      await setStripePaymentId(organizationId, invoiceId, paymentId);
      expect(kv.hmset).toHaveBeenCalledWith(
        `${tenant}:invoice:payment:${organizationId}:${invoiceId}`,
        { invoiceId: paymentId }
      );

      (kv.hget as jest.Mock).mockResolvedValue(paymentId);
      const result = await getStripePaymentId(organizationId, invoiceId);
      expect(kv.hget).toHaveBeenCalledWith(
        `${tenant}:invoice:payment:${organizationId}:${invoiceId}`,
        "safeWalletAddress"
      );
      expect(result).toBe(paymentId);
    });
  });

  describe("setTokenMetadata and getTokenMetadata", () => {
    it("should set and get token metadata", async () => {
      const chainId = 1;
      const address = "0xghi";
      const tokenData: TokenDetails = {
        decimals: 0,
        logo: "",
        name: "",
        symbol: "",
        defaultLogo: false,
      };

      await setTokenMetadata(chainId, address, tokenData);
      expect(kv.hmset).toHaveBeenCalledWith(
        `${tenant}:token_metadata:${chainId}:${address}`,
        tokenData
      );

      (kv.hgetall as jest.Mock).mockResolvedValue(tokenData);
      const result = await getTokenMetadata(chainId, address);
      expect(kv.hgetall).toHaveBeenCalledWith(
        `${tenant}:token_metadata:${chainId}:${address}`
      );
      expect(result).toEqual(tokenData);
    });
  });

  describe("setFundDetails, getFundDetails, getAllFunds, and delFundDetails", () => {
    it("should manage fund details", async () => {
      const chainId = 1;
      const fundId = "fund123";
      const fundDetails: IndexFund = {
        name: {
          0: "",
          1: "",
          2: "",
        },
        cardSubtitle: {
          0: "",
          1: "",
          2: "",
        },
        description: {
          0: "",
          1: "",
          2: "",
        },
        image: "",
        imageSmall: "",
        color: "",
        chainId: 0,
        custom: undefined,
        sourceToken: undefined,
        portfolio: [],
      };

      await setFundDetails(chainId, fundId, fundDetails);
      expect(kv.sadd).toHaveBeenCalledWith(
        `${tenant}:funds:${chainId}`,
        fundId
      );
      expect(kv.hmset).toHaveBeenCalledWith(
        `${tenant}:fund:${chainId}:${fundId}`,
        fundDetails
      );

      (kv.hgetall as jest.Mock).mockResolvedValue(fundDetails);
      const fundResult = await getFundDetails(chainId, fundId);
      expect(kv.hgetall).toHaveBeenCalledWith(
        `${tenant}:fund:${chainId}:${fundId}`
      );
      expect(fundResult).toEqual(fundDetails);

      const funds = [fundId];
      (kv.smembers as jest.Mock).mockResolvedValue(funds);
      const allFundsResult = await getAllFunds(chainId);
      expect(kv.smembers).toHaveBeenCalledWith(`${tenant}:funds:${chainId}`);
      expect(allFundsResult).toEqual(funds);

      await delFundDetails(chainId, fundId);
      expect(kv.srem).toHaveBeenCalledWith(
        `${tenant}:funds:${chainId}`,
        fundId
      );
      expect(kv.del).toHaveBeenCalledWith(
        `${tenant}:fund:${chainId}:${fundId}`
      );
    });
  });

  describe("createFailureLog, getFailureLog, getAllFailureLogs, and delFailureLog", () => {
    it("should manage failure logs", async () => {
      const organizationId = "org123";
      const invoiceId = "inv123";
      const memberId = "member123";
      const error = "An error occurred";
      const key = `${organizationId}:${invoiceId}:${memberId}`;
      const errorData = {
        error,
        createdAt: new Date().toISOString(),
        organizationId,
        invoiceId,
        memberId,
      };

      await createFailureLog(organizationId, invoiceId, memberId, error);
      expect(kv.sadd).toHaveBeenCalledWith(`${tenant}:errors`, key);
      // expect(kv.hmset).toHaveBeenCalledWith(
      //   `${tenant}:errors:${key}`,
      //   errorData
      // );

      (kv.hgetall as jest.Mock).mockResolvedValue(errorData);
      const failureLog = await getFailureLog(key);
      expect(kv.hgetall).toHaveBeenCalledWith(`${tenant}:errors:${key}`);
      expect(failureLog).toEqual(errorData);

      const errors = [key];
      (kv.smembers as jest.Mock).mockResolvedValue(errors);
      const allErrors = await getAllFailureLogs();
      expect(kv.smembers).toHaveBeenCalledWith(`${tenant}:errors`);
      expect(allErrors).toEqual(errors);

      await delFailureLog(key);
      expect(kv.srem).toHaveBeenCalledWith(`${tenant}:errors`, key);
      expect(kv.del).toHaveBeenCalledWith(`${tenant}:errors:${key}`);
    });
  });
});
