import { getTokenPrices, getWalletHistory, getWalletTransactions, getTokenList, fetchLogo, fetchInfo, getTokenInfo, ASSETURL } from '../../service/lambda';
import superagent from 'superagent';

// Mocking superagent and fetch
jest.mock('superagent');
global.fetch = jest.fn();

describe('lambda functions', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTokenPrices', () => {
    it('should return token prices when API call is successful', async () => {
      const mockResponse = { price: 100 };
      const data = 'symbol=ETH';

      (superagent.get as jest.Mock).mockReturnValue({
        withCredentials: jest.fn().mockResolvedValue({ body: mockResponse })
      });

      const result = await getTokenPrices(data);

      expect(superagent.get).toHaveBeenCalledWith(`https://pgoh3ugkwf7bg4avrcwe5yts7e0epnon.lambda-url.sa-east-1.on.aws/prices?${data}`);
      expect(result).toEqual(mockResponse);
    });

    it('should log error and return undefined when API call fails', async () => {
      const data = 'symbol=ETH';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      (superagent.get as jest.Mock).mockReturnValue({
        withCredentials: jest.fn().mockRejectedValue(new Error('API error'))
      });

      const result = await getTokenPrices(data);

      expect(consoleSpy).toHaveBeenCalledWith(data, expect.any(Error));
      expect(result).toBeUndefined();

      consoleSpy.mockRestore();
    });
  });

  describe('getWalletHistory', () => {
    it('should return wallet history when API call is successful', async () => {
      const mockResponse = { history: [] };
      const wallet = '0x123';
      const chainName = 'eth-mainnet';

      (superagent.get as jest.Mock).mockReturnValue({
        withCredentials: jest.fn().mockResolvedValue({ body: mockResponse })
      });

      const result = await getWalletHistory(wallet, chainName);

      expect(superagent.get).toHaveBeenCalledWith(`https://pgoh3ugkwf7bg4avrcwe5yts7e0epnon.lambda-url.sa-east-1.on.aws/history?chainName=${chainName}&wallet=${wallet}`);
      expect(result).toEqual(mockResponse);
    });

    it('should return null when API call fails', async () => {
      const wallet = '0x123';
      const chainName = 'eth-mainnet';

      (superagent.get as jest.Mock).mockReturnValue({
        withCredentials: jest.fn().mockRejectedValue(new Error('API error'))
      });

      const result = await getWalletHistory(wallet, chainName);

      expect(result).toBeNull();
    });
  });

  describe('getWalletTransactions', () => {
    it('should return wallet transactions when API call is successful', async () => {
      const mockResponse = { transactions: [] };
      const wallet = '0x123';
      const chainName = 'eth-mainnet';

      (superagent.get as jest.Mock).mockReturnValue({
        withCredentials: jest.fn().mockResolvedValue({ body: mockResponse })
      });

      const result = await getWalletTransactions(wallet, chainName);

      expect(superagent.get).toHaveBeenCalledWith(`https://pgoh3ugkwf7bg4avrcwe5yts7e0epnon.lambda-url.sa-east-1.on.aws/transactions?chainName=${chainName}&wallet=${wallet.toLowerCase()}`);
      expect(result).toEqual(mockResponse);
    });

    it('should return null when API call fails', async () => {
      const wallet = '0x123';
      const chainName = 'eth-mainnet';

      (superagent.get as jest.Mock).mockReturnValue({
        withCredentials: jest.fn().mockRejectedValue(new Error('API error'))
      });

      const result = await getWalletTransactions(wallet, chainName);

      expect(result).toBeNull();
    });
  });

  describe('getTokenList', () => {
    it('should return token list data when fetch is successful', async () => {
      const mockResponse = { tokens: [] };
      (fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockResponse)
      });

      const chainId = 1;
      const result = await getTokenList(chainId);

      expect(fetch).toHaveBeenCalledWith('https://metadata.p.rainbow.me/token-list/rainbow-token-list.json');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('fetchLogo', () => {
    it('should return logo URL when logo exists', async () => {
      const chainName = 'eth-mainnet';
      const address = '0x123';
      const logoUrl = `${ASSETURL(chainName, address)}/logo.png`;

      (fetch as jest.Mock).mockResolvedValue({
        status: 200
      });

      const result = await fetchLogo(chainName, address);

      expect(fetch).toHaveBeenCalledWith(logoUrl);
      expect(result).toEqual(logoUrl);
    });

    it('should return default icon when logo does not exist', async () => {
      const chainName = 'eth-mainnet';
      const address = '0x123';
      const logoUrl = `${ASSETURL(chainName, address)}/logo.png`;

      (fetch as jest.Mock).mockResolvedValue({
        status: 404
      });

      const result = await fetchLogo(chainName, address);

      expect(fetch).toHaveBeenCalledWith(logoUrl);
      expect(result).toEqual('/icon-green.png');
    });

    it('should return null when fetch fails', async () => {
      const chainName = 'eth-mainnet';
      const address = '0x123';

      (fetch as jest.Mock).mockRejectedValue(new Error('Fetch error'));

      const result = await fetchLogo(chainName, address);

      expect(result).toBeNull();
    });
  });

  describe('fetchInfo', () => {
    it('should return info data when fetch is successful', async () => {
      const chainName = 'eth-mainnet';
      const address = '0x123';
      const infoUrl = `${ASSETURL(chainName, address)}/info.json`;
      const mockInfo = { name: 'Token' };

      (fetch as jest.Mock).mockResolvedValue({
        json: jest.fn().mockResolvedValue(mockInfo)
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await fetchInfo(chainName, address);

      expect(consoleSpy).toHaveBeenCalledWith(infoUrl);
      expect(fetch).toHaveBeenCalledWith(infoUrl);
      expect(result).toEqual(mockInfo);

      consoleSpy.mockRestore();
    });

    it('should return null when fetch fails', async () => {
      const chainName = 'eth-mainnet';
      const address = '0x123';

      (fetch as jest.Mock).mockRejectedValue(new Error('Fetch error'));

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await fetchInfo(chainName, address);

      expect(consoleSpy).toHaveBeenCalledWith('Error fetching info:', expect.any(Error));
      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe('getTokenInfo', () => {
    it('should return token info when API call is successful', async () => {
      const mockResponse = { token: {} };
      const chainId = 1;
      const address = '0x123';
      const chainName = 'eth-mainnet';

      (superagent.get as jest.Mock).mockReturnValue({
        withCredentials: jest.fn().mockResolvedValue({ body: mockResponse })
      });

      const result = await getTokenInfo(chainId, address);

      expect(superagent.get).toHaveBeenCalledWith(`https://pgoh3ugkwf7bg4avrcwe5yts7e0epnon.lambda-url.sa-east-1.on.aws/tokens/metadata?chainName=${chainName}&address=${address}`);
      expect(result).toEqual(mockResponse);
    });

    it('should return null when API call fails', async () => {
      const chainId = 1;
      const address = '0x123';

      (superagent.get as jest.Mock).mockReturnValue({
        withCredentials: jest.fn().mockRejectedValue(new Error('API error'))
      });

      const result = await getTokenInfo(chainId, address);

      expect(result).toBeNull();
    });
  });

});