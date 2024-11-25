import English from "./english";
import Portuguese from './portuguese';
import Spanish from './spanish';


export enum Language {
  'EN', 'ES', 'PT'
}

export const languages = [Language.EN, Language.ES, Language.PT];
export interface TranslationType {
  App: any,
  Buttons_Header: any,
  Billing: any,
  Dashboard: any,
  LanguagePage: any,
  FAQPage: any,
  Home: any,
  Invoice: any,
  Menu: any,
  Onboarding: any,
  Organization: any,
  Profile: any,
  SelectLanguage: any,
  SupportPage: any,
  Toast: any,
  IndexBuilder: any,
  totalBalance: any,
  termsConditions: any,
  ui: any,
  Edit: any,
  Settings: any,
}



export default {
  [Language.EN]: English,
  [Language.ES]: Spanish,
  [Language.PT]: Portuguese,
}