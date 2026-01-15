'use client'

import { useEffect, useSyncExternalStore, useCallback } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from './button'

type Theme = 'light' | 'dark'

function getThemeSnapshot(): Theme {
  if (typeof window === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function getServerSnapshot(): Theme {
  return 'light'
}

function subscribeToTheme(callback: () => void) {
  const observer = new MutationObserver(callback)
  if (typeof document !== 'undefined') {
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
  }
  return () => observer.disconnect()
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerSnapshot)

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = stored ? (stored as Theme) : (prefersDark ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', initial === 'dark')
  }, [])

  const toggleTheme = useCallback(() => {
    const next = theme === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }, [theme])

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9"
      aria-label={theme === 'light' ? '切换到暗色模式' : '切换到亮色模式'}
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4 transition-transform" />
      ) : (
        <Sun className="h-4 w-4 transition-transform" />
      )}
    </Button>
  )
}
