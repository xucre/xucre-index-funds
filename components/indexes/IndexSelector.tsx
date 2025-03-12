'use client'
import { useLanguage } from "@/hooks/useLanguage";
import { Box, Chip, IconButton, MenuItem, Select, Stack, Typography, useTheme } from "@mui/material"
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
//import AccountButton from "./accountButton";
//import { useRouter } from "next/navigation";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getTextColor } from "@/service/helpers";
import { toTitleCase } from '../../service/helpers';
import { useSFDC } from "@/hooks/useSFDC";
import { IndexFund, ToleranceLevels } from "@/service/types";
import { useClerkUser } from "@/hooks/useClerkUser";
// components/LoadingIndicator.tsx

export default function IndexSelector({fundList}: {fundList: IndexFund[]}) {
    const theme = useTheme();
    const router = useRouter();
    const textColor = getTextColor(theme);
    const { user} = useClerkUser();
    const { language, languageData } = useLanguage();
    const [selectedFund, setSelectedFund] = useState<IndexFund | undefined>(undefined);

    const pathname = usePathname();

    const selectComponent = (id: string) => {
        const fund = fundList.find((fund) => fund.id === id);
        setSelectedFund(fund);
        router.push(`/indexes/${id.toString()}`);
    }

    useEffect(() => {
        if (pathname && fundList) {
            const id = pathname.split('/').pop();
            console.log('pathid',id);
            if (id) {
                const fund = fundList.find((fund) => fund.id === id);
                console.log(fund);
                if (!fund) setSelectedFund(fundList[0]);
                if (fund) setSelectedFund(fund);
            } 

        }
    }, [pathname, fundList]);
    return (
        <Stack direction={'row'} spacing={5} mt={4} mx={5}>
            <Select value={selectedFund?.id || ''} onChange={(e) => selectComponent(e.target.value)}>
                {fundList.map((fund) => (
                    <MenuItem key={fund.id} value={fund.id}>
                        {fund.name[language]}
                    </MenuItem>
                ))}
            </Select>
        </Stack>
        
    );
};
