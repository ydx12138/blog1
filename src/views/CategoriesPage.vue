<template>
  <div class="categories-page">
    <h1 class="page-title">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="title-icon">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
      分类
    </h1>
    <p class="page-desc">按分类浏览文章</p>
    <div class="error-banner" v-if="error">{{ error }}</div>
    <div class="category-list" v-if="categories.length">
      <router-link v-for="cat in categories" :key="cat.id" :to="`/categories/${cat.id}`" class="category-card">
        <div class="cat-info"><h2 class="cat-name">{{ cat.name }}</h2><p class="cat-desc">{{ cat.description }}</p></div>
        <div class="cat-count"><span class="count-num">-</span><span class="count-label">篇</span></div>
      </router-link>
    </div>
    <div class="empty" v-else-if="!loading"><p>{{ error ? '' : '暂无分类' }}</p></div>
    <div class="empty" v-if="loading"><p>加载中...</p></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCategories } from '../api/categories.js'

const categories = ref([])
const loading = ref(false)
const error = ref('')

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    categories.value = await getCategories()
  } catch (e) {
    error.value = '加载分类失败：' + (e.message || '请确认后端服务已启动')
  }
  loading.value = false
})
</script>

<style scoped>
.categories-page { padding: 32px 0; }
.page-title { display: flex; align-items: center; gap: 10px; font-family: var(--font-serif); font-size: 36px; font-weight: 700; color: var(--heading); letter-spacing: -1px; margin-bottom: 8px; padding-bottom: 16px; border-bottom: 2px solid var(--accent); }
.title-icon { color: var(--accent); flex-shrink: 0; }
.page-desc { font-size: 16px; color: var(--text-secondary); margin-bottom: 32px; }
.error-banner { padding: 12px 16px; background: #fee2e2; color: #991b1b; border-radius: var(--radius-sm); margin-bottom: 16px; font-size: 14px; }
.category-list { display: flex; flex-direction: column; gap: 12px; }
.category-card { display: flex; justify-content: space-between; align-items: center; padding: 24px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); transition: all var(--transition); text-decoration: none; }
.category-card:hover { border-color: var(--accent-border); box-shadow: var(--shadow-md); transform: translateX(4px); }
.cat-info { flex: 1; min-width: 0; }
.cat-name { font-family: var(--font-serif); font-size: 20px; font-weight: 600; color: var(--heading); margin-bottom: 4px; }
.cat-desc { font-size: 14px; color: var(--text-secondary); line-height: 1.5; }
.cat-count { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; margin-left: 24px; padding-left: 24px; border-left: 1px solid var(--border-light); }
.count-num { font-family: var(--font-mono); font-size: 28px; font-weight: 700; color: var(--accent); line-height: 1; }
.count-label { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
.empty { text-align: center; padding: 48px 0; color: var(--text-muted); }
@media (max-width: 768px) { .page-title { font-size: 28px; } .category-card { padding: 18px; } .cat-name { font-size: 18px; } .count-num { font-size: 24px; } }
</style>
