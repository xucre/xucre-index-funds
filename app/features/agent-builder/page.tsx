import React from 'react';
import AgentConfigList from '@/components/chat/AgentConfigList';
import { Box } from '@mui/material';

const AgentBuilderPage: React.FC = () => {
  return (
    <Box>
      <AgentConfigList />
    </Box>
  );
};

export default AgentBuilderPage;