<template>
  <div class="admin-layout">
    <header class="admin-topbar">
      <button type="button" class="admin-menu-button" :aria-expanded="menuOpen" aria-label="打开管理导航" @click="menuOpen = true">☰</button>
      <strong>{{ currentTitle }}</strong>
      <router-link to="/admin/articles/new">新建文章</router-link>
    </header>
    <MobileDrawer v-model:open="menuOpen" title="博客管理">
      <nav class="admin-nav" aria-label="管理导航">
        <router-link v-for="item in menuItems" :key="item.path" :to="item.path" class="nav-item" exact-active-class="nav-active" @click="menuOpen = false">{{ item.title }}</router-link>
      </nav>
      <template #footer>
        <span>{{ adminUser?.nickname || adminUser?.username }}</span>
        <button class="btn-theme" type="button" @click="toggleTheme">{{ isDark ? '亮色模式' : '暗色模式' }}</button>
        <button class="btn-logout" type="button" @click="handleLogout">退出</button>
      </template>
    </MobileDrawer>
    <aside class="admin-sidebar">
      <router-link to="/admin" class="admin-logo">Blog Admin</router-link>
      <router-link to="/admin/articles/new" class="btn-new-article">+ 新建文章</router-link>
      <nav class="admin-nav">
        <router-link to="/admin" exact-active-class="nav-active" class="nav-item">📊 数据面板</router-link>
        <router-link to="/admin/articles" active-class="nav-active" class="nav-item">📝 文章管理</router-link>
        <router-link to="/admin/drafts" active-class="nav-active" class="nav-item">📋 草稿箱</router-link>
        <router-link to="/admin/comments" active-class="nav-active" class="nav-item">💬 评论审核</router-link>
        <router-link to="/admin/users" active-class="nav-active" class="nav-item">👥 用户管理</router-link>
        <router-link to="/admin/site" active-class="nav-active" class="nav-item">⚙️ 网站管理</router-link>
        <router-link to="/admin/categories" active-class="nav-active" class="nav-item">📁 分类管理</router-link>
        <router-link to="/admin/links" active-class="nav-active" class="nav-item">🔗 友链管理</router-link>
      </nav>
      <div class="admin-sidebar-footer">
        <span class="admin-user">{{ adminUser?.nickname || adminUser?.username }}</span>
        <button class="btn-theme" type="button" :title="isDark ? '切换亮色模式' : '切换暗色模式'" @click="toggleTheme">
          {{ isDark ? '亮色模式' : '暗色模式' }}
        </button>
        <button class="btn-logout" @click="handleLogout">退出</button>
      </div>
    </aside>
    <main class="admin-main">
      <router-view />
    </main>
    <ConfirmModal :visible="visible" :message="message" @ok="handleOk" @cancel="handleCancel" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../../stores/auth.js'
import { useConfirm } from '../../composables/useConfirm.js'
import { useTheme } from '../../composables/useTheme.js'
import ConfirmModal from '../../components/ConfirmModal.vue'
import MobileDrawer from '../../components/MobileDrawer.vue'

const menuOpen = ref(false)
const route = useRoute()
const menuItems = [
  { path: '/admin', title: '数据面板' },
  { path: '/admin/articles', title: '文章管理' },
  { path: '/admin/drafts', title: '草稿箱' },
  { path: '/admin/comments', title: '评论审核' },
  { path: '/admin/users', title: '用户管理' },
  { path: '/admin/site', title: '网站管理' },
  { path: '/admin/categories', title: '分类管理' },
  { path: '/admin/links', title: '友链管理' },
]
const currentTitle = computed(() => menuItems.find((item) => item.path === route.path)?.title || '博客管理')

const { adminUser, isAdmin, adminLogout } = useAuth()
const router = useRouter()
const { visible, message, handleOk, handleCancel } = useConfirm()
const { isDark, toggleTheme } = useTheme('blog-admin-theme')

onMounted(() => {
  if (!isAdmin.value) {
    router.push('/admin/login')
  }
})

function handleLogout() {
  menuOpen.value = false
  adminLogout()
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-topbar { display: none; }
.admin-layout { display: flex; min-height: 100vh; }
.admin-sidebar { width: 220px; background: var(--bg-card); border-right: 1px solid var(--border); padding: 24px; display: flex; flex-direction: column; position: fixed; top: 0; left: 0; height: 100vh; z-index: 100; }
.admin-logo { font-family: var(--font-serif); font-size: 20px; font-weight: 700; color: var(--heading); text-decoration: none; display: block; }
.btn-new-article { display: block; padding: 10px 12px; margin: 16px 0 20px; border: none; border-radius: var(--radius-sm); background: var(--accent); color: #fff; font-size: 13px; font-weight: 600; text-decoration: none; text-align: center; transition: all var(--transition); }
.btn-new-article:hover { opacity: 0.88; }
.admin-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.nav-item { padding: 10px 12px; border-radius: var(--radius-sm); font-size: 14px; color: var(--text-secondary); text-decoration: none; transition: all var(--transition); }
.nav-item:hover { background: var(--accent-light); color: var(--heading); }
.nav-active { background: var(--accent-light); color: var(--accent); font-weight: 600; }
.admin-sidebar-footer { padding-top: 16px; border-top: 1px solid var(--border-light); display: flex; flex-direction: column; gap: 8px; }
.admin-user { font-size: 13px; color: var(--text-secondary); }
.btn-theme, .btn-logout { padding: 6px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: transparent; color: var(--text-muted); cursor: pointer; font-size: 12px; transition: all var(--transition); }
.btn-theme:hover { color: var(--accent); border-color: var(--accent-border); background: var(--accent-light); }
.btn-logout:hover { color: #dc2626; border-color: #dc2626; }
.admin-main { margin-left: 220px; flex: 1; padding: 32px 40px; min-width: 0; }
@media (max-width: 1023px) {
  .admin-layout { flex-direction: column; }
  .admin-sidebar { display: none; }
  .admin-topbar { position: sticky; top: 0; z-index: 100; display: flex; align-items: center; gap: 12px; min-height: 60px; padding: env(safe-area-inset-top) var(--content-gutter) 0; background: var(--bg); border-bottom: 1px solid var(--border); }
  .admin-topbar strong { flex: 1; min-width: 0; font-family: var(--font-serif); }
  .admin-topbar a { flex-shrink: 0; padding: 10px 0; font-size: 13px; }
  .admin-menu-button { width: 44px; height: 44px; border: 1px solid var(--border); border-radius: var(--radius); color: var(--text); background: transparent; cursor: pointer; }
  .admin-main { margin-left: 0; padding: 24px var(--content-gutter); }
  .nav-item, .btn-theme, .btn-logout { min-height: 44px; }
}
</style>
