'use client'
import { Autocomplete, TextField, ListItemText } from '@mui/material';
import { debounce } from '@mui/material/utils';
import { useEffect, useMemo, useState } from 'react';
// Removed fetchInfo import
// import { fetchInfo } from '@/service/lambda';
import truncateEthAddress from 'truncate-eth-address';
import { useTokenListRaw } from '@/hooks/useTokenList';
import { useAccount } from 'wagmi';
import { getAddress, isAddress, zeroAddress } from 'viem';

// Import Alchemy SDK
import { getTokenMetadata } from '@/service/alchemy';
import { Token } from '@/service/types';
import { globalChainId } from '@/service/constants';

interface AutocompleteProps {
  onSelect: (token: Token | null) => void;
}

// TODO: add token logos

const TokenAutocomplete: React.FC<AutocompleteProps> = ({ onSelect }) => {
  const { chainId, chain } = useAccount();
  const [query, setQuery] = useState('');
  const [additionalToken, setAdditionalToken] = useState<Token | null>(null);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const sourceToken = {
    address: zeroAddress,
    chainId,
    decimals: chain?.nativeCurrency.decimals,
    name: chain?.nativeCurrency.name,
    symbol: chain?.nativeCurrency.symbol,
  } as Token;
  const initialFilteredTokens = [sourceToken] as Token[];
  //const [initialFilteredTokens, seInitialFilteredTokens] = useState<Token[]>([]);
  
  const { tokens } = useTokenListRaw({ chainId });

  // useEffect(() => {
  //   const result = [
  //     ...tokens.filter(
  //       (token) =>
  //         token.name.toLowerCase().includes(query.toLowerCase()) ||
  //         token.symbol.toLowerCase().includes(query.toLowerCase())
  //     ),
  //   ];
  //   seInitialFilteredTokens(result);
  // }, [tokens, query]);

  // const debounceHandleSearch = useMemo(
  //   () =>
  //     debounce((value) => {
  //       const _filteredTokens = [
  //         ...tokens.filter(
  //           (token) =>
  //             token.name.toLowerCase().includes(value.toLowerCase()) ||
  //             token.symbol.toLowerCase().includes(value.toLowerCase())
  //         ),
  //       ];
  //       seInitialFilteredTokens(_filteredTokens);
  //     }, 300),
  //   [tokens]
  // );

  useEffect(() => {
    const filteredTokensCombined = [
      ...initialFilteredTokens,
      ...(additionalToken ? [additionalToken] : []),
    ];
    setFilteredTokens(filteredTokensCombined);
  }, [additionalToken]);

  const handleSelect = (token: Token) => {
    onSelect(token);
    setQuery('');
  };

  useEffect(() => {
    const debouncedFetch = debounce(async (query: string) => {
      console.log('Fetching token metadata for', query);
      if (query && isAddress(query)) {
        try {
          const additionalToken = await getTokenMetadata(query, chainId || globalChainId);
          console.log(additionalToken);
          if (additionalToken) {
            setAdditionalToken(additionalToken);
          }
        } catch (error) {
          console.error('Error fetching token metadata', error);
          setAdditionalToken(null);
        }
      } else {
        setAdditionalToken(null);
      }
    }, 300);

    if (query.length > 0) {
      //debounceHandleSearch(query);
      debouncedFetch(query);
    } else {
      setFilteredTokens(initialFilteredTokens);
    }

    return () => {
      debouncedFetch.clear();
    };
  }, [query, chainId]);

  return (
    <Autocomplete
      options={filteredTokens}
      getOptionLabel={(option) =>
        option.name + ' (' + truncateEthAddress(option.address) + ')'
      }
      filterOptions={(x) => x}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          onChange={(e) => setQuery(e.target.value)}
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option.address}>
          <ListItemText
            primary={option.name}
            secondary={truncateEthAddress(option.address)}
          />
        </li>
      )}
      onChange={(event, value) => value && handleSelect(value)}
      sx={{flex: 3}}
    />
  );
};

export default TokenAutocomplete;