import { createContext, useContext, useState, useCallback } from 'react';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en');
  const toggle = useCallback(() => setLang(l => (l === 'zh' ? 'en' : 'zh')), []);
  // t: 取 { zh, en } 结构的文案
  const t = useCallback(node => (node && typeof node === 'object' ? node[lang] ?? node.zh : node), [lang]);
  return <LangContext.Provider value={{ lang, toggle, t }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
