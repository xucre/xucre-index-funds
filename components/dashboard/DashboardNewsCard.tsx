import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import { ArrowForward, KeyboardArrowRight } from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import { getTextColor } from '@/service/theme';
import { CardHeader, Link } from '@mui/material';
import OpaqueCard from '../ui/OpaqueCard';

const DashboardNewsCard = ({ title, text, publishDate, url }) => {
  const theme = useTheme();
  const textColor = getTextColor(theme);
  return (
    <OpaqueCard>
      <CardHeader sx={{ py: 1, mb: 0 }} title={<Typography variant="body1" color="text.secondary">{publishDate}</Typography>} />
      <CardContent sx={{ py: 0 }} >
        <Typography variant="body2" color={textColor}>
          {title}
        </Typography>
      </CardContent>
      {url && (
        <CardActions sx={{ display: 'flex', alignItems: 'center', justifyContent: 'end', py: 0 }}>
          <Link href={url} textTransform={'none'} underline='none' target="_blank" rel="noopener noreferrer" sx={{ color: textColor, display: 'flex', alignItems: 'center', justifyContent: 'end' }}>
            <Typography color="text.secondary" fontSize={15}>Read More </Typography><KeyboardArrowRight color="disabled" />
          </Link>
        </CardActions>
      )}
    </OpaqueCard>
  );
};

export default DashboardNewsCard;