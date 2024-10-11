'use server';
import Parser from 'rss-parser';

const parser = new Parser();

export const getFeed = async () => {
  const feed = await parser.parseURL('https://www.xucre.net/blog-feed.xml');
  return JSON.parse(JSON.stringify(feed.items));
}