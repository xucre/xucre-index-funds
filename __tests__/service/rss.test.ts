


// Step 1: Mock the 'rss-parser' module
jest.mock('rss-parser');

// Step 2: Define your mock items and mock function
const mockItems = [{ title: 'Test Item' }];
// Mock the 'rss-parser' module with a factory function
jest.mock('rss-parser', () => {
  return jest.fn().mockImplementation(() => ({
    parseURL: jest.fn().mockResolvedValue({ items: mockItems }),
  }));
});

import Parser from 'rss-parser';
import { getFeed } from '../../service/rss'; // Import the function that uses Parser

describe('fetchFeed', () => {
  it('should return mocked feed items', async () => {
    // Call the function that uses Parser
    const items = await getFeed();

    // Assertions
    expect(items).toEqual(mockItems);
    expect(Parser).toHaveBeenCalledTimes(1);
    expect(Parser).toHaveBeenCalled();
  });
});