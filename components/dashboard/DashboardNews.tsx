'use client'
import { useLanguage } from "@/hooks/useLanguage";
import { getTextColor } from "@/service/helpers";
import { getFeed } from "@/service/rss";
import { Link, Paper, Stack, Typography, useMediaQuery, useTheme } from "@mui/material"
import { useEffect, useState } from "react";
import DashboardNewsCard from "./DashboardNewsCard";
//import AccountButton from "./accountButton";
import dayjs from 'dayjs';

export interface NewsItem {
  title: string;
  content: string;
  link: string;
  isoDate: string;
}
// components/LoadingIndicator.tsx
export default function DashboardNews() {
  const theme = useTheme();
  const { language } = useLanguage();
  const matches = useMediaQuery(theme.breakpoints.up('sm'));
  const textColor = getTextColor(theme);
  const [news, setNews] = useState([] as NewsItem[]);

  const refresh = async () => {
    const feed = await getFeed();
    setNews(feed);
  }

  useEffect(() => {
    refresh();
  }, [])
  const newsList = news.length < 4 ? news : news.slice(0, 3);
  return (
    <Stack direction={'column'} spacing={2} pt={0}>
      {/*<Typography variant={'h6'} color={textColor}>News</Typography>*/}
      {news.length > 0 &&
        newsList.map((item, index) => (
          <DashboardNewsCard key={index} publishDate={dayjs(item.isoDate).format('DD/MM/YYYY')} title={item.title} text={item.content} url={item.link} />
        ))
      }
    </Stack>
  );
};
