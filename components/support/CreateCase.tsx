import React, { useState } from 'react';
import { Stack, TextField, Button, Typography } from '@mui/material';
import OpaqueCard from '../ui/OpaqueCard';
import { createCase } from '@/service/sfdc';

const CreateCase = ({userName, userEmail} : {userName: string, userEmail: string}) => {
  const [formData, setFormData] = useState({
    name: userName || '',
    email: userEmail || '',
    details: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Handle submit logic here
    console.log('Submitted data:', formData);
    await createCase(formData.name, formData.details, formData.email);
  };

  return (
    <OpaqueCard sx={{padding:4}}>
      <Stack direction="column" spacing={2}>
        <Typography variant="h5">Need Assistance?</Typography>
        <Typography variant="body2">
          If you're experiencing issues or have questions, please fill out the form below and we'll get back to you as soon as possible.
        </Typography>
        <TextField
          label="Name"
          name="name"
          variant="outlined"
          value={formData.name}
          onChange={handleChange}
        />
        <TextField
          label="Email"
          name="email"
          variant="outlined"
          value={formData.email}
          onChange={handleChange}
        />
        <TextField
          label="Details"
          name="details"
          multiline
          rows={4}
          variant="outlined"
          value={formData.details}
          onChange={handleChange}
        />
        <Button variant="contained" onClick={handleSubmit}>
          Submit
        </Button>
      </Stack>
    </OpaqueCard>
  );
};

export default CreateCase;