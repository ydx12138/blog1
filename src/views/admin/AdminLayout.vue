<template>
  <div class="admin-layout">
    <aside class="admin-sidebar">
      <router-link to="/admin" class="admin-logo">Blog Admin</router-link>
      <nav class="admin-nav">
        <router-link to="/admin" exact-active-class="nav-active" class="nav-item">📊 数据面板</router-link>
        <router-link to="/admin/articles" active-class="nav-active" class="nav-item">📝 文章管理</router-link>
        <router-link to="/admin/drafts" active-class="nav-active" class="nav-item">📋 草稿箱</router-link>
        <router-link to="/admin/comments" active-class="nav-active" class="nav-item">💬 评论审核</router-link>
        <router-link to="/admin/users" active-class="nav-active" class="nav-item">👥 用户管理</router-link>
      </nav>
      <div class="admin-sidebar-footer">
        <span class="admin-user">{{ adminUser?.nickname || adminUser?.username }}</span>
        <button class="btn-logout" @click="handleLogout">退出</button>
      </div>
    </aside>
    <main class="admin-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../stores/auth.js'

const { adminUser, isAdmin, adminLogout } = useAuth()
const router = useRouter()

onMounted(() => {
  if (!isAdmin.value) {
    router.push('/admin/login')
  }
})

function handleLogout() {
  adminLogout()
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-layout { display: flex; min-height: 100vh; }
.admin-sidebar { width: 220px; background: var(--bg-card); border-right: 1px solid var(--border); padding: 24px; display: flex; flex-direction: column; position: fixed; top: 0; left: 0; height: 100vh; z-index: 100; }
.admin-logo { font-family: var(--font-serif); font-size: 20px; font-weight: 700; color: var(--heading); text-decoration: none; margin-bottom: 32px; display: block; }
.admin-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
.nav-item { padding: 10px 12px; border-radius: var(--radius-sm); font-size: 14px; color: var(--text-secondary); text-decoration: none; transition: all var(--transition); }
.nav-item:hover { background: var(--accent-light); color: var(--heading); }
.nav-active { background: var(--accent-light); color: var(--accent); font-weight: 600; }
.admin-sidebar-footer { padding-top: 16px; border-top: 1px solid var(--border-light); display: flex; flex-direction: column; gap: 8px; }
.admin-user { font-size: 13px; color: var(--text-secondary); }
.btn-logout { padding: 6px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: transparent; color: var(--text-muted); cursor: pointer; font-size: 12px; transition: all var(--transition); }
.btn-logout:hover { color: #dc2626; border-color: #dc2626; }
.admin-main { margin-left: 220px; flex: 1; padding: 32px 40px; min-width: 0; }
@media (max-width: 768px) {
  .admin-sidebar { width: 100%; height: auto; position: static; flex-direction: row; flex-wrap: wrap; padding: 12px 16px; gap: 8px; }
  .admin-logo { margin-bottom: 0; font-size: 16px; }
  .admin-nav { flex-direction: row; gap: 8px; }
  .admin-main { margin-left: 0; padding: 16px; }
}
</style>
