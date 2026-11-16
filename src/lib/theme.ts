import { useCallback, useEffect, useState } from 'react'

// Light / dark theme. The choice lives on <html data-theme>; an inline
// script in each HTML entry sets it before first paint (see THEME_KEY there),
// so there is no flash. Without a stored choice the OS preference wins and
// is followed live.

export type Theme = 'light' | 'dark'
export const THEME_KEY = 'nkz-theme'

function stored(): Theme | null {
  try {
    const t = localStorage.getItem(THEME_KEY)
    return t === 'light' || t === 'dark' ? t : null
  } catch {
    return null
  }
}

function system(): Theme {
  return typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark'
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#fafafa' : '#050505')
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof document === 'undefined') return 'dark'
    const t = document.documentElement.dataset.theme
    return t === 'light' || t === 'dark' ? t : (stored() ?? system())
  })

  useEffect(() => apply(theme), [theme])

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = () => {
      if (!stored()) setTheme(system())
    }
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  const toggle = useCallback(() => {
    setTheme((t) => {
      const next = t === 'light' ? 'dark' : 'light'
      try {
        localStorage.setItem(THEME_KEY, next)
      } catch {
        // Storage blocked: the choice lasts for this page only.
      }
      return next
    })
  }, [])

  return [theme, toggle] as const
}
