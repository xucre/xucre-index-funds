import { webSearchTool } from "../tools/search";
import { modelConfig } from "../config";
import { AgentConfig } from "../types";
import { vectorSearchTool } from "../tools/vectorSearch";
import { BaseNode, Flow } from "@pocketflow/core";

const tools = {
  webSearch: webSearchTool,
  vectorSearch: vectorSearchTool
};

export const tokenResearcherConfig = (apiKey: string) => {
  return {
    name: "token-researcher",
    model: {...modelConfig, temperature: 1, apiKey},
    instructions: [
      "You have access to a variety of tools that can help you answer questions about Xucre Investments and crypto in general.",
      "You can use the webSearch tool to look up information on the internet.",
    ],
    description: "You are an agent that assists users in learning about cryptocurrencies.",
    tools: tools,
  };
}

export const historySummarizerConfig = (apiKey: string) => {
  return {
    name: "history-summarizer",
    model: {...modelConfig, temperature: 1, apiKey},
    instructions: [
      "Using the tokensList tool, build a list of tokens that match the user's risk tolerance, which should be in the initial input.",
      "Prune the list of tokens to provide a well-balanced mix of tokens. The list should have at least 10 tokens in it.",
    ],
    description: "You are an investment advisor that creates lists of tokens on the matic-mainnet chain that adheres to a specified investment philosophy and risk tolerance. Important: Always use the token addresses exactly as provided by the function call. Do not generate, modify, or add any token addresses that are not returned by the verified function output.",
    tools: tools,
  };
}

export const markdownFormatterConfig = (apiKey: string) => {
  return {
    name: "markdown-formatter",
    model: {...modelConfig, temperature: 1, apiKey},
    instructions: [
      "Format the text provided using markdown syntax to make it easier to read.",
    ],
    description: "You are an agent that assists users by summarizing the responses of other agents in a readable format.",
    tools: tools,
  };
}

export const generalistAgentConfig = (apiKey: string, config: AgentConfig) => {
    const _tools = config.toolList.reduce((acc, toolName) => {
        if (tools[toolName]) {
            acc[toolName] = tools[toolName];
        }
        return acc;
    }, {});
    return {
      name: config.name,
      model: {...modelConfig, temperature: config.temperature || 0.7, apiKey},
      instructions: [
        ...config.instructions
      ],
      description: config.description,
      tools: _tools,
    };
}