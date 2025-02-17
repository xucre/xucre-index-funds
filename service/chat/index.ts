'use server';
import { ChatCompletionMessageParam } from 'openai/resources';
import {generalistAgentConfig,tokenResearcherConfig, historySummarizerConfig, markdownFormatterConfig} from './agents';
import { Agent } from '@covalenthq/ai-agent-sdk';
import { z } from "zod";
import "dotenv/config";
import { AgentConfig } from './types';

export const generateResponse = async (input: ChatCompletionMessageParam[], agent: 'tokenResearcher' | 'historySummarizer' | 'markdownFormatter' ) => {
    const client = agent === 'tokenResearcher' 
        ? new Agent(tokenResearcherConfig(process.env.OPEN_API_KEY as string)) 
        : agent === 'historySummarizer' 
            ? new Agent(historySummarizerConfig(process.env.OPEN_API_KEY as string)) 
            : new Agent(markdownFormatterConfig(process.env.OPEN_API_KEY as string));
    
    const response = await client.generate(input, { data : z.object({
        response: z.string().describe("The response from the agent"),
    })
    });
    
    if (response.type === 'data') {
        return response.value.response;
    } else {
        throw new Error('Unexpected response type');
    }
}

export const generateDatabaseResponse = async (input: ChatCompletionMessageParam[], agent: AgentConfig) => {
    const client = new Agent(generalistAgentConfig(process.env.OPEN_API_KEY as string, agent)) 
    
    const response = await client.generate(input, { data : z.object({
        response: z.string().describe("The response from the agent"),
    })});
    
    if (response.type === 'data') {
        return response.value.response;
    } else {
        throw new Error('Unexpected response type');
    }
}

// export const tokenResearcherAgent = tokenResearcher;
// export const historySummarizerAgent = historySummarizer;