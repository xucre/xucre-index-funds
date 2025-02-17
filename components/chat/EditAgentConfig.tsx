import React, { useState, useEffect } from 'react';
import { AgentConfig } from '@/service/chat/types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Typography,
  IconButton,
  Box,
  Tabs,
  Tab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

interface EditAgentConfigProps {
  initialConfig: AgentConfig | null;
  onClose: () => void;
}

const EditAgentConfig: React.FC<EditAgentConfigProps> = ({ initialConfig, onClose }) => {
  const [name, setName] = useState(initialConfig ? initialConfig.name : '');
  const [description, setDescription] = useState(initialConfig ? initialConfig.description || '' : '');
  const [instructions, setInstructions] = useState<string[]>(initialConfig ? initialConfig.instructions : ['']);
  const [toolList, setToolList] = useState<string[]>(initialConfig ? initialConfig.toolList : ['']);
  const [error, setError] = useState('');
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (initialConfig) {
      setName(initialConfig.name);
      setDescription(initialConfig.description || '');
      setInstructions(initialConfig.instructions);
      setToolList(initialConfig.toolList);
    } else {
      setName('');
      setDescription('');
      setInstructions(['']);
      setToolList(['']);
    }
  }, [initialConfig]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    const payload = { name, description, instructions, toolList };
    try {
      const res = await fetch(`/api/agent-configs`, {
        method: initialConfig ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'An error occurred');
      } else {
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred');
    }
  };

  const handleAddInstruction = () => setInstructions([...instructions, '']);
  const handleRemoveInstruction = (index: number) => setInstructions(instructions.filter((_, i) => i !== index));
  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handleAddTool = () => setToolList([...toolList, '']);
  const handleRemoveTool = (index: number) => setToolList(toolList.filter((_, i) => i !== index));
  const handleToolChange = (index: number, value: string) => {
    const newToolList = [...toolList];
    newToolList[index] = value;
    setToolList(newToolList);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  return (
    <Dialog open={true} onClose={onClose} fullWidth={true} maxWidth={'md'}>
      <DialogTitle>{initialConfig ? 'Edit Agent Config' : 'Create New Agent Config'}</DialogTitle>
      <DialogContent>
        {error && <Typography color="error">{error}</Typography>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            margin="normal"
          />
          <Tabs value={tabIndex} onChange={handleTabChange} sx={{ marginBottom: 2 }}>
            <Tab label="Instructions" />
            <Tab label="Tool List" />
          </Tabs>
          {tabIndex === 0 && (
            <Box>
              {instructions.map((instruction, index) => (
                <Box key={index} display="flex" alignItems="center">
                  <TextField
                    label={`Instruction ${index + 1}`}
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                  <IconButton onClick={() => handleRemoveInstruction(index)}>
                    <RemoveIcon />
                  </IconButton>
                </Box>
              ))}
              <Button onClick={handleAddInstruction} startIcon={<AddIcon />}>
                Add Instruction
              </Button>
            </Box>
          )}
          {tabIndex === 1 && (
            <Box>
              {toolList.map((tool, index) => (
                <Box key={index} display="flex" alignItems="center">
                  <TextField
                    label={`Tool ${index + 1}`}
                    value={tool}
                    onChange={(e) => handleToolChange(index, e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                  <IconButton onClick={() => handleRemoveTool(index)}>
                    <RemoveIcon />
                  </IconButton>
                </Box>
              ))}
              <Button onClick={handleAddTool} startIcon={<AddIcon />}>
                Add Tool
              </Button>
            </Box>
          )}
          <Box display="flex" justifyContent="flex-end" marginTop="20px">
            <Button onClick={onClose} style={{ marginRight: '10px' }}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">Submit</Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAgentConfig;
