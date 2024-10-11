'use client'
import { Autocomplete, TextField, ListItemText } from '@mui/material';
import { debounce } from '@mui/material/utils';
import { useEffect, useMemo, useState } from 'react';
import { fetchInfo } from '@/service/lambda';
import truncateEthAddress from 'truncate-eth-address'
import { Token, useTokenListRaw } from '@/hooks/useTokenList';
import { useAccount } from 'wagmi';
import { getChainNameRainbowKit } from '@/service/helpers';
import { getAddress, isAddress } from 'viem';

interface RainbowKitToken {
  name: string;
  symbol: string;
  id: string;
  website: string;
  decimals: number;
  type: string;
  explorer: string;
}

interface AutocompleteProps {
  onSelect: (token: Token | null) => void;
}
// TODO : add token logos

const TokenAutocomplete: React.FC<AutocompleteProps> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [additionalToken, setAdditionalToken] = useState<Token | null>(null);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [initialFilteredTokens, seInitialFilteredTokens] = useState<Token[]>([]);
  const { chainId } = useAccount();
  const { tokens } = useTokenListRaw({ chainId });
  useEffect(() => {
    const result = [
      ...tokens.filter(token =>
        token.name.toLowerCase().includes(query.toLowerCase()) ||
        token.symbol.toLowerCase().includes(query.toLowerCase()) //||
        //isAddressEqual(getAddress(token.address), getAddress(query))
      ),
    ];
    seInitialFilteredTokens(result);
  }, [tokens]);

  const debounceHandleSearch = useMemo(
    () => debounce((value) => {
      const _filteredTokens = [
        ...tokens.filter(token =>
          token.name.toLowerCase().includes(value.toLowerCase()) ||
          token.symbol.toLowerCase().includes(value.toLowerCase()) //||
          //isAddressEqual(getAddress(token.address), getAddress(query))
        ),
      ]
      seInitialFilteredTokens(_filteredTokens);
    }, 300),
    []
  );

  useEffect(() => {
    const filteredTokensCombined = [
      ...initialFilteredTokens,
      ...(additionalToken ? [additionalToken] : []),
    ]
    //console.log('filtered tokens', filteredTokensCombined[filteredTokensCombined.length - 1]);
    setFilteredTokens(filteredTokensCombined);
  }, [initialFilteredTokens, additionalToken]);

  const handleSelect = (token: Token) => {
    onSelect(token);
    setQuery('');
  };

  useEffect(() => {
    const debouncedFetch = debounce(async (query: string) => {
      if (query && isAddress(query)) {
        const token: RainbowKitToken = await fetchInfo(getChainNameRainbowKit(chainId), getAddress(query));
        //console.log('additional token', token);
        if (token) {
          setAdditionalToken({
            address: token.id,
            chainId: chainId,
            decimals: token.decimals,
            name: token.name,
            symbol: token.symbol
          } as Token);
        } else {
          setAdditionalToken(null);
        }
      }
    }, 600);

    if (query.length > 0) {
      debounceHandleSearch(query);
      debouncedFetch(query);
    }

    return () => {
      debouncedFetch.clear();
    };
  }, [query]);

  return (
    <Autocomplete
      //freeSolo
      options={filteredTokens}
      getOptionLabel={(option) => option.name + ' (' + truncateEthAddress(option.address) + ')'}
      filterOptions={x => x}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search token"
          variant="outlined"
          onChange={(e) => setQuery(e.target.value)}
        />
      )}
      renderOption={(props, option) => (
        <li {...props}>
          <ListItemText primary={option.name} secondary={truncateEthAddress(option.address)} />
        </li>
      )}
      getOptionKey={(option) => option.address + option.chainId}
      onChange={(event, value) => handleSelect(value)}
      sx={{ paddingY: 2 }}
    />
  );
};

export default TokenAutocomplete;