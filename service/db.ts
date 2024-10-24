'use server'
import { kv } from '@vercel/kv'
import { TransactionDetails } from './eip155';


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