<template>
  <div class="category-page">
    <router-link to="/categories" class="back-link">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
      </svg>
      全部分类
    </router-link>
    <div class="error-banner" v-if="error">{{ error }}</div>
    <div class="category-header" v-if="category">
      <h1 class="cat-title">{{ category.name }}</h1><p class="cat-desc">{{ category.description }}</p>
    </div>
    <div class="not-found" v-else-if="!loading && !error"><p>分类不存在</p></div>
    <div class="cat-posts" v-if="posts.length">
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
    </div>
    <div class="empty" v-else-if="!loading && !error"><p>该分类下暂无文章</p></div>
    <div class="empty" v-if="loading"><p>加载中...</p></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getCategories, getCategoryArticles } from '../api/categories.js'
import PostCard from '../components/PostCard.vue'

const route = useRoute()
const categoryId = computed(() => Number(route.params.id))
const category = ref(null)
const posts = ref([])
const loading = ref(false)
const error = ref('')

async function fetchData() {
  loading.value = true
  error.value = ''
  try {
    const cats = await getCategories()
    category.value = cats.find(c => c.id === categoryId.value) || null
    posts.value = await getCategoryArticles(categoryId.value, 1)
  } catch (e) {
    error.value = '加载失败：' + (e.message || '请确认后端服务已启动')
  }
  loading.value = false
}

onMounted(fetchData)
watch(categoryId, fetchData)
</script>

<style scoped>
.category-page { padding: 32px 0; }
.back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; color: var(--text-secondary); margin-bottom: 24px; transition: color var(--transition); }
.back-link:hover { color: var(--accent); opacity: 1; }
.error-banner { padding: 12px 16px; background: #fee2e2; color: #991b1b; border-radius: var(--radius-sm); margin-bottom: 16px; font-size: 14px; }
.category-header { margin-bottom: 32px; padding-bottom: 20px; border-bottom: 2px solid var(--accent); }
.cat-title { font-family: var(--font-serif); font-size: 36px; font-weight: 700; color: var(--heading); letter-spacing: -1px; margin-bottom: 8px; }
.cat-desc { font-size: 16px; color: var(--text-secondary); line-height: 1.6; }
.not-found, .empty { text-align: center; padding: 64px 0; color: var(--text-muted); }
@media (max-width: 768px) { .cat-title { font-size: 28px; } }
</style>
