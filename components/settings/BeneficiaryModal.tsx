import React, { useState, ChangeEvent, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Grid2 as Grid
} from '@mui/material';
import { Beneficiary } from '@/service/types';

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

  useEffect(() => {console.log(formData)}, [formData]);
  useEffect(() => {setFormData(beneficiary)}, [beneficiary]);

  return (
    <Modal open={open} onClose={handleCancel}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          borderRadius: 2,
          p: 3,
          width: '80%',
          maxWidth: 600
        }}
      >
        <Typography variant="h6" mb={2}>
          Beneficiary Information
        </Typography>
        <Grid container spacing={2}>
          <Grid size={4}>
            <TextField
              label="First Name"
              name="firstName"
              fullWidth
              value={formData.firstName}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              label="Middle Name"
              name="middleName"
              fullWidth
              value={formData.middleName}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              label="Last Name"
              name="lastName"
              fullWidth
              value={formData.lastName}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={8}>
            <TextField
              label="Email"
              name="email"
              fullWidth
              value={formData.email}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              label="Phone"
              name="phone"
              fullWidth
              value={formData.phone}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={12}>
            <Typography fontWeight="bold">Address</Typography>
          </Grid>
          <Grid size={6}>
            <TextField
              label="Street"
              name="street"
              fullWidth
              value={formData.street}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label="Street 2"
              name="street2"
              fullWidth
              value={formData.street2}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label="City"
              name="city"
              fullWidth
              value={formData.city}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label="Province"
              name="province"
              fullWidth
              value={formData.province}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label="Postal Code"
              name="postalCode"
              fullWidth
              value={formData.postalCode}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label="Country"
              name="country"
              fullWidth
              value={formData.country}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
          <Button variant="outlined" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Submit
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default BeneficiaryModal;