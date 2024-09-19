import React, { useEffect, useMemo } from 'react';
import { Language } from '@/metadata/translations/index';

export type LanguageResponse = {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = React.createContext({ language: Language.EN } as LanguageResponse);

export const useLanguage = () => React.useContext(LanguageContext);

export const LanguageContextProvider = ({ children }: { children: any }) => {
  const [language, setLanguage] = React.useState<Language>(Language.EN);


  useEffect(() => {
    const existingItem = localStorage.getItem('language');
    if (existingItem) {
      setLanguage(Language[existingItem as keyof typeof Language]);
    }
  }, [])
  useEffect(() => {
    localStorage.setItem('language', Language[language]);
  }, [language])

  const value = useMemo(() => ({ language, setLanguage }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
};