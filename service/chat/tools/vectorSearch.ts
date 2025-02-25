import { getTable, queryVector } from "@/service/rag";
import { createTool } from "@covalenthq/ai-agent-sdk";
import { z } from "zod";

export const vectorSearchTool = createTool({
  id: "vector-search-tool",
  description: "Tool to query the vector database with input text.",
  schema: z.object({
    text: z.string().describe("Input text to search the vector database."),
  }),
  execute: async (params) => {
    const { text } = params as { text: string;};
    const tbl = await getTable('appData');
    //const results = '{"test": "test"}';
    const results = await queryVector(tbl, text);
    if (!results || results.length === 0) {
      throw new Error("No results found.");
    }
    return JSON.stringify(results);
  },
});
