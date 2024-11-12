'use server'
import { kv } from '@vercel/kv'
import { TransactionDetails } from './eip155';
import { Invoice, SFDCUserData } from './types';


export const setSafeAddress = async (userId: string, walletAddress: string) => {
  // await kv.zadd(`user:wallet:${userId}`, {
  //   score: createdAt,
  //   member: `chat:${id}`,
  // });

  await kv.hmset(`user:wallet:${userId}`, {safeWalletAddress: walletAddress});
}

export const getSafeAddress = async (userId: string) => {
  return await kv.hget(`user:wallet:${userId}`, 'safeWalletAddress') as string;
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
  return await kv.hmset(`user:${userId}`, userDetails);
}

export const getUserDetails = async (userId: string) => {
  const data = await kv.hgetall(`user:${userId}`) as SFDCUserData;
  return data;
}

export const setOrganizationSafeAddress = async (organizationId: string, walletAddress: string, type: 'escrow'|'self') => {
  await kv.hmset(`organization:wallet:${type}:${organizationId}`, {safeWalletAddress: walletAddress});
}

export const getOrganizationSafeAddress = async (organizationId: string, type: 'escrow'|'self') => {
  return await kv.hget(`organization:wallet:${type}:${organizationId}`, 'safeWalletAddress') as string;
}

export const getAllOrganizationInvoices = async (organizationId: string) => {
  return await kv.smembers(`organization:invoices:${organizationId}`);
}

export const getInvoiceDetails = async (organizationId: string, invoiceId: string) => {
  return await kv.hgetall(`invoice:${organizationId}:${invoiceId}`);
}

export const setInvoiceDetails = async (organizationId: string, invoiceId: string, invoice: Invoice) => {
  await kv.sadd(`organization:invoices:${organizationId}`, invoiceId);
  return await kv.hmset(`invoice:${organizationId}:${invoiceId}`, invoice);
}