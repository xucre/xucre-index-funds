
import { Agent, ModelConfig } from "@covalenthq/ai-agent-sdk";

export const modelConfig: ModelConfig = {
  provider: "OPEN_AI",
  name: "gpt-4o-mini",
  apiKey: process.env.OPENAI_API_KEY,
}