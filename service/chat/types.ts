// New types to support dynamically building the agent config

export interface ModelConfig {
  temperature: number;
  apiKey: string;
  // Additional optional model configuration parameters
  [key: string]: any;
}

export interface AgentTool {
  name: string;
  // Configuration for the tool, if applicable
  config?: Record<string, any>;
}

export interface AgentConfig {
  name: string;
  model: ModelConfig;
  instructions: string[];
  description: string;
  toolList: string[];
  introduction?: string;
  tools?: Record<string, AgentTool>;
  temperature?: number;
}

export type AgentConfigBuilder = (
  apiKey: string,
  extraOptions?: Partial<ModelConfig>
) => AgentConfig;

// A dynamic agent configuration type that can be extended
export interface DynamicAgentConfig extends AgentConfig {
  // Additional dynamic fields can be added here
  [key: string]: any;
}
