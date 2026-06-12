<template>
  <header class="site-header">
    <router-link to="/" class="site-title">{{ site.title }}</router-link>
    <nav class="site-nav">
      <router-link
        v-for="item in site.nav"
        :key="item.label"
        :to="item.path"
        class="nav-link"
        active-class="nav-link--active"
      >
        {{ item.label }}
      </router-link>
      <button class="theme-toggle" @click="toggleTheme" :title="themeLabel">
        <svg v-if="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>
    </nav>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { site } from '../data/site.js'

const STORAGE_KEY = 'blog-theme'

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY) // 'dark' | 'light' | null
  } catch {
    return null
  }
}

function resolveTheme() {
  return getStoredTheme() || getSystemTheme()
}

const isDark = ref(resolveTheme() === 'dark')

const themeLabel = computed(() => (isDark.value ? '切换到浅色模式' : '切换到深色模式'))

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.style.colorScheme = theme
}

function toggleTheme() {
  isDark.value = !isDark.value
  const theme = isDark.value ? 'dark' : 'light'
  applyTheme(theme)
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // ignore
  }
}

let mediaQuery
onMounted(() => {
  // Apply on mount (in case SSR or initial render didn't set it)
  applyTheme(isDark.value ? 'dark' : 'light')

  // Listen to system theme changes (only matters when no manual override)
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    if (!getStoredTheme()) {
      // User hasn't manually set — follow system
      isDark.value = e.matches
      applyTheme(e.matches ? 'dark' : 'light')
    }
  })
})

onUnmounted(() => {
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', () => {})
  }
})
</script>

<style scoped>
.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: var(--header-height);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 100;
  backdrop-filter: blur(8px);
}

.site-title {
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: 700;
  color: var(--heading);
  letter-spacing: -0.5px;
  text-decoration: none;
}

.site-title:hover {
  opacity: 0.75;
}

.site-nav {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  font-size: 15px;
  color: var(--text-secondary);
  padding: 4px 0;
  border-bottom: 2px solid transparent;
  transition: color var(--transition), border-color var(--transition);
}

.nav-link:hover {
  color: var(--heading);
  border-bottom-color: var(--accent-border);
  opacity: 1;
}

.nav-link--active {
  color: var(--heading);
  border-bottom-color: var(--accent);
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition);
}

.theme-toggle:hover {
  color: var(--heading);
  border-color: var(--accent-border);
  box-shadow: var(--shadow);
}

@media (max-width: 768px) {
  .site-nav {
    gap: 16px;
  }

  .nav-link {
    font-size: 14px;
  }
}
</style>
