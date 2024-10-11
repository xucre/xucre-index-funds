'use client';
import { getWalletHistory, getWalletTransactions } from '@/service/lambda';
import { useEffect, useMemo, useState } from 'react';

export type QuoteValue = { date: string; totalQuote: number; isTokenValue: boolean; }
export type HoldingBalance = {balance: number; quote: number;}
export interface ExtendedBalance extends HoldingBalance {
  timestamp?: number
}
export type Holding = {
  timestamp: string;
  quote_rate: number;
  open: HoldingBalance;
  high: HoldingBalance;
  low: HoldingBalance;
  close: HoldingBalance;
};

export type Item = {
  contract_decimals: number;
  contract_name: string;
  contract_ticker_symbol: string;
  contract_address: string;
  supports_erc: boolean;
  logo_url: string;
  holdings: Holding[];
};

export type WalletHistory = {
  error: string;
  error_message: string;
  error_code: string;
  walletAddress: string;
  updatedAt: string;
  chainId: number;
  chainName: string;
  lastModified: number;
  data: {
    address: string;
    updated_at: string;
    next_update_at: string;
    quote_currency: string;
    chain_id: number;
    chain_name: string;
    items: Item[];
  };
};

export type CovalentTransactionV3 = {
  block_signed_at: string,
  block_height: number,
  block_hash: string,
  tx_hash: string,
  successful: Boolean,
  from_address: string,
  to_address: string,
  value: string,
  pretty_value_quote: string,
  gas_metadata: {
    contract_decimals: number,
    contract_name: string,
    contract_ticker_symbol: string,
    contract_address: string,
    logo_url: string
  },
  gas_spent: string,
  pretty_gas_quote: string,
  explorers?: {
    label: string,
    url: string
  },
  dex_details?: {
    log_offset: number,
    protocol_name: string,
    protocol_address: string,
    protocol_logo_url: string,
    aggregator_name: string,
    aggregator_address: string,
    event: string,
    pair_address: string,
    pair_lp_fee_bps: number,
    lp_token_address: string,
    lp_token_ticker: string,
    lp_token_num_decimals: number,
    lp_token_name: string,
    lp_token_value: number,
    exchange_rate_usd: number,
    token_0_address: string,
    token_0_ticker: string,
    token_0_num_decimals: number,
    token_0_name: string,
    token_1_address: string,
    token_1_ticker: string,
    token_1_num_decimals: number,
    token_1_name: string,
    token_0_amount: number,
    token_0_quote_rate: number,
    token_0_usd_quote: number,
    pretty_token_0_usd_quote: string,
    token_0_logo_url: string,
    token_1_amount: number,
    token_1_quote_rate: number,
    token_1_usd_quote: number,
    pretty_token_1_usd_quote: string,
    token_1_logo_url: string,
    sender: string,
    recipient: string,
  },
  nft_sale_details?: {
    log_offset: number,
    topic0: string,
    protocol_contract_address: string,
    protocol_name: string,
    protocol_logo_url: string,
    to: string,
    from: string,
    maker: string,
    taker: string,
    token_id: number,
    collection_address: string,
    collection_name: string,
    token_address: string,
    token_name: string,
    ticker_symbol: string,
    num_decimals: number,
    contract_quote_rate: number,
    nft_token_price: number,
    nft_token_price_usd: number,
    pretty_nft_token_price_usd: string,
    nft_token_price_native: number,
    pretty_nft_token_price_native: string,
    token_count: number,
    num_token_ids_sold_per_sale: number,
    num_token_ids_sold_per_tx: number,
    num_collections_sold_per_sale: number,
    num_collections_sold_per_tx: number,
    trade_type: string,
    trade_group_type: string,

  },
  log_events?: {
    block_signed_at: string,
    block_height: number,
    tx_offset: number,
    log_offset: number,
    tx_hash: string,
    raw_log_topics: any,
    sender_contract_decimals: number,
    sender_name: string,
    sender_contract_ticker_symbol: string,
    sender_address: string,
    sender_address_label: string,
    sender_logo_url: string,
    raw_log_data: string,
  }
}

export function useWalletData({ address }: { address?: string } = {}) {
  const [transactions, setTransactions] = useState([] as CovalentTransactionV3[]);
  const [history, setHistory] = useState({} as WalletHistory);
  const [balance, setBalance] = useState(0);
  const [change, setChange] = useState(0);

  const computeTotals = async (_history: WalletHistory) => {
    const _balance = _history.data.items.reduce((acc, item) => {
      const latest = item.holdings[0];
      return acc + latest.close.quote;
    }, 0);
    setBalance(_balance);
    const _previousDayBalance = _history.data.items.reduce((acc, item) => {
      const previousDay = item.holdings[1];
      return acc + previousDay.close.quote;
    }, 0);
    const difference = _balance - _previousDayBalance;
    setChange(difference);
  }

  useEffect(() => {
    const runAsync = async () => {
      const result = (await getWalletTransactions(address, 'matic-mainnet'));
      
      if (result && result.covalent) setTransactions(result.covalent.items as CovalentTransactionV3[]);
      const result2 = await getWalletHistory(address, 'matic-mainnet');
      //console.log(result2);
      if (result2) setHistory(result2 as WalletHistory);
      if (result2) computeTotals(result2);
    }
    if (address) runAsync()
  }, [address])

  return useMemo(
    () => ({ transactions, history, balance, change }),
    [transactions, history, balance, change],
  );
}