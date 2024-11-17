import { getUser, upsertUserDetails } from '@/service/sfdc';
import { SFDCUserData } from '@/service/types';
import { useUser } from '@clerk/nextjs';
import { useSnackbar } from 'notistack';
import React, { useEffect, useMemo } from 'react';
import { useLanguage } from './useLanguage';
import languageData from '@/metadata/translations'
import { useTheme } from '@mui/material';
import { getUserDetails, setUserDetails } from '@/service/db';
const defaultContext = { sfdcUser: {} as SFDCUserData, updateUser: (user: SFDCUserData) => { }, refresh: () => { }, isLoaded: false };
const SFDCContext = React.createContext(defaultContext);

export const useSFDC = () => React.useContext(SFDCContext);

export const SFDCProvider = ({ children }: { children: any }) => {
  const { user } = useUser();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { language } = useLanguage();
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [sfdcUser, setSfdcUser] = React.useState({} as SFDCUserData);


  const refresh = async () => {
    if (!user) return;
    const org = user?.organizationMemberships?.length > 0 ? user?.organizationMemberships[0].id : '';
    const response = await getUserDetails(user.id);
    if (response && response.firstName) setSfdcUser(response);
    if (!response) setSfdcUser({
      riskTolerance: '',
      salaryContribution: 0,
      userEmail: user.emailAddresses[0].emailAddress,
      userId: user.id,
      role: 'User',
      organizationId: user.organizationMemberships[0].organization.id,
      status: 'Active',
      wallets: [],
      firstName: user.firstName || '',
      middleName: '',
      lastName: user.lastName || '',
      address: '',
      idCardNumber: '',
      idExpirationDate: '',
      frontImage: '',
      backImage: '',
      placeId: ''
    } as SFDCUserData);
    setIsLoaded(true);
  }

  const updateUser = async (user2: SFDCUserData) => {
    try {
      setIsLoaded(false);
      console.log('updateUser', user2);
      await upsertUserDetails(user2);
      await setUserDetails(user2.userId, user2);
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

  const value = useMemo(() => ({ sfdcUser , updateUser, refresh, isLoaded }), [sfdcUser]);

  return <SFDCContext.Provider value={!value ? defaultContext : value}>{children}</SFDCContext.Provider>;
};