import { retrieveTransactionDetails, TransactionDetails } from '../../service/eip155';
import { getTransactionDetailsDb, setTransactionDetailsDb } from '../../service/db';
import { createPublicClient, http, parseEventLogs, erc20Abi } from 'viem';
import { polygon } from 'viem/chains';

jest.mock('../../service/db');
jest.mock('viem');

describe('retrieveTransactionDetails', () => {
  const address = '0x123';
  const txHash = '0xabc';
  const kvKey = `transaction:${address}:${txHash}`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return cached transaction details if they exist', async () => {
    const cachedTransaction: TransactionDetails = {
      transactionHash: txHash,
      erc20Transfers: [],
      contractCreated: false,
    };
    (getTransactionDetailsDb as jest.Mock).mockResolvedValue(cachedTransaction);

    const result = await retrieveTransactionDetails(address, txHash);

    expect(getTransactionDetailsDb).toHaveBeenCalledWith(kvKey);
    expect(result).toEqual(cachedTransaction);
  });

  it('should throw an error if transaction receipt is not found', async () => {
    (getTransactionDetailsDb as jest.Mock).mockResolvedValue(null);
    (createPublicClient as jest.Mock).mockReturnValue({
      getTransactionReceipt: jest.fn().mockResolvedValue(null),
    });

    await expect(retrieveTransactionDetails(address, txHash)).rejects.toThrow('Transaction receipt not found');
  });

  it('should return transaction details and save them to the database', async () => {
    const receipt = {
      logs: [],
      contractAddress: null,
    };
    const parsedLogs = [];
    const transactionDetails: TransactionDetails = {
      transactionHash: txHash,
      erc20Transfers: [],
      contractCreated: false,
    };

    (getTransactionDetailsDb as jest.Mock).mockResolvedValue(null);
    (createPublicClient as jest.Mock).mockReturnValue({
      getTransactionReceipt: jest.fn().mockResolvedValue(receipt),
    });
    (parseEventLogs as jest.Mock).mockReturnValue(parsedLogs);
    (setTransactionDetailsDb as jest.Mock).mockResolvedValue(undefined);

    const result = await retrieveTransactionDetails(address, txHash);

    expect(getTransactionDetailsDb).toHaveBeenCalledWith(kvKey);
    expect(createPublicClient).toHaveBeenCalledWith({
      chain: polygon,
      transport: http(),
    });
    expect(result).toEqual(transactionDetails);
    expect(setTransactionDetailsDb).toHaveBeenCalledWith(kvKey, transactionDetails);
  });

  it('should handle ERC20 transfer events correctly', async () => {
    const receipt = {
      logs: [
        {
          topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
          args: { from: '0xfrom', to: '0xto', value: '0x1', owner: '0xowner', spender: '0xspender' },
          address: '0xtoken',
          eventName: 'Transfer',
          data: '0x1',
        },
      ],
      contractAddress: null,
    };
    const parsedLogs = [
      {
        topics: ['0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'],
        args: { from: '0xfrom', to: '0xto', value: '0x1', owner: '0xowner', spender: '0xspender' },
        address: '0xtoken',
        eventName: 'Transfer',
        data: '0x1',
      },
    ];
    const transactionDetails: TransactionDetails = {
      transactionHash: txHash,
      erc20Transfers: [
        { from: '0xowner', to: '0xspender', value: '1', token: '0xtoken', event: 'Transfer' },
      ],
      contractCreated: false,
    };

    (getTransactionDetailsDb as jest.Mock).mockResolvedValue(null);
    (createPublicClient as jest.Mock).mockReturnValue({
      getTransactionReceipt: jest.fn().mockResolvedValue(receipt),
    });
    (parseEventLogs as jest.Mock).mockReturnValue(parsedLogs);
    (setTransactionDetailsDb as jest.Mock).mockResolvedValue(undefined);

    const result = await retrieveTransactionDetails(address, txHash);

    expect(result).toEqual(transactionDetails);
    expect(setTransactionDetailsDb).toHaveBeenCalledWith(kvKey, transactionDetails);
  });

  it('should set contractCreated to true if a contract was created', async () => {
    const receipt = {
      logs: [],
      contractAddress: '0xcontract',
    };
    const parsedLogs = [];
    const transactionDetails: TransactionDetails = {
      transactionHash: txHash,
      erc20Transfers: [],
      contractCreated: true,
    };

    (getTransactionDetailsDb as jest.Mock).mockResolvedValue(null);
    (createPublicClient as jest.Mock).mockReturnValue({
      getTransactionReceipt: jest.fn().mockResolvedValue(receipt),
    });
    (parseEventLogs as jest.Mock).mockReturnValue(parsedLogs);
    (setTransactionDetailsDb as jest.Mock).mockResolvedValue(undefined);

    const result = await retrieveTransactionDetails(address, txHash);

    expect(result).toEqual(transactionDetails);
    expect(setTransactionDetailsDb).toHaveBeenCalledWith(kvKey, transactionDetails);
  });
});