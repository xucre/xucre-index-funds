// 'use server'
import { kv } from '@vercel/kv';
import type { AgentConfig } from './types';

// Save (create or update) an agent configuration
export async function saveAgentConfig(agentConfig: AgentConfig): Promise<void> {
  const key = `agentConfig:${agentConfig.name}`;
  await kv.hmset(key, { data: JSON.stringify(agentConfig) });
}

// Retrieve an agent configuration by its name
export async function getAgentConfig(name: string): Promise<AgentConfig | null> {
  const key = `agentConfig:${name}`;
  const data = await kv.hget(key, 'data');
  if (data) {
    return JSON.parse(data as string) as AgentConfig;
  }
  return null;
}

// Update an existing agent configuration by merging updates
export async function updateAgentConfig(name: string, updates: Partial<AgentConfig>): Promise<void> {
  const existing = await getAgentConfig(name);
  if (!existing) {
    throw new Error(`AgentConfig with name ${name} not found`);
  }
  const updatedConfig = { ...existing, ...updates };
  await saveAgentConfig(updatedConfig);
}

// Delete an agent configuration by its name
export async function deleteAgentConfig(name: string): Promise<void> {
  const key = `agentConfig:${name}`;
  await kv.del(key);
}

// List all agent configurations
export async function listAgentConfigs(): Promise<AgentConfig[]> {
  const keys = await kv.keys('agentConfig:*');
  const configs: AgentConfig[] = [];
  for (const key of keys) {
    const data = await kv.hget(key, 'data');
    if (data) {
      const parsedData = data as AgentConfig;
      configs.push(parsedData);
    }
  }
  return configs;
}

// ...additional methods if needed...
