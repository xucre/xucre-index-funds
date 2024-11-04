import React, { use, useEffect, useState } from 'react';
import { TextField, Button, Stack, Grid2 as Grid, Typography, debounce } from '@mui/material';
import ImageUpload from './ImageUpload';
import { SFDCUserData } from '@/service/types';
import AddressAutocomplete from 'mui-address-autocomplete';
import { useLanguage } from '@/hooks/useLanguage';
import languageData, { Language } from '@/metadata/translations';

// Import additional necessary components and libraries
interface KYCFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  address: string;
  idCardNumber: string;
  idExpirationDate: number;
  frontImage: string;
  backImage: string;
}

const KYC = ({user, updateUser} : {user: SFDCUserData, updateUser: Function}) => {
  const {language} = useLanguage();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'idExpirationDate') {
      return updateUser((prevData) => ({
        ...prevData,
        idExpirationDate: new Date(value).getTime(),
      }));
    } else {
      updateUser((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleFrontImageChange = (url) => updateUser((prevData) => ({ ...prevData, frontImage: url }))
  const handleBackImageChange = (url) => updateUser((prevData) => ({ ...prevData, backImage: url }))

  return (
    <>
      {user && 
        <Grid container spacing={2}>
          <Grid size={12}><Typography fontWeight={'bold'}>{languageData[language].Edit.personal_section}</Typography></Grid>
          <Grid size={6}>
            <TextField
              label={languageData[language].Edit.firstName_label}
              name="firstName"
              fullWidth
              value={user.firstName}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label={languageData[language].Edit.middleName_label}
              name="middleName"
              fullWidth
              value={user.middleName}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label={languageData[language].Edit.lastName_label}
              name="lastName"
              fullWidth
              value={user.lastName}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={12}><Typography fontWeight={'bold'}>{languageData[language].Edit.address_section}</Typography></Grid>
          <Grid size={12}>
            <AddressAutocomplete
              apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY}
              label={languageData[language].Edit.address_label}
              autoComplete={false}
              value={user ? { description: user.address, place_id: user.placeId, components: {}, structured_formatting: { main_text: user.address, secondary_text: "", main_text_matched_substrings: []} }: null}
              //value={null}
              fields={[]} // fields will always contain address_components and formatted_address, no need to repeat them
              onChange={(_, value) => {
                updateUser((prevData) => {
                  if (!value) return prevData;
                  return {
                  ...prevData,
                  address: value['formatted_address'],
                  placeId: value['place_id']
                }});
              }}
            />
          </Grid>
          <Grid size={12}><Typography fontWeight={'bold'}>{languageData[language].Edit.id_section}</Typography></Grid>
          <Grid size={6}>
            <TextField
              label={languageData[language].Edit.idNumber_label}
              name="idCardNumber"
              fullWidth
              value={user.idCardNumber}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={6}>
            <TextField
              label={languageData[language].Edit.idExpiration_label}
              name="idExpirationDate"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={user.idExpirationDate}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={12}>
            <Stack direction={'row'} spacing={2} justifyContent={'space-between'} alignItems={'center'} >
              <ImageUpload imageUrl={user.frontImage} imageUpload={handleFrontImageChange} />
            
              <ImageUpload imageUrl={user.backImage} imageUpload={handleBackImageChange} />
            </Stack>
          </Grid>
        </Grid>
      }
      
    </>
  );
};

export default KYC;
