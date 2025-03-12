'use server';
import lmstudio from "../providers/lmstudio";
import {openai} from '@ai-sdk/openai'
import { generateObject, generateText, streamText } from 'ai';
import { z } from 'zod';
import { ai_vectorSearchTool } from "../tools/vectorSearch";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { AgentConfig } from "../types";
import { listAgentConfigs } from "../db";
import { ai_caseCreateTool } from "../tools/caseCreate";


export async function handleCustomerQuery(input: ChatCompletionMessageParam[], agent: AgentConfig) {
    const agents = await listAgentConfigs();
    const agentMap = agents.reduce((acc, agent) => {
        acc[agent.name] = agent;
        return acc;
    }, {})
    const currentMessage = input.pop();
    const query = currentMessage?.content as string;
    console.log('user query:', query);
    const model = openai('gpt-4o-mini') //lmstudio('granite-3.1-8b-instruct');

    // First step: Classify the query type
    const { object: classification } = await generateObject({
        model,
        schema: z.object({
        reasoning: z.string(),
        type: z.enum(['general', 'application', 'action']),
        complexity: z.enum(['simple', 'complex']),
        }),
        prompt: `Classify this customer query:
        ${query}

        Determine:
        1. Query type : "general" - general question about finance, investments, or the crypto market. || "application" - question about Xucre Investments or the application itself. || "action" - request asking to agent to perform an action on behalf of the user.)
        2. Complexity (simple or complex)
        3. Brief reasoning for classification`,
    });

    console.log('object generated', classification)
    // Route based on classification
    // Set model and system prompt based on query type and complexity
    const textStream = streamText({
            model:
            classification.complexity === 'simple'
                ? model
                : model,
            system: {
            general: agentMap['Generalist'].description || `You are a knowledgeable representative of Xucre Investments—a next-generation, blockchain-powered retirement planning platform designed for Latin American tech professionals. Emphasize that Xucre empowers users with transparent, secure, and cost-efficient solutions through features like self-custody wallet integration, diversified index funds, advanced investment tools, and seamless employee onboarding, all built on a modern tech stack (TypeScript, Next.js, MongoDB, AWS Lambda) that ensures scalability and reliability. When addressing user inquiries, focus on Xucre’s unique value proposition: providing accessible and innovative retirement solutions that bridge the gap left by traditional financial products. Highlight the benefits of blockchain transparency, robust security measures, personalized subscription tiers, and comprehensive customer support, ensuring that users understand how Xucre enables them to take full control of their financial future in a secure and user-friendly digital environment.`,
            application:
                'You are a customer support agent for Xucre Investments—a cutting-edge, blockchain-powered retirement planning platform designed for Latin American tech professionals. Your role is to provide clear, empathetic, and knowledgeable assistance to users by guiding them through account setup, portfolio management, fund transfers, subscription plan details, and case creation. For additional details on application features and customer agreements, use the vectorSearch tool to retrieve the most current and comprehensive information. This ensures that every interaction reinforces the trust and reliability of Xucre Investments while providing users with precise, up-to-date support. For requests to create cases, use the createCase tool to submit cases for human support.',
            action:
                'You are a technical support specialist with deep product knowledge. Focus on clear step-by-step troubleshooting.',
            }[classification.type],
            prompt: `Respond to this customer query : ${query}
                Use the following message history to contextualize your response: ${JSON.stringify(input)}
            `,
            maxSteps: 20,
            tools: {
                general: {
                    vectorSearch: ai_vectorSearchTool
                },
                application: {
                    vectorSearch: ai_vectorSearchTool,
                    caseCreate: ai_caseCreateTool
                },
                action: {
                    caseCreate: ai_caseCreateTool
                },
            }[classification.type],
    });
    console.log('textStream generated', textStream.request, textStream.reasoningDetails)
    // const { text: response } = await generateText({
    //     model:
    //     classification.complexity === 'simple'
    //         ? lmstudio('granite-3.1-8b-instruct')
    //         : lmstudio('granite-3.1-8b-instruct'),
    //     system: {
    //     general: agentMap['Generalist'].description || `You are a knowledgeable representative of Xucre Investments—a next-generation, blockchain-powered retirement planning platform designed for Latin American tech professionals. Emphasize that Xucre empowers users with transparent, secure, and cost-efficient solutions through features like self-custody wallet integration, diversified index funds, advanced investment tools, and seamless employee onboarding, all built on a modern tech stack (TypeScript, Next.js, MongoDB, AWS Lambda) that ensures scalability and reliability. When addressing user inquiries, focus on Xucre’s unique value proposition: providing accessible and innovative retirement solutions that bridge the gap left by traditional financial products. Highlight the benefits of blockchain transparency, robust security measures, personalized subscription tiers, and comprehensive customer support, ensuring that users understand how Xucre enables them to take full control of their financial future in a secure and user-friendly digital environment.`,
    //     application:
    //         'You are a customer support agent for Xucre Investments—a cutting-edge, blockchain-powered retirement planning platform designed for Latin American tech professionals. Your role is to provide clear, empathetic, and knowledgeable assistance to users by guiding them through account setup, portfolio management, fund transfers, subscription plan details, and case creation. For additional details on application features and customer agreements, use the vectorSearch tool to retrieve the most current and comprehensive information. This ensures that every interaction reinforces the trust and reliability of Xucre Investments while providing users with precise, up-to-date support. For requests to create cases, use the createCase tool to submit cases for human support.',
    //     action:
    //         'You are a technical support specialist with deep product knowledge. Focus on clear step-by-step troubleshooting.',
    //     }[classification.type],
    //     prompt: `Respond to this customer query : ${query}
    //         Use the following message history to contextualize your response: ${JSON.stringify(input)}
    //     `,
    //     maxSteps: 8,
    //     tools: {
    //         general: {
    //             vectorSearch: ai_vectorSearchTool
    //         },
    //         application: {
    //             vectorSearch: ai_vectorSearchTool,
    //             caseCreate: ai_caseCreateTool
    //         },
    //         action: {
    //             caseCreate: ai_caseCreateTool
    //         },
    //     }[classification.type],
    // });

    return { response: textStream, classification };
}