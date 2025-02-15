// new file: WebSearchTool.ts
import { createTool, Tool } from "@covalenthq/ai-agent-sdk";
import { z } from "zod";

/**
 * Define the parameters expected by the web search tool.
 * - `query`: The search query string.
 * - `limit`: (Optional) The maximum number of related topics to return.
 */
export const WebSearchSchema = z.object({
  query: z.string().min(1, "Query must not be empty"),
  limit: z.number().min(1).max(50).optional(),
});

/**
 * WebSearchTool
 *
 * This tool performs a web search by querying the DuckDuckGo Instant Answer API.
 * It retrieves an abstract (if available) and a list of related topics for the given query.
 */
export class WebSearchTool_Direct extends Tool {
  constructor() {
    super(
      "web_search",
      "Perform a web search to retrieve public data about a specific subject using the DuckDuckGo API",
      WebSearchSchema,
      async (params) => await WebSearchTool_Direct.fetchData(params)
    );
  }

  /**
   * fetchData performs the web search and formats the results.
   *
   * @param params - An object conforming to the WebSearchSchema.
   * @returns A string summarizing the search results.
   */
  private static async fetchData(params: unknown): Promise<string> {
    const { query, limit } = params as { query: string; limit: number};
    const encodedQuery = encodeURIComponent(query);

    // Build the DuckDuckGo API URL.
    const url = `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_redirect=1&no_html=1`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data = await response.json();

      // Extract an abstract if available; fallback if empty.
      const abstractText = data.AbstractText || data.Abstract || "No abstract available.";

      // Process related topics (if any).
      let relatedTopics = Array.isArray(data.RelatedTopics) ? data.RelatedTopics : [];
      if (limit) {
        relatedTopics = relatedTopics.slice(0, limit);
      }

      // Return a formatted string summarizing the results.
      return `Search results for "${query}":\nAbstract: ${abstractText}\nRelated Topics: ${JSON.stringify(relatedTopics, null, 2)}`;
    } catch (error) {
      return `Error performing web search: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }
}


/**
 * WebSearchTool
 *
 * This tool performs a web search by querying the DuckDuckGo Instant Answer API.
 * It retrieves an abstract (if available) and a list of related topics for the given query.
 */
export const webSearchTool = createTool({
  id: "web_search",
  description:
    "Perform a web search to retrieve public data about a specific subject using the DuckDuckGo API",
  schema: WebSearchSchema,
  async execute(params) {
    const { query, limit } = params as { query: string; limit: number};
    const encodedQuery = encodeURIComponent(query);

    // Build the DuckDuckGo API URL.
    const url = `https://api.duckduckgo.com/?q=${encodedQuery}&format=json&no_redirect=1&no_html=1`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data = await response.json();

      // Extract an abstract if available; fallback if empty.
      const abstractText = data.AbstractText || data.Abstract || "No abstract available.";

      // Process related topics (if any).
      let relatedTopics = Array.isArray(data.RelatedTopics) ? data.RelatedTopics : [];
      if (limit) {
        relatedTopics = relatedTopics.slice(0, limit);
      }

      // Return a formatted string summarizing the results.
      return `Search results for "${query}":\nAbstract: ${abstractText}\nRelated Topics: ${JSON.stringify(relatedTopics, null, 2)}`;
    } catch (error) {
      return `Error performing web search: ${
        error instanceof Error ? error.message : "Unknown error"
      }`;
    }
  },
});