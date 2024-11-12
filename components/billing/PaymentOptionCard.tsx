import React from 'react';
import { Card, CardActionArea, CardMedia, CardContent, Typography } from '@mui/material';
import { PaymentOption, PaymentOptionProps } from '@/service/types';



const PaymentOptionCard: React.FC<PaymentOptionProps> = ({ option, openProvider }) => {
  return (
    <Card key={option.id}>
        <CardActionArea onClick={() => openProvider(option.id)}>
        <CardMedia
            component="img"
            height="140"
            image={option.image}
            alt={option.id}
            sx={{backgroundColor: option.color, objectFit: 'contain', padding: 5}}
        />
        <CardContent>
            <Typography variant="body2" color="text.secondary">
            Available in: {option.countries.join(', ')}
            </Typography>
        </CardContent>
        </CardActionArea>
    </Card>
  );
};

export default PaymentOptionCard;
