import { useLanguage } from "@/hooks/useLanguage";
import { Box, Typography, Button } from "@mui/material";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function EmptyFundDetailState ({ onCreateData }) {
    const {language}= useLanguage();
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        textAlign="center"
        height="100%"
        p={4}
      >
        <AccountCircleIcon color="action" fontSize="large" />
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          No Fund Selected
          {/* {languageData[language as Language].Onboarding.empty_profile} */}
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Please select a fund to view details. 
          {/* {languageData[language as Language].Onboarding.empty_profile_description} */}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          onClick={onCreateData}
        >
          Create New Fund
          {/* {languageData[language as Language].Onboarding.create_profile} */}
        </Button>
      </Box>
    );
};