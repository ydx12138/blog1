<template>
  <div class="categories-page">
    <h1 class="page-title">分类</h1>
    <p class="page-desc">按分类浏览文章</p>

    <div class="error-banner" v-if="error">{{ error }}</div>

    <div class="category-grid" v-if="categories.length">
      <router-link
        v-for="cat in categories"
        :key="cat.id"
        :to="`/categories/${cat.id}`"
        class="category-card"
      >
        <div class="cat-info">
          <h2 class="cat-name">{{ cat.name }}</h2>
          <p class="cat-desc" v-if="cat.description">{{ cat.description }}</p>
        </div>
        <div class="cat-count">
          <span class="count-num">{{ catCounts[cat.id] ?? '-' }}</span>
          <span class="count-label">篇</span>
        </div>
      </router-link>
    </div>

    <div class="empty" v-else-if="!loading">暂无分类</div>
    <div class="empty" v-if="loading"><p class="loading-dots">加载中<span>.</span><span>.</span><span>.</span></p></div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getCategories, getCategoryArticles } from '../api/categories.js'

const categories = ref([])
const catCounts = reactive({})
const loading = ref(false)
const error = ref('')

onMounted(async () => {
  loading.value = true; error.value = ''
  try {
    categories.value = await getCategories()
    // 批量获取每个分类的文章数
    await Promise.all(
      categories.value.map(async (cat) => {
        try {
          const articles = await getCategoryArticles(cat.id, 1)
          catCounts[cat.id] = Array.isArray(articles) ? articles.length : 0
        } catch { catCounts[cat.id] = 0 }
      })
    )
  } catch (e) {
    error.value = '加载失败：' + (e.message || '请确认后端服务已启动')
  }
  loading.value = false
})
</script>

<style scoped>
.categories-page { padding: 40px 0; }
.page-title {
  font-family: var(--font-serif);
  font-size: 30px; font-weight: 700;
  color: var(--heading);
  margin-bottom: 6px;
}
.page-desc {
  font-size: 15px; color: var(--text-secondary);
  margin-bottom: 32px;
}
.error-banner {
  padding: 12px 16px; background: var(--danger-light); color: var(--danger);
  border-radius: var(--radius-sm); margin-bottom: 16px; font-size: 14px;
}

.category-grid {
  display: flex; flex-direction: column; gap: 10px;
}
.category-card {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  text-decoration: none;
  transition: all var(--transition);
}
.category-card:hover {
  border-color: var(--accent-border);
  box-shadow: var(--shadow);
  transform: translateX(3px);
}

.cat-info { flex: 1; min-width: 0; }
.cat-name {
  font-family: var(--font-serif);
  font-size: 18px; font-weight: 600;
  color: var(--heading);
  margin-bottom: 4px;
}
.cat-desc {
  font-size: 14px; color: var(--text-secondary);
  line-height: 1.5;
}

.cat-count {
  display: flex; flex-direction: column; align-items: center;
  flex-shrink: 0; margin-left: 20px; padding-left: 20px;
  border-left: 1px solid var(--border-light);
}
.count-num {
  font-family: var(--font-mono);
  font-size: 24px; font-weight: 700;
  color: var(--accent); line-height: 1;
}
.count-label {
  font-size: 11px; color: var(--text-muted);
  margin-top: 4px;
}

.empty {
  text-align: center; padding: 48px 0; color: var(--text-muted); font-size: 14px;
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

@media (max-width: 768px) {
  .page-title { font-size: 26px; }
  .category-card { padding: 16px 18px; }
  .cat-name { font-size: 16px; }
  .count-num { font-size: 20px; }
}
</style>
