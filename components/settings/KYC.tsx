import React, { use, useEffect, useState } from 'react';
import { TextField, Button, Stack, Grid2 as Grid, Typography, debounce, Tabs, Tab, FormControl, InputLabel, MenuItem, Select, IconButton, Box, List, ListItem, ListItemText, Badge, styled } from '@mui/material';
import ImageUpload from './ImageUpload';
import { Beneficiary, SFDCUserData } from '@/service/types';
import AddressAutocomplete from 'mui-address-autocomplete';
import { useLanguage } from '@/hooks/useLanguage';
import CloseIcon from '@mui/icons-material/Close';
import ReusableModal from '../ui/ReusableModal';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AddIcon from '@mui/icons-material/Add';
import { isNull } from '@/service/helpers';
import { v4 as uuidv4 } from 'uuid';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import router from 'next/router';
import BeneficiaryModal from './BeneficiaryModal';

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

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    top:'10px',
  },
}));

const KYC = ({user, updateUser} : {user: SFDCUserData, updateUser: Function}) => {
  const {language, languageData} = useLanguage();
  const [selectedTab, setSelectedTab] = React.useState(0);
  const [selectedBeneficiary, setSelectedBeneficiary] = React.useState<Beneficiary>({} as Beneficiary);
  const [beneficiaryModalOpen, setBeneficiaryModalOpen] = React.useState(false);

  const handleIdTypeSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateUser((prevData) => ({
      ...prevData,
      ['idType']: value,
    }));
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (false && name === 'idType') {
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
  const handleFrontImageClear = () => updateUser((prevData) => ({ ...prevData, frontImage: '' }))
  const handleBackImageChange = (url) => updateUser((prevData) => ({ ...prevData, backImage: url }))
  const handleBackImageClear = () => updateUser((prevData) => ({ ...prevData, frontImage: '' }))
  
  const handleSelectBeneficiary = (beneficiary: Beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setBeneficiaryModalOpen(true);
  }

  const handleNewBeneficiary = () => {
    setSelectedBeneficiary({
      id: uuidv4(),
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      phone: '',
      street: '',
      street2: '',
      city: '',
      province: '',
      postalCode: '',
      country: '',
    } as Beneficiary);
    setBeneficiaryModalOpen(true);
  }

  const handleSaveBeneficiary = (beneficiary: Beneficiary) => {
    updateUser((prevData) => ({
      ...prevData,
      beneficiaries: [...prevData.beneficiaries.filter((ben) => ben.id !== beneficiary.id), beneficiary],
    }));
  }

  const handleDeleteBeneficiary = (beneficiary: Beneficiary) => {
    updateUser((prevData) => ({
      ...prevData,
      beneficiaries: prevData.beneficiaries.filter((ben) => ben.id !== beneficiary.id),
    }));
  }

  const IdentificationHelpText = () => {
    return (
      <Box p={5}>
        <Typography variant="h6" sx={{pb:2}}>
          {languageData[language].Edit.identification_help_text_title}
        </Typography>
        <Typography variant="body1">
          {languageData[language].Edit.identification_help_text_body1}
        </Typography>
        <List>
          <ListItem>
            {/* <ListItemIcon>
              <CircleIcon fontSize="small" />
            </ListItemIcon> */}
            <ListItemText primary={languageData[language].Edit.identification_help_text_bullet1} />
          </ListItem>
          <ListItem>
            {/* <ListItemIcon>
              <CircleIcon fontSize="small"  sx={{fontSize: 10}}/>
            </ListItemIcon> */}
            <ListItemText primary={languageData[language].Edit.identification_help_text_bullet2} />
          </ListItem>
          <ListItem>
            {/* <ListItemIcon>
              <CircleIcon fontSize="small" />
            </ListItemIcon> */}
            <ListItemText primary={languageData[language].Edit.identification_help_text_bullet3} />
          </ListItem>
        </List>
      </Box>
      
    )
  }

  const columns: GridColDef[] = [
    { field: 'firstName', headerName: languageData[language].Edit.firstName_label, flex: 1, headerClassName: 'primaryBackground--header', },
    { field: 'lastName', headerName: languageData[language].Edit.lastName_label, flex: 1, headerClassName: 'primaryBackground--header', },
    { field: 'email', headerName: languageData[language].Edit.email_label, flex: 1.8, headerClassName: 'primaryBackground--header', },
    {
      field: 'view',
      headerName: '',
      sortable: false,
      flex: 0.5,
      headerClassName: 'primaryBackground--header',
      renderCell: (params: GridRenderCellParams) => {
        return (
            <IconButton 
              aria-label={`${params.row.firstName} ${params.row.lastName}`}
              onClick={() => handleSelectBeneficiary(params.row as Beneficiary)}
            >
              <ArrowForwardIcon />
            </IconButton>
        )
      },
    },
  ];

  const isProfileComplete =  !isNull(user.idCardNumber) && !isNull(user.idExpirationDate) && !isNull(user.idIssueDate) && !isNull(user.backImage) && !isNull(user.frontImage);
  
  return (
    <>
      <Tabs value={selectedTab} onChange={handleTabChange} aria-label="basic tabs example" sx={{alignItems: 'center',justifyContent: 'space-between', display: 'flex'}} className={'group-space-between'} component={Stack} justifyContent={'space-between'} direction={'row'} width={'100%'}>
          <Tab label={languageData[language].Edit.personal_information}  />
          <Tab label={languageData[language].Edit.id_section} />
          <Tab label={languageData[language].Edit.beneficiary_section} />
      </Tabs>
      {selectedTab === 0 && 
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

      {selectedTab === 1 &&
        <Grid container spacing={2}>
          <Grid size={12}>
            <Stack direction={'row'} spacing={2} justifyContent={'space-between'} alignItems={'center'} >  
              <Typography fontWeight={'bold'}>{languageData[language].Edit.id_section}</Typography>
              <ReusableModal icon={<HelpOutlineIcon color={'disabled'} />} >
                <IdentificationHelpText />
              </ReusableModal>
            </Stack>
          </Grid>
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
              label={languageData[language].Edit.idIssueDate_label}
              name="idIssueDate"
              type="date"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={user.idIssueDate || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid size={6}>
            <FormControl fullWidth >
              <InputLabel shrink={true} id="idType">{languageData[language].Edit.idType_label}</InputLabel>
              <Select
                labelId="idType"
                value={user.idType || ''}
                label={languageData[language].Edit.idType_label}
                onChange={handleIdTypeSelectChange}
                native={false}
              >
                <MenuItem value={'id'}>{languageData[language].Edit.idType_id}</MenuItem>
                <MenuItem value={'dl'}>{languageData[language].Edit.idType_driverLicense}</MenuItem>
                <MenuItem value={'passport'}>{languageData[language].Edit.idType_passport}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={6}>
            <TextField
              error={user.idExpirationDate !== null && new Date(user.idExpirationDate).getTime() <= new Date().getTime()}
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
                <Stack direction={'row'} spacing={1} justifyContent={'space-between'} alignItems={'center'}>
                  <Typography fontWeight={'bold'}>{languageData[language].Edit.front_label}</Typography>
                  {user.frontImage && user.frontImage.length > 0 && <IconButton onClick={handleFrontImageClear}><CloseIcon /></IconButton>}
                </Stack>
                <ImageUpload imageUrl={user.frontImage} imageUpload={handleFrontImageChange} />
              </Stack>
              <Stack direction={'column'} spacing={1}>
                <Stack direction={'row'} spacing={1} justifyContent={'space-between'} alignItems={'center'}>
                  <Typography fontWeight={'bold'}>{languageData[language].Edit.back_label}</Typography>
                  {user.backImage && user.backImage.length > 0 && <IconButton onClick={handleBackImageClear}><CloseIcon /></IconButton>}
                </Stack>
                <ImageUpload imageUrl={user.backImage} imageUpload={handleBackImageChange} />
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      }

      {selectedTab === 2 &&
        <Grid container spacing={2}>
          <Grid size={12}>
            <Stack direction={'row'} spacing={2} sx={{py:0}} alignItems="center" justifyContent={'start'}>
              <IconButton onClick={handleNewBeneficiary}><AddIcon /></IconButton>
            </Stack>
          </Grid>
          <Grid size={12}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
            <DataGrid
              rows={user.beneficiaries}
              columns={columns}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                  },
                },
              }}
              pageSizeOptions={[10, 25]}
              getRowId={(row) => row.id}
              sx={{    
                '& .primaryBackground--header': {
                  backgroundColor: 'rgb(5,46,37)',
                  '--DataGrid-containerBackground' : 'rgb(5,46,37)',
                  '--DataGrid-pinnedBackground' : 'rgb(5,46,37)'
                },
              }}
            />
            </div>
          </Grid>
        </Grid>
      }

      <BeneficiaryModal open={beneficiaryModalOpen} onClose={setBeneficiaryModalOpen} beneficiary={selectedBeneficiary} saveBeneficiary={handleSaveBeneficiary} deleteBeneficiary={handleDeleteBeneficiary}/>
    </>
  );
};

export default KYC;
