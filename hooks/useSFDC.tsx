import { getUser, upsertUserDetails } from '@/service/sfdc';
import { SFDCUserData } from '@/service/types';
import { useUser } from '@clerk/nextjs';
import { useSnackbar } from 'notistack';
import React, { useEffect, useMemo } from 'react';
import { useLanguage } from './useLanguage';
import languageData from '@/metadata/translations'
import { useTheme } from '@mui/material';

const SFDCContext = React.createContext({ sfdcUser: {} as SFDCUserData, updateUser: (user: SFDCUserData) => { }, refresh: () => { }, isLoaded: false });

export const useSFDC = () => React.useContext(SFDCContext);

export const SFDCProvider = ({ children }: { children: any }) => {
  const { user } = useUser();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { language } = useLanguage();
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [sfdcUser, setSfdcUser] = React.useState(null as SFDCUserData | null);


  const refresh = async () => {
    const org = user?.organizationMemberships?.length > 0 ? user?.organizationMemberships[0].id : '';
    const response = await getUser(org, user.id);
    setSfdcUser(response);
    setIsLoaded(true);
  }

  const updateUser = async (user: SFDCUserData) => {
    try {
      setIsLoaded(false);
      await upsertUserDetails(user);
      enqueueSnackbar(`${languageData[language].ui.transaction_successful}:`, { variant: 'success', autoHideDuration: 5000 });
      await refresh();
    } catch (err) {
      enqueueSnackbar(`${languageData[language].ui.error}:`, { variant: 'error', autoHideDuration: 5000 });
      setIsLoaded(true);
    }

  };


  useEffect(() => {
    if (!user) return;
    try {
      refresh();
    } catch (err) {
      console.error(err);
    }
    //refresh();
  }, [user])

  const value = useMemo(() => ({ sfdcUser, updateUser, refresh, isLoaded }), [sfdcUser]);

  return <SFDCContext.Provider value={value}>{children}</SFDCContext.Provider>;
};