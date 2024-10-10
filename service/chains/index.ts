import { JsonRpcRequest } from "@walletconnect/jsonrpc-utils";

import * as eip155 from "./eip155";
//import * as solana from "./solana";

import { ChainMetadata, ChainRequestRender } from "../../context/types";

export function getChainMetadata(chainId: string): ChainMetadata {
  const namespace = chainId.split(":")[0];
  switch (namespace) {
    case "eip155":
      return eip155.getChainMetadata(chainId);
    case "solana":
      //return solana.getChainMetadata(chainId);
      throw new Error(`No metadata handler for namespace ${namespace}`);
    default:
      throw new Error(`No metadata handler for namespace ${namespace}`);
  }
}

export function getChainRequestRender(
  request: JsonRpcRequest,
  chainId: string
): ChainRequestRender[] {
  const namespace = chainId.split(":")[0];
  switch (namespace) {
    case "eip155":
      return eip155.getChainRequestRender(request);
    default:
      throw new Error(`No render handler for namespace ${namespace}`);
  }
}
