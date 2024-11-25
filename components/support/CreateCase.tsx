import React, { useState } from 'react';
import { Stack, TextField, Button, Typography } from '@mui/material';
import OpaqueCard from '../ui/OpaqueCard';
import { createCase } from '@/service/sfdc';
import { useLanguage } from '@/hooks/useLanguage';
import languageData from '@/metadata/translations';

const CreateCase = ({userName, userEmail} : {userName: string, userEmail: string}) => {
  const {language} = useLanguage();
  
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
        <Typography variant="h5">{languageData[language].SupportPage.case_title}</Typography>
        <Typography variant="body2">
        {languageData[language].SupportPage.case_body}
        </Typography>
        <TextField
          label={languageData[language].SupportPage.case_name}
          name="name"
          variant="outlined"
          value={formData.name}
          onChange={handleChange}
        />
        <TextField
          label={languageData[language].SupportPage.case_email}
          name="email"
          variant="outlined"
          value={formData.email}
          onChange={handleChange}
        />
        <TextField
          label={languageData[language].SupportPage.case_details}
          name="details"
          multiline
          rows={4}
          variant="outlined"
          value={formData.details}
          onChange={handleChange}
        />
        <Button variant="contained" onClick={handleSubmit}>
          {languageData[language].ui.submit}
        </Button>
      </Stack>
    </OpaqueCard>
  );
};

export default CreateCase;