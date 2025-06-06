
import { getUser, upsertUserDetails } from '@/service/sfdc';
import { SFDCUserData } from '@/service/types';
import { useSnackbar } from 'notistack';
import React, { useEffect, useMemo } from 'react';
import { useLanguage } from './useLanguage';
import languageData from '@/metadata/translations'
import { useTheme } from '@mui/material';
import { getUserDetails, setUserDetails } from '@/service/db';
import { useClerkUser } from './useClerkUser';
const defaultContext = { sfdcUser: {} as SFDCUserData, updateUser: (user: SFDCUserData) => { }, refresh: () => { }, isLoaded: false, hasOnboarded: false };
const SFDCContext = React.createContext(defaultContext);

export const useSFDC = () => React.useContext(SFDCContext);

export const SFDCProvider = ({ children }: { children: any }) => {
  const { user, organization } = useClerkUser();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { language } = useLanguage();
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [sfdcUser, setSfdcUser] = React.useState({} as SFDCUserData);
  const hasOnboarded = sfdcUser.onboardingStatus === 'complete';

  const refresh = async () => {
    if (!user) return;
    //const org = user?.organizationMemberships?.length > 0 ? user?.organizationMemberships[0].id : '';
    const response = await getUserDetails(user.id);
    if (response && response.userEmail) {
      setSfdcUser({
        ...response, 
        organizationId: response.organizationId ? response.organizationId : user.organizationMemberships.length > 0 ? user.organizationMemberships[0].organization.id : '',
        beneficiaries: response.beneficiaries || [],
      });
    } else {
      const newUser = {
        riskTolerance: '',
        salaryContribution: 0,
        userEmail: user.emailAddresses[0].emailAddress,
        userId: user.id,
        role: 'User',
        organizationId: user.organizationMemberships.length > 0 ? user.organizationMemberships[0].organization.id : '',
        status: 'Active',
        wallets: [],
        firstName: user.firstName || '',
        middleName: '',
        lastName: user.lastName || '',
        address: '',
        street: '',
        street2: '',
        city: '',
        province: '',
        postalCode: '',
        country: '',
        idCardNumber: '',
        idExpirationDate: '',
        idIssueDate: '',
        frontImage: '',
        backImage: '',
        placeId: '',
        beneficiaries: [],
      } as SFDCUserData;
      await setUserDetails(user.id, newUser);
      setSfdcUser(newUser);
      
    }
  }

  const updateUser = async (user2: SFDCUserData) => {
    try {
      //console.log('updating user');
      setIsLoaded(false);
      await upsertUserDetails({...user2, organizationName: organization?.name || ''});
      await setUserDetails(user2.userId, user2);
      enqueueSnackbar(`${languageData[language].ui.profile_saved}`, { variant: 'success', autoHideDuration: 2000 });
      setSfdcUser((prev) => ({ ...prev, ...user2 }));
      setIsLoaded(true);
      //await refresh();
    } catch (err) {
      enqueueSnackbar(`${languageData[language].ui.error}`, { variant: 'error', autoHideDuration: 5000 });
      setIsLoaded(true);
    }

  };

  useEffect(() => {
    if (!user) return;
    try {
      setIsLoaded(true);
      refresh();
    } catch (err) {
      console.error(err);
    }
    //refresh();
  }, [user])
  const rawValue = { sfdcUser , updateUser, refresh, isLoaded, hasOnboarded };
  const value = useMemo(() => (rawValue), [sfdcUser, isLoaded, hasOnboarded]);
  
  return <SFDCContext.Provider value={value}>{children}</SFDCContext.Provider>;
};