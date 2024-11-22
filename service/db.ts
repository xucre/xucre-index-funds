'use server'
import { kv } from '@vercel/kv'
import { TransactionDetails } from './eip155';
import { Invoice, SFDCUserData, TokenDetails } from './types';
import { isDev } from './constants';
const tenant = isDev ? 'dev' : 'prod';

export const setSafeAddress = async (userId: string, walletAddress: string) => {
  // await kv.zadd(`user:wallet:${userId}`, {
  //   score: createdAt,
  //   member: `chat:${id}`,
  // });

  await kv.hmset(`${tenant}:user:wallet:${userId}`, {safeWalletAddress: walletAddress});
}

export const getSafeAddress = async (userId: string) => {
  return await kv.hget(`${tenant}:user:wallet:${userId}`, 'safeWalletAddress') as string;
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
  const data = await kv.hgetall(`${tenant}:user:${userId}`) as SFDCUserData;
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