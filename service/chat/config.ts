
import { Agent, ModelConfig } from "@covalenthq/ai-agent-sdk";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { AgentConfig } from "./types";
import {generalistAgentConfig,tokenResearcherConfig, historySummarizerConfig, markdownFormatterConfig} from './agents/index';
import { vectorSearchTool } from "./tools/vectorSearch";

export const modelConfig: ModelConfig = {
  provider: "OPEN_AI",
  name: "gpt-4o-mini",
  apiKey: process.env.OPENAI_API_KEY,
}

const tools = {
  //tokensList: getTokenListTool,
  vectorSearch: vectorSearchTool
  //liquidityValidator: checkUniswapPoolTool
};

export const testResponse = async (input: ChatCompletionMessageParam[], config: AgentConfig) => {
  const _tools = config.toolList.reduce((acc, toolName) => {
        if (tools[toolName]) {
            acc[toolName] = tools[toolName];
        }
        return acc;
    }, {});
    console.log(config);
  //   const config2 = {
  //     name: config.name,
  //     model: {...modelConfig, temperature: 1, apiKey: process.env.OPEN_API_KEY as string},
  //     instructions: [
  //       ...config.instructions
  //     ],
  //     description: config.description,
  //     tools: _tools,
  //   };
  // const client2 = new Agent(config2);
  
  return JSON.stringify({});
}