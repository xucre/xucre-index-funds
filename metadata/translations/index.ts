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
  LanguagePage: any,
  FAQPage: any,
  Menu: any,
  SelectLanguage: any,
  SupportPage: any,
  Toast: any,
  IndexBuilder: any,
  totalBalance: any,
  termsConditions: any,
  ui: any
}



export default {
  [Language.EN]: English,
  [Language.ES]: Spanish,
  [Language.PT]: Portuguese,
}