import { getTable, queryVector } from "@/service/rag";
import { createTool } from "@covalenthq/ai-agent-sdk";
import { tool } from "ai";
import { z } from "zod";

const execute = async (params) => {
    const { text } = params as { text: string;};
    const tbl = await getTable('appData');
    //const results = '{"test": "test"}';
    const results = await queryVector(tbl, text);
    if (!results || results.length === 0) {
      //throw new Error("No results found.");
      return JSON.stringify([]);
    }
    return JSON.stringify(results);
};

const schema = z.object({
    text: z.string().describe("Input text to search the vector database."),
});

export const vectorSearchTool = createTool({
  id: "vector-search-tool",
  description: "Tool to query the internal database for documents related to the Xucre platform.",
  schema: schema,
  execute: execute,
});

export const ai_vectorSearchTool = tool({
  description: 'Tool to query the internal database for documents related to the Xucre platform.',
  parameters: schema,
  execute: execute,
})