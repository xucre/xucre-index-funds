import { playStoreAddress, objectFields, BASEURL, isDev } from '../../service/constants';

describe('Constants', () => {
  test('playStoreAddress should be correct', () => {
    expect(playStoreAddress).toBe('https://play.google.com/store/apps/details?id=xucre.expo.client');
  });

  test('BASEURL should be correct', () => {
    expect(BASEURL).toBe('https:/localhost:3000');
  });

  describe('isDev', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...OLD_ENV };
    });

    afterEach(() => {
      process.env = OLD_ENV;
      jest.clearAllMocks();
    });

    test('should be true when NEXT_PUBLIC_TEST_ENV is "true"', () => {
      process.env.NEXT_PUBLIC_TEST_ENV = "true";
      expect(isDev);
    });

    test('should be false when NEXT_PUBLIC_TEST_ENV is not "true"', () => {
      process.env.NEXT_PUBLIC_TEST_ENV = 'false';
      expect(isDev).toBe(false);
    });
  });

  test('objectFields should have correct structure', () => {
    expect(objectFields).toEqual({
      'Account': [
        'Name',
        'Phone',
        'Website',
        'Industry',
        'AnnualRevenue',
        'NumberOfEmployees',
        'BillingCity',
        'BillingCountry',
        'BillingPostalCode',
        'BillingState',
        'BillingStreet',
      ],
      'Organization__c': ['Id', 'Account__c', 'Organization_Id__c', 'Name'],
      'Organization_User__c': ['Id', 'Organization__c', 'Email__c', 'Role__c'],
      'Wallet__c': ['Id', 'Address__c\t', 'Chain__c', 'Organization_User__c'],
    });
  });
});