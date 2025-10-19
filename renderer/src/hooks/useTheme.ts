import { useState, useEffect, useCallback } from 'react'
import { ThemeMode, ThemeConfig } from '../types/theme'

const THEME_STORAGE_KEY = 'memos-theme-mode'

export const useTheme = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('system')
  const [isDark, setIsDark] = useState(false)

  // 检测系统主题
  const getSystemTheme = useCallback(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }, [])

  // 计算实际的主题状态
  const calculateActualTheme = useCallback((mode: ThemeMode) => {
    if (mode === 'system') {
      return getSystemTheme()
    }
    return mode === 'dark'
  }, [getSystemTheme])

  // 初始化主题
  useEffect(() => {
    // 从localStorage读取保存的主题模式
    const savedMode = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode
    const initialMode = savedMode || 'system'

    setThemeMode(initialMode)
    setIsDark(calculateActualTheme(initialMode))
  }, [calculateActualTheme])

  // 监听系统主题变化
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleSystemThemeChange = () => {
      if (themeMode === 'system') {
        setIsDark(getSystemTheme())
      }
    }

    mediaQuery.addEventListener('change', handleSystemThemeChange)

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [themeMode, getSystemTheme])

  // 切换主题模式
  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeMode(mode)
    setIsDark(calculateActualTheme(mode))
    localStorage.setItem(THEME_STORAGE_KEY, mode)
  }, [calculateActualTheme])

  const themeConfig: ThemeConfig = {
    mode: themeMode,
    isDark
  }

  return {
    themeConfig,
    setTheme
  }
}
