'use client'

import { Box, Button, Stack, Typography, useTheme, Tab } from "@mui/material";
import {TabContext, TabList, TabPanel} from '@mui/lab';
import React, { useState } from "react";
import { useAccount } from "wagmi";
import Snackbar from '@mui/material/Snackbar';
import LoadingComponent from "@/components/ui/loadingComponent";
import ResultsList from "./resultsList";
import { SourceList } from "@/service/types";
import OpaqueCard from "@/components/ui/OpaqueCard";
import { polygonCoins } from '@/data';

const ETFBuilder: React.FC = () => {
  const [tabValue, setTabValue] = React.useState('loading' as 'loading' | 'results' | 'walletHistory' | 'tokenHistory');
  const {address} = useAccount();
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState('edit' as 'draft' | 'generating' | 'edit' );
  const [loadingText, setLoadingText] = useState("");
  //const [generatedData, setGeneratedData] = useState(JSON.stringify(polygonCoins));
  const theme = useTheme();

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setTabValue(newValue as 'loading' | 'results' | 'walletHistory' | 'tokenHistory');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Investing Philosophy Summary:", summary);
    // Add submit logic here
    //setSummary(summary);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  }

  const handleRefresh = () => {
    setStatus('draft');
    setSummary('');
    //setGeneratedData('');
    setTabValue('loading');
  }

  return (
    <Box width={'55vw'}>
        {status !== 'draft' && 
          <OpaqueCard sx={{mt:2}} >
              {/* {generatedData.length === 0 && 
                <Box>
                <Typography variant={'h6'} textAlign={'center'} sx={{pb:2}}>{loadingText}</Typography>
                <LoadingComponent />
                </Box>
              } */}
              { 
                <Box>
                  <ResultsList refresh={handleRefresh} source={{tokens:polygonCoins} as SourceList}/>
                </Box>            
              }
          </OpaqueCard>
        }

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message="Error"
          action={error}
        />
    </Box>
    
  );
};

export default ETFBuilder;