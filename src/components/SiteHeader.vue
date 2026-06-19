<template>
  <aside class="sidebar">
    <!-- 网站标题 -->
    <router-link to="/" class="sidebar-title">{{ site.title }}</router-link>

    <!-- 导航链接 -->
    <nav class="sidebar-nav">
      <router-link
        v-for="item in site.nav"
        :key="item.label"
        :to="item.path"
        class="nav-link"
        active-class="nav-link--active"
      >
        {{ item.label }}
      </router-link>
    </nav>

    <!-- 底部操作区 -->
    <div class="sidebar-actions">
      <!-- 主题切换 -->
      <button class="theme-toggle" @click="toggleTheme" :title="themeLabel">
        <svg v-if="isDark" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
        <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      </button>

      <!-- 登录 -->
      <button v-if="!isLoggedIn" class="btn-login" @click="showAuthModal = true">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        登录
      </button>

      <!-- 已登录 -->
      <div v-else class="user-dropdown" ref="dropdownRef">
        <button class="btn-user" @click="toggleDropdown">
          <span class="user-avatar">{{ userInitial }}</span>
          <span class="user-name">{{ user?.username }}</span>
        </button>
        <div class="dropdown-menu" v-if="dropdownOpen" @click.stop>
          <div class="dropdown-header">
            <span class="dropdown-name">{{ user?.username }}</span>
            <span class="dropdown-email">{{ user?.email }}</span>
          </div>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item logout" @click="handleLogout">
            退出登录
          </button>
        </div>
      </div>
    </div>

    <AuthModal :visible="showAuthModal" @close="showAuthModal = false" />
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { site } from '../data/site.js'
import { useAuth } from '../stores/auth.js'
import AuthModal from './AuthModal.vue'

const { user, isLoggedIn, logout } = useAuth()

// ---- 主题 ----
const STORAGE_KEY = 'blog-theme'
function getSystemTheme() { return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' }
function getStoredTheme() { try { return localStorage.getItem(STORAGE_KEY) } catch { return null } }
function resolveTheme() { return getStoredTheme() || getSystemTheme() }

const isDark = ref(resolveTheme() === 'dark')
const themeLabel = computed(() => isDark.value ? '切换浅色' : '切换深色')

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  document.documentElement.style.colorScheme = theme
}
function toggleTheme() {
  isDark.value = !isDark.value
  const theme = isDark.value ? 'dark' : 'light'
  applyTheme(theme)
  try { localStorage.setItem(STORAGE_KEY, theme) } catch {}
}

let mediaQuery
onMounted(() => {
  applyTheme(isDark.value ? 'dark' : 'light')
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', (e) => {
    if (!getStoredTheme()) { isDark.value = e.matches; applyTheme(e.matches ? 'dark' : 'light') }
  })
})
onUnmounted(() => { if (mediaQuery) mediaQuery.removeEventListener('change', () => {}) })

// ---- 认证 ----
const showAuthModal = ref(false)
const userInitial = computed(() => user.value ? user.value.username.charAt(0).toUpperCase() : '')

// ---- 下拉 ----
const dropdownOpen = ref(false)
const dropdownRef = ref(null)
function toggleDropdown() { dropdownOpen.value = !dropdownOpen.value }
function handleLogout() { logout(); dropdownOpen.value = false }
function handleClickOutside(e) { if (dropdownRef.value && !dropdownRef.value.contains(e.target)) dropdownOpen.value = false }
onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 200px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  border-right: 1px solid var(--border-light);
  padding: 32px 24px 24px;
  z-index: 100;
}

.sidebar-title {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 700;
  color: var(--heading);
  letter-spacing: -0.5px;
  text-decoration: none;
  margin-bottom: 40px;
}

.sidebar-title:hover { opacity: 0.7; }

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.nav-link {
  font-size: 15px;
  color: var(--text-secondary);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: all var(--transition);
}

.nav-link:hover {
  color: var(--heading);
  background: var(--accent-light);
  opacity: 1;
}

.nav-link--active {
  color: var(--accent);
  background: var(--accent-light);
  font-weight: 600;
}

.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 34px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition);
}
.theme-toggle:hover { color: var(--heading); border-color: var(--accent-border); }

.btn-login {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 34px;
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: 13px;
  cursor: pointer;
  transition: all var(--transition);
}
.btn-login:hover { color: var(--heading); border-color: var(--accent-border); }

.user-dropdown { position: relative; }
.btn-user {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 34px;
  padding: 0 10px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
  transition: all var(--transition);
}
.btn-user:hover { border-color: var(--accent-border); }

.user-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px; height: 22px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  font-size: 11px; font-weight: 700;
  flex-shrink: 0;
}
.user-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.dropdown-menu {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0;
  min-width: 160px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  z-index: 200;
  animation: dropdownUp 0.15s ease;
}
@keyframes dropdownUp {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.dropdown-header { padding: 12px 14px 8px; }
.dropdown-name { display: block; font-size: 13px; font-weight: 600; color: var(--heading); }
.dropdown-email { display: block; font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.dropdown-divider { height: 1px; background: var(--border-light); margin: 0 6px; }
.dropdown-item {
  display: flex; align-items: center;
  width: 100%; padding: 10px 14px;
  border: none; background: none;
  color: var(--text-secondary); font-size: 12px;
  cursor: pointer; transition: background var(--transition);
}
.dropdown-item:hover { background: var(--tag-bg); }
.dropdown-item.logout:hover { color: #dc2626; }

/* ===== 移动端：回到顶部横栏 ===== */
@media (max-width: 768px) {
  .sidebar {
    position: sticky;
    top: 0;
    width: 100%;
    height: auto;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    min-height: 48px;
    border-right: none;
    border-bottom: 1px solid var(--border-light);
  }
  .sidebar-title { font-size: 17px; margin-bottom: 0; }
  .sidebar-nav { display: none; }
  .sidebar-actions {
    flex-direction: row;
    gap: 8px;
    padding-top: 0;
    border-top: none;
  }
  .theme-toggle, .btn-login, .btn-user { width: auto; height: 30px; padding: 0 8px; font-size: 12px; }
  .user-name { display: none; }
  .dropdown-menu { bottom: auto; top: calc(100% + 6px); right: 0; left: auto; }
  @keyframes dropdownUp { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
}
</style>
