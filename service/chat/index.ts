'use server';
import { ChatCompletionMessageParam } from 'openai/resources';
import { generalistAgentConfig, tokenResearcherConfig, historySummarizerConfig, markdownFormatterConfig } from './agents';
import { BaseNode, Flow, DEFAULT_ACTION } from '@pocketflow/core';
import { z } from "zod";
import { AgentConfig } from './types';
import zeeworkflow from './workflows';

export const generateResponse = async (input: ChatCompletionMessageParam[], agent: 'tokenResearcher' | 'historySummarizer' | 'markdownFormatter' ) => {
    const client = agent === 'tokenResearcher' 
        ? new Flow(tokenResearcherConfig(process.env.OPEN_API_KEY as string)) 
        : agent === 'historySummarizer' 
            ? new Flow(historySummarizerConfig(process.env.OPEN_API_KEY as string)) 
            : new Flow(markdownFormatterConfig(process.env.OPEN_API_KEY as string));
    
    const response = await client.run(input);
    
    if (response.type === 'data') {
        return response.value.response;
    } else {
        throw new Error('Unexpected response type');
    }
}

export const generateDatabaseResponse = async (input: ChatCompletionMessageParam[], agent: AgentConfig) => {
    try {
        const client = new Flow(generalistAgentConfig(process.env.OPEN_API_KEY as string, agent)) 
    
        const response = await client.run(input);
        
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
        const client = new Flow(generalistAgentConfig(process.env.OPEN_API_KEY as string, agent)) 
        
        const state = await client.run(input);
        input.forEach((message) => {
            state.messages.push(
                message.content as string // assuming you want to use the first message's content as input text
            );
        });
        const workflow = await zeeworkflow(client, 'You are a chat agent that provides guidance to users of the Xucre Investments application.', 'The goal of this workflow is to provide first line support to users of the Xucre Investments application.')
        return await workflow.run(state);
    } catch (error) {
        console.log(error);
        return 'Error';
        
    }
}