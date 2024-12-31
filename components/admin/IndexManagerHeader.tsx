import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Button, IconButton, ListItemButton, Stack } from '@mui/material';
import { delFundDetails, getAllFunds, getFundDetails, setFundDetails } from '@/service/db';
import { v4 as uuidv4 } from 'uuid';
import { IndexFund } from '@/service/types';
import { useLanguage } from '@/hooks/useLanguage';
import { useParams, useRouter } from 'next/navigation';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { globalChainId } from '@/service/constants';

const IndexManagerHeader = () => {
    const router = useRouter();
    const {language} = useLanguage();
    const [funds, setFunds] = useState([] as IndexFund[]);
    const params = useParams();
    const fundId = params['id'] as string;

    useEffect(() => {
        const fetchFunds = async () => {
        const fundIds = await getAllFunds(globalChainId);
        const fundDetails = await Promise.all(
            fundIds.map(async (id) => {
                const details = await getFundDetails(globalChainId, id);
                return { id, ...details };
            })
        );
        setFunds(fundDetails);
        };
        fetchFunds();
    }, []);

    const createNewFund = async () => {
        const newFundId = uuidv4();
        const placeholderFund: IndexFund = {
            id: newFundId,
            name: { 0: 'New Fund', 1: '', 2: '' },
            cardSubtitle: { 0: 'New Fund', 1: '', 2: '' },
            description: { 0: 'New Fund', 1: '', 2: '' },
            image: '',
            imageSmall: '',
            color: '',
            chainId: 0,
            custom: undefined,
            sourceToken: undefined,
            portfolio: []
        };
        await setFundDetails(globalChainId, newFundId, placeholderFund);
        setFunds([...funds, placeholderFund]);
    };

    return (

        <Stack direction={'row'} spacing={2} justifyContent={'space-between'} alignItems={'center'}>
            {fundId && fundId.length > 0 &&
              <IconButton onClick={() => router.push('/index-manager')}><ArrowBackIcon /></IconButton>
            }
            <Button onClick={createNewFund}>Create New Fund</Button>
        </Stack>
    );
};

export default IndexManagerHeader;
