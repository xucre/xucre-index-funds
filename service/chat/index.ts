'use server';
import { ChatCompletionMessageParam } from 'openai/resources';
import { handleCustomerQuery } from './workflows/aiSdkWorkflow';
import {generalistAgentConfig,tokenResearcherConfig, historySummarizerConfig, markdownFormatterConfig} from './agents';
import { Agent, ZeeWorkflow } from '@covalenthq/ai-agent-sdk';
import { z } from "zod";
import { AgentConfig } from './types';
import zeeworkflow from './workflows/zeeworkflow';
import { StateFn } from '@covalenthq/ai-agent-sdk/dist/core/state';
import { user } from '@covalenthq/ai-agent-sdk/dist/core/base';

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
    try {
        const client = new Agent(generalistAgentConfig(process.env.OPEN_API_KEY as string, agent)) 
    
        const response = await client.generate(input, { data : z.object({
            response: z.string().describe("The response from the agent"),
        })});
        
        if (response.type === 'data') {
            return response.value.response;
        } else {
            console.log(response);
            return 'Unexpected response type';
        }
    } catch (error) {
        console.log(error);
        return 'Error';
        
    }
}

export const generateWorkflowResponse = async (input: ChatCompletionMessageParam[], agent: AgentConfig) => {
    try {
        const client = new Agent(generalistAgentConfig(process.env.OPEN_API_KEY as string, agent)) 
        
        const state = await StateFn.root(client.description);
        input.forEach((message) => {
            state.messages.push(
                user(
                    message.content as string // assuming you want to use the first message's content as input text
                )
            );
        });
        const workflow = await zeeworkflow(client, 'You are a chat agent that provides guidance to users of the Xucre Investments application.', 'The goal of this workflow is to provide first line support to users of the Xucre Investments application.')
        return await ZeeWorkflow.run(workflow, state);
    } catch (error) {
        console.log(error);
        return 'Error';
        
    }
}

// export const tokenResearcherAgent = tokenResearcher;
// export const historySummarizerAgent = historySummarizer;

export const handleQuery = handleCustomerQuery;