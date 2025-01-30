'use client'

import React, { useState, useEffect } from 'react';
import { Stack, Typography, Chip, Skeleton, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { isNull } from 'lodash';
import { useClerkOrganization } from '@/hooks/useClerkOrganization';
import { getTextColor } from "@/service/theme";
import { useLanguage } from '@/hooks/useLanguage';
import { OrganizationSettings } from '@/service/types';
import { getOrganizationSettings, setOrganizationSettings } from '@/service/db';

interface EditOrganizationSettingsProps {
  direction?: 'column' | 'row';
  showOpaqueCard?: boolean;
  saveType?: 'save' | 'next';
  showPrevious?: boolean;
  setStep?: (stepUpdater: (prev: number) => number) => {};
}

const EditOrganizationSettings: React.FC<EditOrganizationSettingsProps> = ({
  direction = 'column',
  showOpaqueCard = false,
  saveType = 'save',
  showPrevious = false,
  setStep = (stepUpdater: (prev: number) => number) => {},
}) => {
  const theme = useTheme();
  const textColor = getTextColor(theme);
  const { language, languageData } = useLanguage();

  const { organization, isLoaded } = useClerkOrganization();

  const [modifiedSettings, setModifiedSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch existing organization settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!organization || !organization.id) return;
      const existing = await getOrganizationSettings(organization.id);
      // If nothing found, initialize defaults
      if (!existing) {
        setModifiedSettings({
          organizationId: organization.id,
          matchType: 'none',
          employerContribution: 0,
        });
      } else {
        setModifiedSettings(existing);
      }
      setLoading(false);
    };

    if (isLoaded && organization?.id) {
      fetchSettings();
    }
  }, [organization, isLoaded]);

  const handleSaveSettings = async () => {
    if (!organization || !modifiedSettings) return;
    // Save updated settings
    await setOrganizationSettings(organization.id, {
      ...modifiedSettings,
      organizationId: organization.id,
    });

    if (saveType === 'next') {
      setStep((prev: number) => prev + 1);
    }
  };

  const goBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleChange = (field: keyof OrganizationSettings, value: string | number) => {
    if (!modifiedSettings) return;
    setModifiedSettings({ ...modifiedSettings, [field]: value });
  };

  const isSettingsComplete = modifiedSettings && !isNull(modifiedSettings.matchType) && !isNull(modifiedSettings.employerContribution);

  if (loading || !modifiedSettings) return <Skeleton variant="rounded" width="100%" height={200} />;

  return (
    <Stack
      sx={{
        px: showOpaqueCard ? 0 : 4,
        py: 2,
        '& .MuiPaper-root': { width: '--webkit-fill-available' },
      }}
      width={'--webkit-fill-available'}
      minHeight={direction === 'column' ? 0 : '50vh'}
      direction={'column'}
      justifyContent={'space-between'}
      useFlexGap
    >
      <>
        <Typography fontWeight={'bold'} color={textColor}>
          {languageData[language].Edit?.organization_settings || 'Organization Settings'}
        </Typography>
        <Stack
          direction={direction}
          spacing={direction === 'column' ? 2 : 5}
          justifyContent={direction === 'column' ? 'space-between' : 'space-between'}
          alignItems={'center'}
          my={direction === 'column' ? 2 : 5}
          width="100%"
        >
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="match-type-label">Match Type</InputLabel>
            <Select
              labelId="match-type-label"
              label="Match Type"
              value={modifiedSettings.matchType}
              onChange={(e) => handleChange('matchType', e.target.value)}
            >
              <MenuItem value="none">None</MenuItem>
              <MenuItem value="fixed">Fixed</MenuItem>
              <MenuItem value="percentage">Percentage</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Employer Contribution"
            type="number"
            value={modifiedSettings.employerContribution}
            onChange={(e) => handleChange('employerContribution', Number(e.target.value))}
            sx={{ width: 200 }}
          />
        </Stack>
      </>
      <Stack
        direction={'row'}
        spacing={2}
        justifyContent={showPrevious ? 'space-between' : 'flex-end'}
        alignItems={'center'}
        mt={5}
      >
        {showPrevious && (
          <Chip
            label={languageData[language].ui?.previous || 'Previous'}
            onClick={goBack}
            color={'default'}
            sx={{
              fontSize: 18,
              fontWeight: 'bold',
              py: 2.5,
              px: 10,
              borderRadius: 25,
              mt: 3,
            }}
          />
        )}
        <Chip
          label={
            saveType === 'save'
              ? languageData[language].Edit?.save || 'Save'
              : languageData[language].ui?.next || 'Next'
          }
          onClick={handleSaveSettings}
          disabled={!isSettingsComplete}
          color={'primary'}
          sx={{
            fontSize: 18,
            fontWeight: 'bold',
            py: 2.5,
            px: 10,
            borderRadius: 25,
            mt: 3,
          }}
        />
      </Stack>
    </Stack>
  );
};

export default EditOrganizationSettings;