'use server'
import { kv } from '@vercel/kv'
import { TransactionDetails } from './eip155';
import { IndexFund, Invoice, OrganizationSettings, SFDCUserData, TokenDetails } from './types';
import { isDev } from './constants';
import dayjs from 'dayjs';
const tenant = isDev ? 'dev' : 'prod';

export const setSafeAddress = async (userId: string, walletAddress: string) => {
  // await kv.zadd(`user:wallet:${userId}`, {
  //   score: createdAt,
  //   member: `chat:${id}`,
  // });

  await kv.hmset(`${tenant}:user:wallet:${userId}`, {safeWalletAddress: walletAddress});
}

export const getSafeAddress = async (userId: string) => {
  return await kv.hget(`${tenant}:user:wallet:${userId}`, 'safeWalletAddress') as string | null;
}

export const getTransactionDetailsDb = async (kvKey: string) => {
  const details = await kv.hgetall(kvKey);
  if (details && details.transactionDetails && typeof details.transactionDetails !== 'object') {
    return JSON.parse(details.transactionDetails as string) as TransactionDetails;
  }
  if (details && details.transactionDetails) {
    return details.transactionDetails as TransactionDetails;
  }
}

export const setTransactionDetailsDb = async (kvKey: string, transactionDetails: TransactionDetails) => {
  return await kv.hmset(kvKey, {transactionDetails: JSON.stringify(transactionDetails)});
} 

export const setUserDetails = async (userId: string, userDetails: SFDCUserData) => {
  return await kv.hmset(`${tenant}:user:${userId}`, userDetails);
}

export const getUserDetails = async (userId: string) => {
  const data = await kv.hgetall(`${tenant}:user:${userId}`) as SFDCUserData | null;
  return data;
}

export const setOrganizationSafeAddress = async (organizationId: string, walletAddress: string, type: 'escrow'|'self') => {
  await kv.hmset(`${tenant}:organization:wallet:${type}:${organizationId}`, {safeWalletAddress: walletAddress});
}

export const getOrganizationSafeAddress = async (organizationId: string, type: 'escrow'|'self') => {
  return await kv.hget(`${tenant}:organization:wallet:${type}:${organizationId}`, 'safeWalletAddress') as string;
}

export const getAllOrganizationInvoices = async (organizationId: string) => {
  return await kv.smembers(`${tenant}:organization:invoices:${organizationId}`);
}

export const getInvoiceDetails = async (organizationId: string, invoiceId: string) => {
  return await kv.hgetall(`${tenant}:invoice:${organizationId}:${invoiceId}`);
}

export const setInvoiceDetails = async (organizationId: string, invoiceId: string, invoice: Invoice) => {
  await kv.sadd(`${tenant}:organization:invoices:${organizationId}`, invoiceId);
  return await kv.hmset(`${tenant}:invoice:${organizationId}:${invoiceId}`, invoice);
}

export const getStripePaymentId = async (organizationId: string, invoiceId: string) => {
  return await kv.hget(`${tenant}:invoice:payment:${organizationId}:${invoiceId}`, 'safeWalletAddress') as string;
}

export const setStripePaymentId = async (organizationId: string, invoiceId: string, paymentId: string) => {
  await kv.hmset(`${tenant}:invoice:payment:${organizationId}:${invoiceId}`, {invoiceId: paymentId});
}

export const getTokenMetadata = async (chainId: number, address: string) => {
  return await kv.hgetall(`${tenant}:token_metadata:${chainId}:${address}`);
}

export const setTokenMetadata = async (chainId: number, address: string, tokenData: TokenDetails) => {
  await kv.hmset(`${tenant}:token_metadata:${chainId}:${address}`, tokenData);
}

export const getAllFunds = async (chainId: number) => {
  return await kv.smembers(`${tenant}:funds:${chainId}`);
}

export const getFundDetails = async (chainId: number, fundId: string) => {
  return await kv.hgetall(`${tenant}:fund:${chainId}:${fundId}`) as IndexFund;
}

export const setFundDetails = async (chainId: number, fundId: string, fundDetails: IndexFund) => {
  await kv.sadd(`${tenant}:funds:${chainId}`, fundId);
  return await kv.hmset(`${tenant}:fund:${chainId}:${fundId}`, fundDetails);
}

export const delFundDetails = async (chainId: number, fundId: string) => {
  await kv.srem(`${tenant}:funds:${chainId}`, fundId);
  return await kv.del(`${tenant}:fund:${chainId}:${fundId}`);
}

export const createFailureLog = async (organizationId: string, invoiceId: string, memberId: string, error: string) => {
  await kv.sadd(`${tenant}:errors`, `${organizationId}:${invoiceId}:${memberId}`);
  return await kv.hmset(`${tenant}:errors:${organizationId}:${invoiceId}:${memberId}`, {
    error,
    createdAt: new Date().toISOString(),
    organizationId,
    invoiceId,
    memberId
  });
}

export const getAllFailureLogs = async () => {
  return await kv.smembers(`${tenant}:errors`);
}

export const getFailureLog = async (key: string) => {
  return await kv.hgetall(`${tenant}:errors:${key}`);
}

export const delFailureLog = async (key: string) => {
  await kv.srem(`${tenant}:errors`, key);
  return await kv.del(`${tenant}:errors:${key}`);
}

export const saveWithdrawalLog = async (userId: string, token: string, signedMessage: string) => {
  const today = dayjs().format();
  const key = `${tenant}:withdrawal:${userId}:${token}:${today}`;
  await kv.sadd(`${tenant}:withdrawal:${userId}`, key);
  return await kv.hmset(key, {
    userId,
    createdAt: today,
    message: signedMessage
  });
}

export const setOrganizationSettings = async (organizationId: string, settings: OrganizationSettings) => {
  return await kv.hmset(`${tenant}:organization:${organizationId}:settings`, settings);
}

export const getOrganizationSettings = async (organizationId: string) => {
  const data = await kv.hgetall(`${tenant}:organization:${organizationId}:settings`) as OrganizationSettings | null;
  return data;
} 