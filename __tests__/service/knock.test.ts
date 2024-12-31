const mockKnockClient = {
  users: {
    get: jest.fn(),
    identify: jest.fn(),
  },
  workflows: {
    trigger: jest.fn(),
  },
};

jest.mock('@knocklabs/node', () => {
  return {
    Knock: jest.fn(() => mockKnockClient),
  };
});

import { syncKnock } from '../../service/knock';
import { Knock } from '@knocklabs/node';


describe('syncKnock', () => {
  const mockUserId = 'user123';
  const mockUserName = 'John Doe';
  const mockUserEmail = 'john.doe@example.com'; 

  beforeAll(() => {
    //(Knock as jest.Mock).mockImplementation(() => mockKnockClient);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should do nothing if user exists', async () => {
    mockKnockClient.users.get.mockResolvedValueOnce({ id: mockUserId });

    await syncKnock(mockUserId, mockUserName, mockUserEmail);

    expect(mockKnockClient.users.get).toHaveBeenCalledWith(mockUserId);
    expect(mockKnockClient.users.identify).not.toHaveBeenCalled();
    expect(mockKnockClient.workflows.trigger).not.toHaveBeenCalled();
  });

  it('should identify user and trigger announcement if user does not exist', async () => {
    mockKnockClient.users.get.mockRejectedValueOnce(new Error('User not found'));

    await syncKnock(mockUserId, mockUserName, mockUserEmail);

    expect(mockKnockClient.users.get).toHaveBeenCalledWith(mockUserId);
    expect(mockKnockClient.users.identify).toHaveBeenCalledWith(mockUserId, {
      name: mockUserName,
      email: mockUserEmail,
    });
    expect(mockKnockClient.workflows.trigger).toHaveBeenCalledWith('announcement1', {
      actor: 'Xucre',
      recipients: [mockUserId],
      data: {},
    });
  });
});