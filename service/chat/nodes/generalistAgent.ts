import { BaseNode } from "@pocketflow/core";
import { generateText, tool } from "ai";
import {z} from "zod";
import lmstudio from "../providers/lmstudio";
import { ai_vectorSearchTool } from "../tools/vectorSearch";
import { ai_formatFinalOutputTool } from "../tools/formatting";

export class GeneralistNode extends BaseNode {
    private prompt: string;
    constructor(prompt: string) {
        super();
        this.prompt = prompt;
    }

    public _clone(): BaseNode {
        return new GeneralistNode(this.prompt);
    }

    async execCore(prepResult: any): Promise<any> {
        console.log("GeneralistNode ExecCore: " + prepResult.prompt);
        const { text } = await generateText({
            model: lmstudio('granite-3.1-8b-instruct'),
            prompt: prepResult,
            system: 'You are a chat agent that provides tier 1 support to users of the Xucre Investments application.',
            maxRetries: 2, // immediately error if the server is not running
            maxSteps: 10,
            tools: {
                vectorSearch: ai_vectorSearchTool
            }
        });

        return text;

    }

    async post(prepResult: any, execResult: string, sharedState: any): Promise<string> {
        return execResult;
    }

    async prep(sharedState: any): Promise<any> {
        return {
            prompt: this.prompt
        };
    }
}