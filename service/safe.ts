'use server';
import { SafeAccountConfig } from '@safe-global/protocol-kit';
import {
  Safe4337InitOptions,
  Safe4337Pack
} from '@safe-global/relay-kit'

const CORP_PUBLIC_ADDRESS = process.env.NEXT_PUBLIC_DEVACCOUNTADDRESS;
//const corpAccount = parseAccount(CORP_PUBLIC_ADDRESS) as LocalAccount;

export interface CreateAccountOptions {
  //ownerPrivateKey: string;
  rpcUrl: string;
  owner: string;
  threshold: number;
  //signer: SafeSigner;
}

export async function createAccount(options: CreateAccountOptions): Promise<string> {
  const { owner, threshold, rpcUrl } = options;
  console.log(owner, threshold, rpcUrl);
  const safeAccountConfig: SafeAccountConfig = {
    owners: [owner, CORP_PUBLIC_ADDRESS],
    threshold: 1,
  };

  const paymasterUrl = `https://api.pimlico.io/v2/11155111/rpc?apikey=${process.env.PIMELCO_API_KEY}`;
  const bundlerUrl = `https://api.pimlico.io/v2/11155111/rpc?apikey=${process.env.PIMELCO_API_KEY}`;
  //console.log(paymasterUrl, safeAccountConfig);
  const packData = {
      provider: rpcUrl,
      signer : process.env.DEVACCOUNTKEY,
      bundlerUrl: bundlerUrl,
      options: safeAccountConfig,
      paymasterOptions: {
          isSponsored: true,
          paymasterUrl: paymasterUrl,
      }
  } as Safe4337InitOptions;
  const safe4337Pack = await Safe4337Pack.init(packData);
  const safeAddress = await safe4337Pack.protocolKit.getAddress();
  const noOpTransaction = {
      to: safeAddress,
      value: '0',
      data: '0x', 
  };
  
  const safeOperation = await safe4337Pack.createTransaction({ transactions: [noOpTransaction] })
  
  const signedSafeOperation = await safe4337Pack.signSafeOperation(safeOperation)
  
  const userOperationHash = await safe4337Pack.executeTransaction({
      executable: signedSafeOperation
  })

  return safeAddress;
}
