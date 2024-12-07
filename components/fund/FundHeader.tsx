'use client'
import { useLanguage } from "@/hooks/useLanguage";
import { Box, Chip, IconButton, Stack, Typography, useTheme } from "@mui/material"
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
//import AccountButton from "./accountButton";
//import { useRouter } from "next/navigation";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getTextColor } from "@/service/helpers";
import { toTitleCase } from '../../service/helpers';
import { useUser } from "@clerk/nextjs";
import { useSFDC } from "@/hooks/useSFDC";
import { ToleranceLevels } from "@/service/types";
// components/LoadingIndicator.tsx

export default function FundHeader() {
    const theme = useTheme();
    const router = useRouter();
    const textColor = getTextColor(theme);
    const { language, languageData } = useLanguage();
    const {sfdcUser, updateUser, isLoaded, refresh} = useSFDC();
    const { user } = useUser();
    const pathname = usePathname();
    const [tolerance, setTolerance] = useState(ToleranceLevels.Moderate);
    const isConservative = tolerance === 'Conservative';
    const isModerate = tolerance === 'Moderate';
    const isAggressive = tolerance === 'Aggressive';
    const toleranceMatch = sfdcUser.riskTolerance as ToleranceLevels === tolerance;

    const selectComponent = (type: ToleranceLevels) => {
        setTolerance(type);
        router.push(`/fund/${type.toString()}`);
    }

    useEffect(() => {
        if (!isLoaded) return;
        if (!sfdcUser.riskTolerance) return;
        if (pathname === '/fund') {
            setTolerance(sfdcUser.riskTolerance as ToleranceLevels);
        }
    }, [sfdcUser, pathname]);

    useEffect(() => {
        if (pathname) {
            const tolerance = pathname.split('/').pop();
            if (tolerance) {
                setTolerance(tolerance as ToleranceLevels);
            }
        }
    }, [pathname]);
    return (
        <Stack direction={'row'} justifyContent={'center'} alignItems={'center'} my={4} px={0} mb={2} spacing={2}>
            <Chip label={languageData[language].Edit.risk_conservative} onClick={() => {selectComponent(ToleranceLevels.Conservative)}} sx={{ bgcolor: isConservative ? '#00872a' : '', fontSize: isConservative ? 18 : 16, fontWeight: isConservative ? 'bold' : '', py: 2, px: 1 }} />
            <Chip label={languageData[language].Edit.risk_moderate} onClick={() => {selectComponent(ToleranceLevels.Moderate)}} sx={{ bgcolor: isModerate ? '#00872a' : '', fontSize: isModerate ? 18 : 14, fontWeight: isModerate ? 'bold' : '', py: 2, px: 1 }} />
            <Chip label={languageData[language].Edit.risk_aggressive} onClick={() => {selectComponent(ToleranceLevels.Aggressive)}} sx={{ bgcolor: isAggressive ? '#00872a' : '', fontSize: isAggressive ? 18 : 16, fontWeight: isAggressive ? 'bold' : '', py: 2, px: 1 }} />
            {!toleranceMatch && tolerance && <IconButton onClick={() => updateUser({ ...sfdcUser, riskTolerance: tolerance.toString() })} sx={{ bgcolor: '#00872a', color: 'white' }}><SaveIcon /></IconButton>}
        </Stack>
    );
};
