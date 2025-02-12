'use client';
import React from 'react';
import { normalizeDevChains } from '@/service/helpers';
import { getTokenList } from '@/service/lambda';
import { useEffect, useMemo, useState } from 'react';
import { Token, TokenListResponse } from '@/service/types';



const TokenListContext = React.createContext({ tokens: [] } as TokenListResponse);

export const useTokenList = ({ }) => React.useContext(TokenListContext);

export function TokenListProvider({ children, chainId }: { children: any, chainId?: number }) {
  const [tokens, setTokens] = useState([] as Token[]);

  const getTokens = async () => {
    if (!chainId) return;
    const dataRaw = await getTokenList(chainId);
    const data: Token[] = dataRaw.tokens;
    const _chainId = normalizeDevChains(chainId);
    const filteredData = data.filter((token) => token.chainId === _chainId);
    setTokens(filteredData);
  }

  useEffect(() => {
    if (chainId) {
      getTokens();
    }
  }, [chainId]);

  const value = useMemo(
    () => ({ tokens } as TokenListResponse),
    [tokens],
  );

  return <TokenListContext.Provider value={value}>{children}</TokenListContext.Provider>;
}

export function useTokenListRaw({ chainId }: { chainId?: number }) {
  const [tokens, setTokens] = useState([] as Token[]);

  const getTokens = async () => {
    if (!chainId) return;
    const dataRaw = await getTokenList(chainId);
    const data: Token[] = dataRaw.tokens;
    const _chainId = normalizeDevChains(chainId);
    const filteredData = data.filter((token) => token.chainId === _chainId);
    setTokens(filteredData);
  }

  useEffect(() => {
    if (chainId) {
      getTokens();
    }
  }, [chainId]);

  const value = useMemo(
    () => ({ tokens } as TokenListResponse),
    [tokens],
  );

  return value;
}