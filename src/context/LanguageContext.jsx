import { createContext, useContext, useState, useMemo } from 'react'

// 语言上下文：默认中文，可在中/英之间切换
// 使用方式：const { lang, toggleLang, T } = useLanguage()
//   T('中文文案', 'English copy') 会根据当前语言返回对应文案
const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('zh') // 'zh' | 'en'

  const value = useMemo(() => {
    const toggleLang = () => setLang((prev) => (prev === 'zh' ? 'en' : 'zh'))
    // T = Translate：传入中文与英文两个版本，按当前语言返回
    const T = (zh, en) => (lang === 'zh' ? zh : en)
    return { lang, setLang, toggleLang, T }
  }, [lang])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage 必须在 LanguageProvider 内部使用')
  return ctx
}
