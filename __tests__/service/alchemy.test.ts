import { Alchemy, Network } from 'alchemy-sdk';
import {
getAlchemyNetwork,
getTokenMetadata,
getUSDCBalance,
getUSDTBalance,
getERC20Balance,
} from '../../service/alchemy';

import { createPublicClient, http, getAddress } from 'viem';

jest.mock('alchemy-sdk');
jest.mock('viem');

describe('getAlchemyNetwork', () => {
it('should return the correct network for a given chainId', () => {
  expect(getAlchemyNetwork(1)).toBe(Network.ETH_MAINNET);
  expect(getAlchemyNetwork(56)).toBe(Network.BNB_MAINNET);
  expect(getAlchemyNetwork(137)).toBe(Network.MATIC_MAINNET);
  expect(getAlchemyNetwork(999)).toBe(Network.ETH_MAINNET);
});
});

describe('getTokenMetadata', () => {
  const mockGetTokenMetadata = jest.fn();
  const mockGetAddress = jest.fn();
  const mockAlchemy = {
    core: {
      getTokenMetadata: mockGetTokenMetadata,
    },
    config: {
      network: Network.ETH_MAINNET,
    },
  };

  beforeEach(() => {
    (Alchemy as jest.Mock).mockImplementation(() => mockAlchemy);
    jest.resetModules();
    process.env.ALCHEMY_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return token metadata when available', async () => {
    (getAddress as jest.Mock).mockImplementation(mockGetAddress);
    process.env.ALCHEMY_API_KEY = 'test-api';
    mockGetTokenMetadata.mockResolvedValue({
      decimals: 18,
      name: 'Test Token',
      symbol: 'TT',
      logo: 'logo-url',
    });
    mockGetAddress.mockReturnValue('0xc2132d05d31c914a87c6611c10748aeb04b58e8f');

    const result = await getTokenMetadata('0xc2132d05d31c914a87c6611c10748aeb04b58e8f', 1);
    
    expect(mockGetTokenMetadata).toHaveBeenCalledWith('0xc2132d05d31c914a87c6611c10748aeb04b58e8f');
    expect(result).toEqual({
      address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
      chainId: 1,
      decimals: 18,
      name: 'Test Token',
      symbol: 'TT',
      logo: 'logo-url',
    });
  });

  it('should return null when token metadata is not available', async () => {
    mockGetTokenMetadata.mockResolvedValue(null);

    const result = await getTokenMetadata('0x1234', 1);

    expect(result).toBeNull();
  });

  it('should return undefined when API key is missing', async () => {
    delete process.env.ALCHEMY_API_KEY;

    const result = await getTokenMetadata('0x1234', 1);

    expect(result).toBeUndefined();
  });
});

describe('getUSDCBalance', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_USDC_ADDRESS = '0xUSDC';
    process.env.NEXT_PUBLIC_SAFE_RPC_URL = 'http://localhost:8545';
  });

  it('should call getERC20Balance with correct parameters', async () => {
    const mockGetERC20Balance = jest.fn().mockResolvedValue(100);
    (getERC20Balance as jest.Mock) = mockGetERC20Balance;

    const balance = await getUSDCBalance('0xUser');

    expect(mockGetERC20Balance).toHaveBeenCalledWith(
      '0xUser',
      '0xUSDC',
      'http://localhost:8545'
    );
    expect(balance).toBe(100);
  });
});

describe('getUSDTBalance', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_USDT_ADDRESS = '0xUSDT';
    process.env.NEXT_PUBLIC_SAFE_RPC_URL = 'http://localhost:8545';
  });

  it('should call getERC20Balance with correct parameters', async () => {
    const mockGetERC20Balance = jest.fn().mockResolvedValue(200);
    (getERC20Balance as jest.Mock) = mockGetERC20Balance;

    const balance = await getUSDTBalance('0xUser');

    expect(mockGetERC20Balance).toHaveBeenCalledWith(
      '0xUser',
      '0xUSDT',
      'http://localhost:8545'
    );
    expect(balance).toBe(200);
  });
});

// describe('getERC20Balance', () => {
//   const mockReadContract = jest.fn();
//   const mockPublicClient = {
//     readContract: mockReadContract,
//   };

//   beforeEach(() => {
//     (createPublicClient as jest.Mock).mockReturnValue(mockPublicClient);
//     mockReadContract.mockClear();
//   });

//   it('should return formatted balance', async () => {
//     mockReadContract.mockResolvedValue(BigInt('1000000')); // 1 token with 6 decimals

//     const balance = await getERC20Balance(
//       '0xUser',
//       '0xToken',
//       'http://localhost:8545'
//     );

//     expect(mockReadContract).toHaveBeenCalled();
//     expect(balance).toBe(1);
//   });

//   it('should return 0 on error', async () => {
//     mockReadContract.mockRejectedValue(new Error('Test error'));

//     const balance = await getERC20Balance(
//       '0xUser',
//       '0xToken',
//       'http://localhost:8545'
//     );

//     expect(balance).toBe(0);
//   });
// });