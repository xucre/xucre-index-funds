'use client'
import { useLanguage } from "@/hooks/useLanguage";
import { playStoreAddress } from "@/service/constants";
import { getTextColor } from "@/service/helpers";
import { getFeed } from "@/service/rss";
import { Avatar, Box, CircularProgress, Fab, Grid, Link, Stack, Typography, useMediaQuery, useTheme } from "@mui/material"
import { useEffect, useState } from "react";
//import AccountButton from "./accountButton";

// components/LoadingIndicator.tsx
export default function DashboardNews() {
  const theme = useTheme();
  const { language } = useLanguage();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  const textColor = getTextColor(theme);
  const [news, setNews] = useState([]);

  const refresh = async () => {
    const feed = await getFeed();

    setNews(feed);
  }

  useEffect(() => {
    refresh();
  }, [])
  const newsList = news.length < 4 ? news : news.slice(0, 3);
  return (
    <Stack direction={'column'} spacing={2}>
      <Typography variant={'h6'} textAlign={'center'}>Xucre News</Typography>
      {news.length > 0 &&
        newsList.map((item, index) => (
          <Link key={index} href={'#'} underline="hover" color={textColor}>
            <Typography variant={'subtitle1'} color={textColor}>{item.title}</Typography>
          </Link>
        ))
      }
    </Stack>
  );
};
