const mockStripe = {
  subscriptions: { search: jest.fn(), update: jest.fn() },
  invoices: { search: jest.fn(), create: jest.fn(), addLines: jest.fn(), finalize: jest.fn() },
  checkout: { sessions: { create: jest.fn(), retrieve: jest.fn() } },
  billingPortal: { sessions: { create: jest.fn() } },
  StripeResource : { extend: jest.fn() }
};

export const StripeResource = { extend: jest.fn() };

export default mockStripe;

describe("placeholder", () => {
  it("placeholder", () => {
    //
  });
});