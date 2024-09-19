'use client';
import { Suspense } from 'react';
//import type { NextPage } from 'next';
import Widget from '../../components/widget';
/*import dynamic from 'next/dynamic';
import { LoadingIndicator } from '../LoadingIndicator';

const LiFiWidgetNext = dynamic(
  () => import('../../components/widget'),
  {
    ssr: true,
    loading: () => <LoadingIndicator />,
  },
);



export default function Swap() {
  return <LiFiWidgetNext />;
};*/
export default function Swap() {
  return <Suspense><Widget /></Suspense>;
}