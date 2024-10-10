export const playStoreAddress = 'https://play.google.com/store/apps/details?id=xucre.expo.client';
export const objectFields = {
  'Account' : ['Name', 'Phone', 'Website', 'Industry', 'AnnualRevenue', 'NumberOfEmployees', 'BillingCity', 'BillingCountry', 'BillingPostalCode', 'BillingState', 'BillingStreet'],
  'Organization__c' : ['Id', 'Account__c', 'Organization_Id__c', 'Name'],
  'Organization_User__c': ['Id', 'Organization__c', 'Email__c', 'Role__c'],
  'Wallet__c' : ['Id', 'Address__c	', 'Chain__c', 'Organization_User__c']
}