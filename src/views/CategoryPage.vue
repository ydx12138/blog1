<template>
  <div class="category-page">
    <router-link to="/categories" class="back-link">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
      </svg>
      全部分类
    </router-link>

    <div class="error-banner" v-if="error">{{ error }}</div>

    <div class="category-header" v-if="category">
      <h1 class="cat-title">{{ category.name }}</h1>
      <p class="cat-desc" v-if="category.description">{{ category.description }}</p>
    </div>

    <div class="not-found" v-else-if="!loading && !error">分类不存在</div>

    <PostCard v-for="post in posts" :key="post.id" :post="post" />

    <div class="empty" v-if="!loading && !error && !posts.length">该分类下暂无文章</div>
    <div class="empty" v-if="loading">
      <p class="loading-dots">加载中<span>.</span><span>.</span><span>.</span></p>
    </div>
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
  loading.value = true; error.value = ''
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
.back-link {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 14px; color: var(--text-secondary);
  margin-bottom: 24px; transition: color var(--transition);
}
.back-link:hover { color: var(--accent); }
.error-banner {
  padding: 12px 16px; background: var(--danger-light); color: var(--danger);
  border-radius: var(--radius-sm); margin-bottom: 16px; font-size: 14px;
}
.category-header {
  margin-bottom: 24px; padding-bottom: 18px;
  border-bottom: 2px solid var(--accent);
}
.cat-title {
  font-family: var(--font-serif);
  font-size: 32px; font-weight: 700;
  color: var(--heading);
  margin-bottom: 8px;
}
.cat-desc {
  font-size: 15px; color: var(--text-secondary);
}
.not-found, .empty {
  text-align: center; padding: 48px 0;
  color: var(--text-muted); font-size: 14px;
}
.loading-dots span {
  animation: dot 1.4s infinite; display: inline-block;
}
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dot {
  0%, 80%, 100% { opacity: 0; }
  40% { opacity: 1; }
}
@media (max-width: 768px) { .cat-title { font-size: 26px; } }
</style>
