'use server'
import { kv } from '@vercel/kv'


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