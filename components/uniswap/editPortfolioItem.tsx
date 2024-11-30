import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import { PortfolioItem } from '@/service/types';
import { Language } from '@/metadata/translations';

interface EditPortfolioItemProps {
  open: boolean;
  onClose: () => void;
  portfolioItem: PortfolioItem;
  onSubmit: (item: PortfolioItem) => void;
}

const EditPortfolioItem: React.FC<EditPortfolioItemProps> = ({ open, onClose, portfolioItem, onSubmit }) => {
  const [item, setItem] = useState<PortfolioItem>(portfolioItem);
  const [currentLanguage, setCurrentLanguage] = useState<Language>(Language.EN);

  const handleLanguageChange = (event: SelectChangeEvent<Language>) => {
    setCurrentLanguage(event.target.value as Language);
  };

  const handleInputChange =
    (field: keyof PortfolioItem) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setItem({
        ...item,
        [field]: field === 'weight' ? parseFloat(event.target.value) : event.target.value,
      });
    };

  const handleCheckboxChange =
    (field: keyof PortfolioItem) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setItem({
        ...item,
        [field]: event.target.checked,
      });
    };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setItem({
      ...item,
      description: {
        ...item.description,
        [currentLanguage]: event.target.value,
      },
    });
  };

  const handleSave = () => {
    onSubmit(item);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Portfolio Item</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel id="language-select-label">Language</InputLabel>
            <Select
              labelId="language-select-label"
              value={currentLanguage}
              onChange={handleLanguageChange}
              label="Language"
            >
              <MenuItem value={Language.EN}>English</MenuItem>
              <MenuItem value={Language.ES}>Spanish</MenuItem>
              <MenuItem value={Language.PT}>Portuguese</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Name"
            value={item.name}
            onChange={handleInputChange('name')}
            fullWidth
          />
          <TextField
            label="Description"
            value={item.description[currentLanguage]}
            onChange={handleDescriptionChange}
            fullWidth
            multiline
          />
          <TextField
            label="Address"
            value={item.address}
            onChange={handleInputChange('address')}
            fullWidth
          />
          <TextField
            label="Logo"
            value={item.logo}
            onChange={handleInputChange('logo')}
            fullWidth
          />
          <TextField
            label="Weight"
            type="number"
            value={item.weight}
            onChange={handleInputChange('weight')}
            fullWidth
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={item.active}
                onChange={handleCheckboxChange('active')}
              />
            }
            label="Active"
          />
          {/* ...other fields as necessary... */}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPortfolioItem;
