import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // === 用户端 ===
  { path: '/', name: 'home', component: () => import('../views/HomePage.vue') },
  { path: '/posts', redirect: '/' },
  { path: '/posts/:id', name: 'post-detail', component: () => import('../views/PostDetail.vue') },
  { path: '/categories', name: 'categories', component: () => import('../views/CategoriesPage.vue') },
  { path: '/categories/:id', name: 'category', component: () => import('../views/CategoryPage.vue') },
  { path: '/about', name: 'about', component: () => import('../views/AboutPage.vue') },

  // === 管理端 ===
  { path: '/admin/login', name: 'admin-login', component: () => import('../views/admin/AdminLogin.vue') },

  // 全屏编辑页（无侧边栏）
  { path: '/admin/articles/new', name: 'admin-article-new', component: () => import('../views/admin/ArticleEdit.vue') },
  { path: '/admin/articles/:id/edit', name: 'admin-article-edit', component: () => import('../views/admin/ArticleEdit.vue') },

  // 管理后台（含侧边栏）
  {
    path: '/admin',
    component: () => import('../views/admin/AdminLayout.vue'),
    children: [
      { path: '', name: 'admin-dashboard', component: () => import('../views/admin/Dashboard.vue') },
      { path: 'articles', name: 'admin-articles', component: () => import('../views/admin/ArticleList.vue') },
      { path: 'drafts', name: 'admin-drafts', component: () => import('../views/admin/DraftList.vue') },
      { path: 'comments', name: 'admin-comments', component: () => import('../views/admin/CommentReview.vue') },
      { path: 'users', name: 'admin-users', component: () => import('../views/admin/UserList.vue') },
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

export default router
