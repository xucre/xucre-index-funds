
jest.mock('superagent', () => {
  return {
    get: jest.fn().mockReturnValue({
      withCredentials: jest.fn().mockResolvedValue({ body: {id: 'ors_123'} })
    }),
    post: jest.fn().mockReturnValue({
      auth: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      withCredentials: jest.fn().mockResolvedValue({ body: {id: 'ors_123'} })
    }),
  };
});

import mockStripe from './stripeMock';
jest.mock('stripe', () => {
  return jest.fn(() => mockStripe);
});

import { getCustomerSubscription, createCheckout, createInvoice, checkoutSuccess, generateToken } from '../../../service/billing/stripe';
import Stripe from 'stripe';
import { mock } from 'node:test';

describe('Stripe Service', () => {

  describe('getCustomerSubscription', () => {
    it('should return subscription data when active subscription exists', async () => {
      const mockSubscription = {
        data: [{
          customer: 'cus_123',
        }]
      };
      const mockInvoices = {
        data: []
      };
      const mockPortal = {
        url: 'portal_url'
      };

      mockStripe.subscriptions.search.mockResolvedValue(mockSubscription);
      mockStripe.invoices.search.mockResolvedValue(mockInvoices);
      mockStripe.billingPortal.sessions.create.mockResolvedValue(mockPortal);

      const result = await getCustomerSubscription('org_123');
      expect(result).toEqual({
        subscription: mockSubscription.data[0],
        invoices: mockInvoices.data,
        portal: mockPortal
      });
    });

    it('should return null when no subscription exists', async () => {
      mockStripe.subscriptions.search.mockResolvedValue({ data: [] });
      const result = await getCustomerSubscription('org_123');
      expect(result).toBeNull();
    });
  });

  describe('createCheckout', () => {
    it('should create checkout session and return URL', async () => {
      const mockSession = {
        url: 'checkout_url'
      };
      mockStripe.checkout.sessions.create.mockResolvedValue(mockSession);
      const result = await createCheckout('org_123');
      expect(result).toBe('checkout_url');
    });
  });

  describe('createInvoice', () => {
    it('should create invoice with line items', async () => {
      const mockInvoice = {
        id: 'inv_123'
      };
      mockStripe.invoices.create.mockResolvedValue(mockInvoice);
      mockStripe.invoices.addLines.mockResolvedValue(mockInvoice);
      mockStripe.invoices.finalize.mockResolvedValue(mockInvoice.id);
      const result = await createInvoice('cus_123', 'inv_123', [], 100);
      //expect(result).toEqual(mockInvoice);
    });
  });

  describe('checkoutSuccess', () => {
    it('should update subscription metadata on success', async () => {
      const mockSession = {
        subscription: 'sub_123',
        client_reference_id: 'org_123'
      };
      mockStripe.checkout.sessions.retrieve.mockResolvedValue(mockSession);
      const result = await checkoutSuccess('sess_123');
      expect(result).toBe('success');
    });
  });

  describe('generateToken', () => {
    it('should generate onramp session token', async () => {
      const mockResponse = {
        body: {
          id: 'ors_123'
        }
      };
      const result = await generateToken('inv_123', 'org_123', '0x123', 100);
      expect(result).toEqual(mockResponse.body);
    });
  });
});