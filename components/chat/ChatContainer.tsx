import React, { useState } from 'react';
import ChatHeader from './ChatHeader';
import ChatInterface from './ChatInterface';
import OpaqueCard from '../ui/OpaqueCard';
import { Stack } from '@mui/material';
import { AgentConfig } from '@/service/chat/types';

const ChatContainer = () => {

  const [agentConfig, setAgentConfig] = useState<AgentConfig>();
  return (
    <OpaqueCard style={{  margin: '1rem auto' }}>
      <Stack>
        <ChatHeader onAgentSelected={setAgentConfig}/>
        {agentConfig &&
          <ChatInterface agent={agentConfig}/>
        }
      </Stack>
    </OpaqueCard>
  );
};

export default ChatContainer;
