import React, { useState, ChangeEvent, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid2 as Grid,
  Dialog,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { Beneficiary } from '@/service/types';
import { useLanguage } from '@/hooks/useLanguage';

interface BeneficiaryModalProps {
  open: boolean;
  onClose: (close: boolean) => void;
  beneficiary: Beneficiary;
  saveBeneficiary: (b: Beneficiary) => void;
  deleteBeneficiary: (b: Beneficiary) => void;
}

const BeneficiaryModal: React.FC<BeneficiaryModalProps> = ({
  open,
  onClose,
  beneficiary,
  saveBeneficiary
}) => {
  const [formData, setFormData] = useState<Beneficiary>(beneficiary);
  const {language, languageData} = useLanguage();
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    saveBeneficiary(formData);
    onClose(false);
  };

  const handleCancel = () => {
    onClose(false);
  };

  //useEffect(() => {console.log(formData)}, [formData]);
  useEffect(() => {setFormData(beneficiary)}, [beneficiary]);

  return (
    <Dialog open={open} onClose={handleCancel}>
      <DialogTitle>{languageData[language].Edit.beneficiary_modal_title}</DialogTitle>      
      <DialogContent sx={{minHeight: 200, py: 1}}>
        <Grid container spacing={2} py={1}>
          <Grid size={4}>
            <TextField
              label={languageData[language].Edit.firstName_label}
              name="firstName"
              fullWidth
              value={formData.firstName}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              label={languageData[language].Edit.middleName_label}
              name="middleName"
              fullWidth
              value={formData.middleName}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              label={languageData[language].Edit.lastName_label}
              name="lastName"
              fullWidth
              value={formData.lastName}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={8}>
            <TextField
              label={languageData[language].Edit.email_label}
              name="email"
              fullWidth
              value={formData.email}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              label={languageData[language].Edit.phone_label}
              name="phone"
              fullWidth
              value={formData.phone}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={12}>
            <Typography fontWeight="bold">{languageData[language].Edit.address_section}</Typography>
          </Grid>
          <Grid size={6}>
            <TextField
              label={languageData[language].Edit.street_label}
              name="street"
              fullWidth
              value={formData.street}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label={languageData[language].Edit.street2_label}
              name="street2"
              fullWidth
              value={formData.street2}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label={languageData[language].Edit.city_label}
              name="city"
              fullWidth
              value={formData.city}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label={languageData[language].Edit.province_label}
              name="province"
              fullWidth
              value={formData.province}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label={languageData[language].Edit.postalCode_label}
              name="postalCode"
              fullWidth
              value={formData.postalCode}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label={languageData[language].Edit.country_label}
              name="country"
              fullWidth
              value={formData.country}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" onClick={handleCancel}>
            {languageData[language].ui.cancel}
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            {languageData[language].ui.submit}
          </Button>
        </Box>
        </DialogContent>
    </Dialog>
  );
};

export default BeneficiaryModal;