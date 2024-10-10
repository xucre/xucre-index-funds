'use server';
import Parser from 'rss-parser';

type CustomFeed = {foo: string};
type CustomItem = {bar: number};

const parser = new Parser();

export const getFeed = async () => {
  const feed = await parser.parseURL('https://www.xucre.net/blog-feed.xml');
  return JSON.parse(JSON.stringify(feed.items));
}