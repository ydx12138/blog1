<template>
  <aside class="sidebar">
    <!-- 网站标题 -->
    <router-link to="/" class="sidebar-title">{{ site.title }}</router-link>

    <!-- 导航链接 -->
    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.label"
        :to="item.path"
        class="nav-link"
        active-class="nav-link--active"
        :exact="item.path === '/'"
      >
        {{ item.label }}
      </router-link>
    </nav>

    <!-- 底部：主题 + 登录/注册 -->
    <div class="sidebar-bottom">
      <button class="theme-toggle" @click="toggleTheme" :title="themeLabel">
        <svg v-if="isDark" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
        <span class="theme-label">{{ isDark ? '暗色' : '亮色' }}</span>
      </button>

      <!-- 未登录 -->
      <button v-if="!isLoggedIn" class="btn-login" @click="showAuthModal = true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        登录
      </button>

      <!-- 已登录 -->
      <div v-else class="user-dropdown" ref="dropdownRef">
        <button class="btn-user" @click="toggleDropdown">
          <img v-if="user?.avatar" class="user-avatar user-avatar-image" :src="user.avatar" :alt="user?.nickname || user?.email" />
          <span v-else class="user-avatar">{{ userInitial }}</span>
          <span class="user-name">{{ user?.nickname || user?.email }}</span>
        </button>
        <div class="dropdown-menu" v-if="dropdownOpen" @click.stop>
          <button class="dropdown-header" type="button" title="查看个人资料" @click="goToProfile">
            <span class="dropdown-name">{{ user?.nickname }}</span>
            <span class="dropdown-email">{{ user?.email }}</span>
          </button>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item logout" @click="handleLogout">退出登录</button>
        </div>
      </div>
    </div>

    <AuthModal :visible="showAuthModal" @close="showAuthModal = false" />
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { site, siteSettings } from '../data/site.js'
import { useAuth } from '../stores/auth.js'
import { useTheme } from '../composables/useTheme.js'
import AuthModal from './AuthModal.vue'

const { user, isLoggedIn, refreshUser, logout } = useAuth()
const router = useRouter()
const navItems = computed(() => site.nav.filter((item) => {
  if (item.path === '/categories') return siteSettings.categoriesEnabled
  if (item.path === '/about') return siteSettings.profileEnabled
  return true
}))

// ---- 主题 ----
const { isDark, toggleTheme } = useTheme('blog-theme')
const themeLabel = computed(() => isDark.value ? '切亮色' : '切暗色')
onMounted(() => {
  if (isLoggedIn.value && !user.value?.avatar) {
    refreshUser().catch(() => {})
  }
})

// ---- 认证 ----
const showAuthModal = ref(false)
const userInitial = computed(() => user.value ? (user.value.nickname || user.value.email).charAt(0).toUpperCase() : '')

// ---- 下拉 ----
const dropdownOpen = ref(false)
const dropdownRef = ref(null)
function toggleDropdown() { dropdownOpen.value = !dropdownOpen.value }
function goToProfile() { dropdownOpen.value = false; router.push({ name: 'profile' }) }
function handleLogout() {
  logout()
  dropdownOpen.value = false
  showAuthModal.value = false
  try { sessionStorage.removeItem('blog-show-auth') } catch {}
  router.replace({ name: 'home' })
}
function handleClickOutside(e) { if (dropdownRef.value && !dropdownRef.value.contains(e.target)) dropdownOpen.value = false }
function openAuthModal() { showAuthModal.value = true }
// handleSessionForcedLogout 响应后端单点登录或封禁通知；无参数无返回值，关闭用户界面并回到首页。
function handleSessionForcedLogout() {
  dropdownOpen.value = false
  showAuthModal.value = false
  router.replace({ name: 'home' })
}
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('show-auth-modal', openAuthModal)
  window.addEventListener('blog:session-replaced', handleSessionForcedLogout)
  try { sessionStorage.removeItem('blog-show-auth') } catch {}
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('show-auth-modal', openAuthModal)
  window.removeEventListener('blog:session-replaced', handleSessionForcedLogout)
})
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0; left: 0;
  width: var(--sidebar-width);
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  border-right: 1px solid var(--border-light);
  padding: 36px 20px 20px;
  z-index: 100;
  transition: background var(--transition);
}

.sidebar-title {
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: 700;
  color: var(--heading);
  letter-spacing: -0.5px;
  text-decoration: none;
  margin-bottom: 36px;
  padding: 0 8px;
  transition: opacity var(--transition);
}
.sidebar-title:hover { opacity: 0.7; }

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.nav-link {
  font-size: 14px;
  color: var(--text-secondary);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: all var(--transition);
  font-weight: 450;
}
.nav-link:hover {
  color: var(--heading);
  background: var(--accent-light);
}
.nav-link--active {
  color: var(--accent);
  background: var(--accent-light);
  font-weight: 600;
}

/* ---- 底部 ---- */
.sidebar-bottom {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 14px;
  border-top: 1px solid var(--border-light);
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 10px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 12px;
  font-family: var(--font-sans);
  transition: all var(--transition);
}
.theme-toggle:hover { color: var(--heading); background: var(--accent-light); }
.theme-label { white-space: nowrap; }

.btn-login {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  width: 100%;
  padding: 0 12px;
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all var(--transition);
}
.btn-login:hover {
  color: var(--heading);
  border-color: var(--accent-border);
  background: var(--accent-light);
}

.user-dropdown { position: relative; }
.btn-user {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 32px;
  padding: 0 10px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 13px;
  font-family: var(--font-sans);
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
.user-avatar-image { object-fit: cover; }
.user-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.dropdown-menu {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 0;
  min-width: 150px;
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
.dropdown-header {
  display: block;
  width: 100%;
  padding: 10px 14px 8px;
  border: none;
  background: transparent;
  text-align: left;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: background var(--transition);
}
.dropdown-header:hover { background: var(--accent-light); }
.dropdown-name { display: block; font-size: 13px; font-weight: 600; color: var(--heading); }
.dropdown-email { display: block; font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.dropdown-divider { height: 1px; background: var(--border-light); margin: 0 8px; }
.dropdown-item {
  display: flex; align-items: center;
  width: 100%; padding: 9px 14px;
  border: none; background: none;
  color: var(--text-secondary); font-size: 12px;
  cursor: pointer; transition: background var(--transition);
}
.dropdown-item:hover { background: var(--tag-bg); }
.dropdown-item.logout:hover { color: var(--danger); }

/* ===== 移动端 ===== */
@media (max-width: 768px) {
  .sidebar {
    position: sticky; top: 0;
    width: 100%; height: auto;
    flex-direction: row; align-items: center; justify-content: space-between;
    padding: 0 14px; min-height: 48px;
    border-right: none; border-bottom: 1px solid var(--border-light);
    backdrop-filter: blur(12px);
    background: rgba(254, 253, 249, 0.85);
  }
  :root[data-theme='dark'] .sidebar { background: rgba(30, 30, 28, 0.88); }

  .sidebar-title { font-size: 16px; margin-bottom: 0; padding: 0; }
  .sidebar-nav { display: none; }
  .sidebar-bottom {
    flex-direction: row; gap: 8px;
    padding-top: 0; border-top: none;
  }
  .theme-toggle { width: auto; height: 30px; }
  .theme-label { display: none; }
  .btn-login, .btn-user { width: auto; height: 30px; font-size: 12px; padding: 0 8px; }
  .user-name { display: none; }
  .dropdown-menu { bottom: auto; top: calc(100% + 6px); right: 0; left: auto; }
  @keyframes dropdownUp { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
}
</style>
