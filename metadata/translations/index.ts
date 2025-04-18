import English from "./english";
import Portuguese from './portuguese';
import Spanish from './spanish';


export enum Language {
  'EN', 'ES', 'PT'
}

export const languages = [Language.EN, Language.ES, Language.PT];
export interface TranslationType {
  App: any,
  Agent: any,
  Buttons_Header: any,
  Billing: any,
  CompanyDashboard: any,
  Dashboard: any,
  LanguagePage: any,
  FAQPage: any,
  FundPage: any,
  Home: any,
  Invoice: any,
  Menu: any,
  Onboarding: any,
  Organization: any,
  Notifications: any,
  Profile: any,
  SelectLanguage: any,
  SupportPage: any,
  Toast: any,
  IndexBuilder: any,
  totalBalance: any,
  termsConditions: any,
  ui: any,
  Edit: any,
  OrganizationEdit: any,
  Settings: any,
  Privacy: any
}



export default {
  [Language.EN]: English,
  [Language.ES]: Spanish,
  [Language.PT]: Portuguese,
}