'use client'
import React, { useState, useEffect } from 'react';
import EditAgentConfig from './EditAgentConfig';
import { AgentConfig } from '@/service/chat/types';
import { Button, Typography, List, ListItem, ListItemText, Stack, Box } from '@mui/material';
import OpaqueCard from '@/components/ui/OpaqueCard';

const AgentConfigList: React.FC = () => {
  const [configs, setConfigs] = useState<AgentConfig[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<AgentConfig | null>(null);

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/agent-configs');
      const data = await res.json();
      setConfigs(data);
    } catch (err) {
      console.error('Failed to fetch agent configs:', err);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleNew = () => {
    setSelectedConfig(null);
    setModalOpen(true);
  };

  const handleEdit = (config: AgentConfig) => {
    setSelectedConfig(config);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedConfig(null);
    fetchConfigs();
  };

  return (
    <Box p={4}>
        <OpaqueCard sx={{padding: 4}}>
        <Stack direction="row" spacing={2} justifyContent={'space-between'} alignItems={'center'}>
            <Typography variant="h5" pb={3}>Agent Configurations</Typography>
            <Button variant="contained" color="primary" onClick={handleNew}>New Agent Config</Button>
        </Stack>
        <List>
            {configs.map((config) => (
            <ListItem key={config.name} style={{ margin: '10px 0' }}>
                <ListItemText primary={config.name} secondary={config.description} />
                <Button variant="contained" color="primary" onClick={() => handleEdit(config)}>
                Edit
                </Button>
            </ListItem>
            ))}
        </List>
        {modalOpen && (
            <EditAgentConfig
            initialConfig={selectedConfig}
            onClose={handleModalClose}
            />
        )}
        </OpaqueCard>
    </Box>
  );
};

export default AgentConfigList;
