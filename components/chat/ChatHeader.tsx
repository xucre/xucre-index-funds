import React, { useState, useEffect } from 'react';
import OpaqueCard from '../ui/OpaqueCard';
import { Box, FormControl, InputLabel, Select, MenuItem, Stack } from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { AgentConfig } from '@/service/chat/types';

// Define or import the AgentConfig type as needed

interface ChatHeaderProps {
  onAgentSelected: (agent: AgentConfig) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ onAgentSelected }) => {
  const [agentConfigs, setAgentConfigs] = useState<AgentConfig[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('');

  useEffect(() => {
    const fetchAgentConfigs = async () => {
      try {
        const res = await fetch('/api/agent-configs');
        if (!res.ok) throw new Error('Failed to fetch agent configs');
        const data = await res.json();
        setAgentConfigs(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchAgentConfigs();
  }, []);
  const handleChange = (event: SelectChangeEvent<string>) => {
    const agentId = event.target.value;
    setSelectedAgent(agentId);
    const agent = agentConfigs.find(config => config.name === agentId);
    if (agent) {
      onAgentSelected(agent);
    }
  };

  return (
    <>
      <Box display="flex" alignItems="center" p={2}>
        <Stack direction="row" width={'100%'} spacing={2} justifyContent={'end'} alignItems={'center'}>
          <FormControl variant="outlined" sx={{ minWidth: 150 }}>
            <InputLabel id="agent-select-label">Select Agent</InputLabel>
            <Select
              labelId="agent-select-label"
              value={selectedAgent}
              onChange={handleChange}
              label="Select Agent"
            >
              {agentConfigs.map((agent) => (
                <MenuItem key={agent.name} value={agent.name}>
                  {agent.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        
      </Box>
    </>
  );
};

export default ChatHeader;
