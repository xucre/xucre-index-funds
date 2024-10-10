/*import { PublicKey } from "@solana/web3.js";
import { NamespaceMetadata, ChainMetadata, ChainsMap } from "../../context/types";

export function getPublicKeysFromAccounts(accounts: string[]) {
  return (
    accounts
      // Filter out any non-solana accounts.
      .filter((account) => account.startsWith("solana:"))
      // Create a map of Solana address -> publicKey.
      .reduce((map: Record<string, PublicKey>, account) => {
        const address = account.split(":").pop();
        if (!address) {
          throw new Error(
            `Could not derive Solana address from CAIP account: ${account}`
          );
        }
        map[address] = new PublicKey(address);
        return map;
      }, {})
  );
}

export const SolanaChainData: ChainsMap = {
  "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp": {
    id: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
    name: "Solana Mainnet",
    rpc: [
      "https://api.mainnet-beta.solana.com",
      "https://solana-api.projectserum.com",
    ],
    slip44: 501,
    testnet: false,
  },
  EtWTRABZaYq6iMfeYKouRu166VU2xqa1: {
    id: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
    name: "Solana Devnet",
    rpc: ["https://api.devnet.solana.com"],
    slip44: 501,
    testnet: true,
  },
  "4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z": {
    id: "solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z",
    name: "Solana Testnet",
    rpc: ["https://api.testnet.solana.com"],
    slip44: 501,
    testnet: true,
  },
};

export const SolanaMetadata: NamespaceMetadata = {
  // Solana Mainnet
  "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp": {
    logo: "/solana_logo.png",
    rgb: "0, 0, 0",
  },
  // Solana Devnet
  EtWTRABZaYq6iMfeYKouRu166VU2xqa1: {
    logo: "/solana_logo.png",
    rgb: "0, 0, 0",
  },
  // Solana Testnet
  "4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z": {
    logo: "/solana_logo.png",
    rgb: "0, 0, 0",
  },
};


export function getChainMetadata(chainId: string): ChainMetadata {
  const reference = chainId.split(":")[1];
  const metadata = SolanaMetadata[reference];
  if (typeof metadata === "undefined") {
    throw new Error(`No chain metadata found for chainId: ${chainId}`);
  }
  return metadata;
}
*/