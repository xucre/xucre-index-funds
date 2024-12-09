import React, { use, useEffect, useState } from 'react';
import { TextField, Button, Stack, Grid2 as Grid, Typography, debounce, Tabs, Tab } from '@mui/material';
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
  idExpirationDate: string;
  frontImage: string;
  backImage: string;
}

const KYC = ({user, updateUser} : {user: SFDCUserData, updateUser: Function}) => {
  const {language} = useLanguage();
  const [selectedTab, setSelectedTab] = React.useState(0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (false && name === 'idExpirationDate') {
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const handleFrontImageChange = (url) => updateUser((prevData) => ({ ...prevData, frontImage: url }))
  const handleBackImageChange = (url) => updateUser((prevData) => ({ ...prevData, backImage: url }))

  return (
    <>
      <Tabs value={selectedTab} onChange={handleTabChange} aria-label="basic tabs example" sx={{alignItems: 'center',justifyContent: 'space-between', display: 'flex'}} component={Stack} direction={'row'} width={'100%'}>
          <Tab label={languageData[language].Edit.personal_information}  />
          <Tab label={languageData[language].Edit.id_section} />
      </Tabs>
      {user && selectedTab === 0 && 
        <Grid container spacing={2}>
          <Grid size={12}><Typography fontWeight={'bold'}>{languageData[language].Edit.personal_section}</Typography></Grid>
          <Grid size={4}>
            <TextField
              label={languageData[language].Edit.firstName_label}
              name="firstName"
              fullWidth
              value={user.firstName}
              slotProps={{ inputLabel: { shrink: true } }}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              label={languageData[language].Edit.middleName_label}
              name="middleName"
              fullWidth
              value={user.middleName}
              slotProps={{ inputLabel: { shrink: true } }}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              label={languageData[language].Edit.lastName_label}
              name="lastName"
              fullWidth
              value={user.lastName}
              slotProps={{ inputLabel: { shrink: true } }}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={12}><Typography fontWeight={'bold'}>{languageData[language].Edit.address_section}</Typography></Grid>
          <Grid size={12}>
            <AddressAutocomplete
              apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY}
              label={languageData[language].Edit.address_label}
              autoComplete={false}
              value={user ? { description: user.address, place_id: user.placeId, components: {}, structured_formatting: { main_text: user.address, secondary_text: "", main_text_matched_substrings: []} }: { description: '', place_id: '', components: {}, structured_formatting: { main_text: '', secondary_text: "", main_text_matched_substrings: []} }} 
              //value={null}
              fields={[]} // fields will always contain address_components and formatted_address, no need to repeat them
              onChange={(_, value, reason) => {
                if (!value) return;
                if (reason === 'clear' || reason === 'blur') return;
                if (!value['address_components'].find((c) => c.types.includes('route'))) return;
                console.log(value);
                const street = value['address_components'].find((c) => c.types.includes('street_number'))?.long_name + ' ' + value['address_components'].find((c) => c.types.includes('route'))?.long_name;
                const city = value['address_components'].find((c) => c.types.includes('locality'))?.long_name || '';
                const province = value['address_components'].find((c) => c.types.includes('administrative_area_level_1'))?.long_name || '';
                const postalCode = value['address_components'].find((c) => c.types.includes('postal_code'))?.long_name || '';
                const country = value['address_components'].find((c) => c.types.includes('country'))?.long_name || '';
                updateUser((prevData) => {
                  return {
                  ...prevData,
                  address: value['formatted_address'],
                  placeId: value['place_id'],
                  street: street,
                  city: city,
                  province: province,
                  postalCode: postalCode,
                  country: country
                }});
              }}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label={languageData[language].Edit.street_label}
              name="street"
              fullWidth
              value={user.street}
              slotProps={{ inputLabel: { shrink: true } }}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label={languageData[language].Edit.city_label}
              name="city"
              fullWidth
              value={user.city}
              slotProps={{ inputLabel: { shrink: true } }}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label={languageData[language].Edit.street2_label}
              name="street2"
              fullWidth
              value={user.street2}
              slotProps={{ inputLabel: { shrink: true } }}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label={languageData[language].Edit.province_label}
              name="province"
              fullWidth
              value={user.province}
              slotProps={{ inputLabel: { shrink: true } }}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label={languageData[language].Edit.postalCode_label}
              name="postalCode"
              fullWidth
              value={user.postalCode}
              slotProps={{ inputLabel: { shrink: true } }}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={6}>
            <TextField
              label={languageData[language].Edit.country_label}
              name="country"
              fullWidth
              value={user.country}
              slotProps={{ inputLabel: { shrink: true } }}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
      }

      {user && selectedTab === 1 &&
        <Grid container spacing={2}>
          <Grid size={12}><Typography fontWeight={'bold'}>{languageData[language].Edit.id_section}</Typography></Grid>
          <Grid size={6}>
            <TextField
              label={languageData[language].Edit.idNumber_label}
              name="idCardNumber"
              fullWidth
              value={user.idCardNumber}
              slotProps={{ inputLabel: { shrink: true } }}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={6}>
            <TextField
              label={languageData[language].Edit.idExpiration_label}
              name="idExpirationDate"
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={user.idExpirationDate || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={12}>
            <Stack direction={'row'} spacing={2} justifyContent={'space-between'} alignItems={'center'} >
              <Stack direction={'column'} spacing={1}>
                <Typography fontWeight={'bold'}>{languageData[language].Edit.front_label}</Typography>
                <ImageUpload imageUrl={user.frontImage} imageUpload={handleFrontImageChange} />
              </Stack>
              <Stack direction={'column'} spacing={1}>
                <Typography fontWeight={'bold'}>{languageData[language].Edit.back_label}</Typography>
                <ImageUpload imageUrl={user.backImage} imageUpload={handleBackImageChange} />
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      }
      
    </>
  );
};

export default KYC;
