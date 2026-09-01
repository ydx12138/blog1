import { createRouter, createWebHistory } from 'vue-router'
import { loadSiteSettings, siteSettings } from '../data/site.js'

const routes = [
  // === 用户端 ===
  { path: '/', name: 'home', component: () => import('../views/HomePage.vue') },
  { path: '/posts', redirect: '/' },
  { path: '/posts/:id', name: 'post-detail', component: () => import('../views/PostDetail.vue') },
  { path: '/search', name: 'search', component: () => import('../views/SearchResultsPage.vue') },
  { path: '/categories', name: 'categories', component: () => import('../views/CategoriesPage.vue') },
  { path: '/categories/:id', name: 'category', redirect: (to) => ({ name: 'categories', query: { category_id: to.params.id } }) },
  { path: '/about', name: 'about', component: () => import('../views/AboutPage.vue') },
  { path: '/profile', name: 'profile', component: () => import('../views/ProfilePage.vue'), meta: { requiresUser: true } },

  // === 管理端 ===
  { path: '/admin/login', name: 'admin-login', component: () => import('../views/admin/AdminLogin.vue') },

  // 全屏编辑页（无侧边栏）
  { path: '/admin/articles/new', name: 'admin-article-new', component: () => import('../views/admin/ArticleEdit.vue') },
  { path: '/admin/articles/:id/edit', name: 'admin-article-edit', component: () => import('../views/admin/ArticleEdit.vue') },
  // 管理员预览
  { path: '/admin/articles/:id/preview', name: 'admin-article-preview', component: () => import('../views/admin/ArticlePreview.vue') },

  // 管理后台（含侧边栏）
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('../views/admin/Dashboard.vue') },
      { path: 'articles', name: 'admin-articles', component: () => import('../views/admin/ArticleList.vue') },
      { path: 'categories', name: 'admin-categories', component: () => import('../views/admin/CategoryManagement.vue') },
      { path: 'drafts', name: 'admin-drafts', component: () => import('../views/admin/DraftList.vue') },
      { path: 'comments', name: 'admin-comments', component: () => import('../views/admin/CommentReview.vue') },
      { path: 'users', name: 'admin-users', component: () => import('../views/admin/UserList.vue') },
      { path: 'site', name: 'admin-site', component: () => import('../views/admin/SiteManagement.vue') },
    ],
  },

  // === 404 ===
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFound.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } },
})

router.beforeEach(async (to) => {
  if (to.path === '/categories' || to.path.startsWith('/categories/')) {
    await loadSiteSettings().catch(() => {})
    if (!siteSettings.categoriesEnabled) return { name: 'home' }
  }
  if (to.path === '/about') {
    await loadSiteSettings().catch(() => {})
    if (!siteSettings.profileEnabled) return { name: 'home' }
  }
  if (!to.meta.requiresUser) return true

  let hasSession = false
  try {
    hasSession = Boolean(localStorage.getItem('blog-user') && localStorage.getItem('blog-token'))
  } catch {}

  if (hasSession) return true

  window.dispatchEvent(new Event('show-auth-modal'))
  return { name: 'home' }
})

export default router
