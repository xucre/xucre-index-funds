import { createPublicClient, http, parseTransaction, parseEventLogs, erc20Abi } from 'viem';
import { polygon } from 'viem/chains';
import { kv } from '@vercel/kv';
import { getTransactionDetailsDb, setTransactionDetailsDb } from './db';
export type Transfer = { from: string, to: string, value: string };
export interface TransactionDetails {
  transactionHash: string;
  //logs: any[];
  erc20Transfers: Transfer[];
  contractCreated: boolean;
}

export type erc20Transfer = { from: string, to: string, value: string };

export async function retrieveTransactionDetails(address: string, txHash: string): Promise<TransactionDetails> {
  try {
    const kvKey = `${address}:${txHash}`;

    // Check if transaction details are already stored in Vercel KV
    const cachedTransaction = await getTransactionDetailsDb(kvKey);
    if (cachedTransaction) {
      return cachedTransaction; // Return cached transaction details if they exist
    }

    // Initialize a public client for the Polygon network (can be adjusted for other networks)
    const client = createPublicClient({
      chain: polygon,
      transport: http(),
    });

    // Retrieve the transaction receipt using the transaction hash
    const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` });
    if (!receipt) {
      throw new Error('Transaction receipt not found'); // Throw an error if the transaction receipt is not found
    }

    // Initialize an empty array to store ERC20 token transfers and a flag for contract creation
    const erc20Transfers = [];
    let contractCreated = false;

    // Parse the logs from the transaction receipt to extract ERC20 transfer events
    const logs = parseEventLogs({
      abi: erc20Abi, // Use the ERC20 ABI to parse the logs
      logs: receipt.logs,
    });

    // Iterate through the parsed logs to identify ERC20 transfer events
    for (const log of logs) {
      const transferEventSignature = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

      // If the log matches the ERC20 transfer event signature
      if (log.topics && log.topics[0] === transferEventSignature) {
        // Different ERC20 implementations may use different argument names (e.g., 'owner' vs 'from')
        if ('owner' in log.args) {
          const from = log.args.owner;
          const to = log.args.spender;
          const value = BigInt(log.data).toString(); // Convert the value from hexadecimal to a string
          erc20Transfers.push({ from, to, value }); // Add the transfer details to the array
        } else {
          const from = log.args.from;
          const to = log.args.to;
          const value = BigInt(log.data).toString(); // Convert the value from hexadecimal to a string
          erc20Transfers.push({ from, to, value }); // Add the transfer details to the array
        }
      }
    }

    // Check if a contract was created as part of the transaction
    if (receipt.contractAddress) {
      contractCreated = true; // Set the flag to true if a contract was created
    }

    // Construct the transaction details object
    const transactionDetails: TransactionDetails = {
      transactionHash: txHash,
      //logs: receipt.logs,
      erc20Transfers,
      contractCreated,
    };
    console.log(transactionDetails);
    // Save the transaction details to Vercel KV for future retrieval
    await setTransactionDetailsDb(kvKey, transactionDetails);

    return transactionDetails; // Return the transaction details
  } catch (error) {
    throw new Error(`Failed to retrieve transaction: ${error.message}`); // Throw an error if something goes wrong
  }
}