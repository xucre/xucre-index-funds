import React from 'react';
import ChatHeader from './ChatHeader';
import ChatInterface from './ChatInterface';
import OpaqueCard from '../ui/OpaqueCard';
import { Stack } from '@mui/material';

const ChatContainer = () => {
  return (
    <OpaqueCard style={{  margin: '1rem auto' }}>
      <Stack>
        <ChatHeader />
        <ChatInterface />
      </Stack>
    </OpaqueCard>
  );
};

export default ChatContainer;
