'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

const ThemeContext = createContext<{ theme: Theme; toggleTheme: () => void }>({
  theme: 'dark',
  toggleTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const stored = (localStorage.getItem('theme') as Theme) || 'dark'
    setTheme(stored)
    document.documentElement.setAttribute('data-theme', stored)
    applyThemeToBody(stored)
  }, [])

  const applyThemeToBody = (t: Theme) => {
    document.body.style.background =
      t === 'dark'
        ? 'linear-gradient(to bottom, #1a0f0a, #0d0805)'
        : 'linear-gradient(to bottom, #fdf6ec, #f5ead8)'
    document.body.style.color = t === 'dark' ? '#f0e0c0' : '#3a2010'
  }

  const toggleTheme = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
    applyThemeToBody(next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
