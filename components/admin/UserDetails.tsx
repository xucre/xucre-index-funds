import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { OrganizationUserData, SFDCUserData } from '@/service/types';
import { getSafeAddress, getUserDetails } from '@/service/db';

const UserDetails: React.FC<OrganizationUserData> = (user) => {
    const [userData, setUserData] = useState<SFDCUserData | null>(null);
    const [safeWallet, setSafeWallet] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUserDetails() {
            const data = await getUserDetails(user.id);
            setUserData(data);
            const walletAddress = await getSafeAddress(user.id);
            setSafeWallet(walletAddress);
        }
        fetchUserDetails();
    }, [user]);

    if (!userData) {
        return null;
    }

    return (
        <Card variant="outlined" sx={{ backgroundColor: 'transparent' }}>
            <CardContent>
                <Typography variant="h5">
                    {userData.firstName} {userData.lastName}
                </Typography>
                <Typography color="textSecondary">{user.emailAddress}</Typography>
                <Typography color="textSecondary">ID: {user.id}</Typography>
                <Typography color="textSecondary">Role: {userData.role}</Typography>
                <Typography color="textSecondary">Risk Tolerance: {userData.riskTolerance}</Typography>
                <Typography color="textSecondary">Status: {userData.status}</Typography>
                <Typography color="textSecondary">Organization ID: {userData.organizationId}</Typography>
                <Typography color="textSecondary">Salary Contribution: {userData.salaryContribution}</Typography>
                <Typography color="textSecondary">Address: {userData.address}</Typography>
                <Typography color="textSecondary">ID Card Number: {userData.idCardNumber}</Typography>
                <Typography color="textSecondary">Safe Wallet: {safeWallet}</Typography>
            </CardContent>
        </Card>
    );
};

export default UserDetails;