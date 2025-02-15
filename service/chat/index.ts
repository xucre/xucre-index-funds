
import { ChatCompletionMessageParam } from 'openai/resources';
import {tokenResearcherConfig, historySummarizerConfig, markdownFormatterConfig} from './agents';
import { Agent } from '@covalenthq/ai-agent-sdk';
import { z } from "zod";
import "dotenv/config";

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

// export const tokenResearcherAgent = tokenResearcher;
// export const historySummarizerAgent = historySummarizer;