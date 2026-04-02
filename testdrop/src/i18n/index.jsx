import { createContext, useContext, useState } from 'react'
import es from './locales/es.json'
import en from './locales/en.json'
import zh from './locales/zh.json'
import hi from './locales/hi.json'
import ar from './locales/ar.json'
import pt from './locales/pt.json'
import fr from './locales/fr.json'

const locales = { es, en, zh, hi, ar, pt, fr }

export const LANGUAGES = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
]

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const saved = localStorage.getItem('td_lang') || 'es'
  const [lang, setLangState] = useState(saved)

  function setLang(code) {
    localStorage.setItem('td_lang', code)
    setLangState(code)
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = code
  }

  const t = locales[lang] || locales['es']

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
