'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import zhMessages from '@/messages/zh.json'
import enMessages from '@/messages/en.json'

type Locale = 'zh' | 'en'

const allMessages: Record<Locale, Record<string, any>> = {
    zh: zhMessages,
    en: enMessages
}

interface LanguageContextType {
    locale: Locale
    setLocale: (locale: Locale) => void
    t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
    locale: 'zh',
    setLocale: () => { },
    t: (key: string) => key,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('zh')

    useEffect(() => {
        const saved = localStorage.getItem('sweetshop_locale') as Locale
        if (saved && (saved === 'zh' || saved === 'en')) {
            setLocaleState(saved)
        }
    }, [])

    const setLocale = useCallback((newLocale: Locale) => {
        setLocaleState(newLocale)
        localStorage.setItem('sweetshop_locale', newLocale)
    }, [])

    const t = useCallback((key: string): string => {
        const keys = key.split('.')
        let value: any = allMessages[locale]

        for (const k of keys) {
            value = value?.[k]
        }

        return (typeof value === 'string' ? value : key)
    }, [locale])

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => useContext(LanguageContext)
