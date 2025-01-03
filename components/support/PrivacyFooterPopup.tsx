import React, { useEffect, useState } from 'react';
import { Alert, AlertTitle, Button, Link, Snackbar } from '@mui/material';
import { useLanguage } from '@/hooks/useLanguage';

const POLICY_ACCEPTANCE_KEY = 'xucre_privacy_accepted';

const PrivacyFooterPopup: React.FC = () => {
  const [open, setOpen] = useState(false);
  const {language, languageData} = useLanguage();
  useEffect(() => {
    localStorage.setItem(POLICY_ACCEPTANCE_KEY, 'false');
    const accepted = localStorage.getItem(POLICY_ACCEPTANCE_KEY);
    if (accepted !== 'true') {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(POLICY_ACCEPTANCE_KEY, 'true');
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ bottom: 0, color: 'white' }}
    >
      <Alert
        severity="warning"
        variant="filled"
        sx={{alignItems: 'center', color: 'white'}}
        action={
          <Button color="inherit" size="small" onClick={handleAccept}>
            {languageData[language].Privacy.accept_button}
          </Button>
        }
      >
        <AlertTitle><Link href={'/privacy'} sx={{color:'inherit', textDecorationColor: 'white'}}>{languageData[language].Privacy.title}</Link></AlertTitle>
        {languageData[language].Privacy.description}
      </Alert>
    </Snackbar>
  );
};

export default PrivacyFooterPopup;