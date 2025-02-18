'use client'
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getTextColor } from "@/service/theme";
import { Typography, useTheme, Card, CardContent, Button, Grid2 } from "@mui/material";
import { Box, Stack } from "@mui/material"
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import Campfire from "@/components/campfire";
import { useLanguage } from "@/hooks/useLanguage";
import { chainValidation } from "@/service/helpers";
import { globalChainId } from "@/service/constants";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Grid } from "react-loader-spinner";

interface FeatureItem {
  name: string;
  description: string;
  endpoint: string;
}

const features: FeatureItem[] = [
  {
    name: "Superfund",
    description: "The superfund is a feature that allows you to create a fund from a much larger list.",
    endpoint: "/features/superfund",
  },
  {
    name: "Chat",
    description: "The chat feature allows you to chat with our different agents.",
    endpoint: "/features/chat",
  },
  {
    name: "Agent Builder",
    description: "This is a feature that allows you to build your own agent.",
    endpoint: "/features/agent-builder",
  }
];

export default function Feature() {
  const theme = useTheme();
  const textColor = getTextColor(theme);
  const router = useRouter();
  const { language } = useLanguage();
  const [isLocked, setIsLocked] = useState(true);
  const { isSuperAdmin } = useIsAdmin();

  useEffect(() => {
    if (isSuperAdmin) {
      setIsLocked(false);
    }
  }, [isSuperAdmin]);

  if (isLocked) {
    return <Campfire setIsLocked={(locked) => {return}} />;
  }
  return (
    <Box pb={4} maxWidth={'100%'}>
      <Stack spacing={4}>
        <Stack justifyContent={'center'} alignItems={'center'}>
          <Typography variant={'h6'} color={textColor}>
            In dev Features
          </Typography>
        </Stack>
        <Grid2 container spacing={2} padding={2}>
          {features.map((feature, index) => (
            <Grid2 key={index} size={'auto'}>
              <Card variant="outlined" sx={{bgcolor: theme.palette.background.default, maxWidth: 400}}>
                <CardContent >
                  <Typography variant="h6" gutterBottom>
                    {feature.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {feature.description}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => router.push(feature.endpoint)}
                  >
                    Go to {feature.name}
                  </Button>
                </CardContent>
              </Card>
            </Grid2>
          ))}
        </Grid2>
      </Stack>
    </Box>
  );
}