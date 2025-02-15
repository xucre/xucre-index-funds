import { getAddress, isAddress, createPublicClient, http, Address } from "viem";
import { createTool } from "@covalenthq/ai-agent-sdk";
import { z } from "zod";

export const formatFinalOutputTool = createTool({
  id: "format-output",
  description: "This tool is used to format the final output of the analysts/chain-of-thought into a specified json format.",
  schema: z.object({
      walletAddress: z.string().describe("The wallet address the analysis was done on."),
      tolerance: z.enum(['low', 'medium', 'high']).describe("The tolerance level of the user from the analysis of the output."),
      tokens: z.array(z.object({
        address: z.string().describe("The address of the token."),
        risk: z.enum(['low', 'medium', 'high']).describe("The risk level of the token."),
        category: z.enum(['stablecoin', 'utility', 'defi', 'nft', 'gaming', 'metaverse', 'oracle', 'dex', 'lending', 'other']).describe("The category of the token."),
      })).describe("The list of tokens that match the user's risk tolerance."),
  }),
  execute: async (params) => {
    return JSON.stringify(params);
  },
});