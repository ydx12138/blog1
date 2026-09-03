import { computed, onMounted, onUnmounted, ref } from 'vue'
import { resolveTheme } from '../utils/theme.js'

function getStoredTheme(storageKey) {
  try {
    return localStorage.getItem(storageKey)
  } catch {
    return null
  }
}

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyDocumentTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.style.colorScheme = theme
}

export function useTheme(storageKey) {
  const theme = ref(resolveTheme(storageKey, getStoredTheme, getSystemTheme()))
  const isDark = computed(() => theme.value === 'dark')
  let mediaQuery

  function applyTheme(nextTheme) {
    theme.value = nextTheme
    applyDocumentTheme(nextTheme)
  }

  function toggleTheme() {
    const nextTheme = isDark.value ? 'light' : 'dark'
    applyTheme(nextTheme)
    try {
      localStorage.setItem(storageKey, nextTheme)
    } catch {}
  }

  function handleSystemThemeChange(event) {
    if (!getStoredTheme(storageKey)) applyTheme(event.matches ? 'dark' : 'light')
  }

  onMounted(() => {
    applyDocumentTheme(theme.value)
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', handleSystemThemeChange)
  })

  onUnmounted(() => {
    mediaQuery?.removeEventListener('change', handleSystemThemeChange)
  })

  return { isDark, toggleTheme }
}
