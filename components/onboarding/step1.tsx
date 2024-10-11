'use client'
import { getTextColor } from "@/service/helpers";
import { Box, Stack, TextField, Checkbox, Button, Typography, useTheme, FormGroup, FormControlLabel, Card, CardContent } from "@mui/material"
import React, { Suspense, useState } from "react";

// components/LoadingIndicator.tsx
export default function Step1Component() {
  const theme = useTheme();


  return (
    <Suspense>
      <Box height={'full'} width={'full'}>
        <Stack direction={'column'} justifyContent={'center'} alignItems={'center'}>
          <Typography variant={'h6'} color={getTextColor(theme)}>Hello {'l'}</Typography>
          <Card>
            <CardContent>
              <KYCForm email={''} formUpdated={(data) => console.log(data)} />
            </CardContent>
          </Card>

        </Stack>
      </Box>
    </Suspense>
  );
};

interface Props {
  email: string;
  formUpdated: (data: { email: string; firstName: string; lastName: string; ldapId: string }) => void;
}

const KYCForm: React.FC<Props> = ({ formUpdated, email }) => {
  const theme = useTheme();
  const buttonColor = theme.palette.mode === 'light' ? 'secondary' : 'primary';
  const [formData, setFormData] = useState({
    email: email, // default value
    firstName: '',
    lastName: '',
    ldapId: '',
  });
  const [errors, setErrors] = useState({
    firstName: false,
    lastName: false,
    ldapId: false,
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === 'firstName' || name === 'lastName') {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: !/^\d*$/.test(value) }));
    }
    if (name === 'ldapId') {
      setErrors((prevErrors) => ({ ...prevErrors, ldapId: value.length > 80 }));
    }
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      formData.firstName &&
      formData.lastName &&
      formData.ldapId &&
      !errors.firstName &&
      !errors.lastName &&
      !errors.ldapId
    ) {
      formUpdated(formData);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: '500px', padding: '20px' }}>
      <Typography variant="h6">Please fill out the following information:</Typography>
      <TextField
        label="Email"
        name="email"
        value={formData.email}
        onChange={handleInputChange}
        fullWidth
        disabled
        sx={{ my: 1 }}
      />
      <TextField
        label="First Name"
        name="firstName"
        value={formData.firstName}
        onChange={handleInputChange}
        error={errors.firstName}
        helperText={errors.firstName ? 'No numbers allowed' : ''}
        fullWidth
        sx={{ my: 1 }}
      />
      <TextField
        label="Last Name"
        name="lastName"
        value={formData.lastName}
        onChange={handleInputChange}
        error={errors.lastName}
        helperText={errors.lastName ? 'No numbers allowed' : ''}
        fullWidth
        sx={{ my: 1 }}
      />
      <TextField
        label="LDAP ID"
        name="ldapId"
        value={formData.ldapId}
        onChange={handleInputChange}
        error={errors.ldapId}
        helperText={errors.ldapId ? 'Maximum 80 characters allowed' : ''}
        fullWidth
        sx={{ my: 1 }}
      />
      <FormGroup>
        <FormControlLabel required control={<Checkbox color={buttonColor} defaultChecked />} label="I acknowledge that Lorem is my ipsum to the gypsum." />
      </FormGroup>
      <Button sx={{ my: 1 }} type="submit" variant="contained" color={buttonColor}>
        Submit
      </Button>
    </Box>
  );
};