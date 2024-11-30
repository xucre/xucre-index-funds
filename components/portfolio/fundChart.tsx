'use client'
import * as React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { PortfolioItem, PriceData } from '@/service/types';
import { useEffect, useState } from 'react';

const colorSet = ['#182158', '#103D50', '#2D1657', '#D4E815', '#FFA000'];


export default function FundChart({ prices, portfolio }: { prices: PriceData[], portfolio: PortfolioItem[] }) {
  const [priceData, setPriceData] = useState([] as any[]);
  const [priceSymbols, setPriceSymbols] = useState({} as { [key: string]: string });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Convert the prices to the format that the chart expects.
    const _priceSymbols = prices.reduce((acc, price) => {
      return { ...acc, [price.address.toLowerCase()]: price.symbol }
    }, {});
    const _priceWeights = portfolio.reduce((acc, item) => {
      return { ...acc, [item.address.toLowerCase()]: item.weight }
    }, {});

    const _firstPrice = prices.reduce((acc, price) => {
      const first = price.items[0];
      return { ...acc, [price.address.toLowerCase()]: first.price }
    }, {})
    const _priceData = prices.reduce((acc, _prices) => {
      if (acc.length === 0) {
        return _prices.items.map((item) => {
          return {
            date: new Date(item.date),
            [_prices.symbol.toLowerCase()]: item.price * _priceWeights[_prices.address.toLowerCase()] * .0001
          }
        })
      }
      const newPriceData = acc.map((item : object, index) => {
        if (typeof item === 'object' && item !== null) {
          return {
            ...item,
            [_prices.symbol.toLowerCase()]: _prices.items[index].price * _priceWeights[_prices.address.toLowerCase()] * .0001
          }
        }
        return item;
      });
      return newPriceData;
    }, []);
    setPriceSymbols(_priceSymbols);
    setPriceData(_priceData);
    setLoading(false);
  }, [prices])
  const series = Object.values(priceSymbols).map((item, i) => {
    const portfolioItem = portfolio.find((p) => p.name.toLowerCase() === item.toLowerCase());
    return {
      id: item,
      label: item,
      dataKey: item.toLowerCase(),
      stack: 'total',
      color: portfolioItem ? portfolioItem.chartColor || colorSet[i] : colorSet[i],
      area: true,
      showMark: false,
    }
  });


  if (loading) return <div>...</div>

  return (
    <LineChart
      dataset={priceData}
      xAxis={[
        {
          id: 'Years',
          dataKey: 'date',
          scaleType: 'time',
          valueFormatter: (date) => date.toLocaleDateString(),
        },
      ]}
      series={
        series
      }
      width={600}
      height={400}
      margin={{ left: 70 }}
    />
  );
}
