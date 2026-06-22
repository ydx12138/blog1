<template>
  <div class="home-page">
    <div class="error-banner" v-if="error">{{ error }}</div>
    <PostList
      :posts="posts"
      :loading="loading"
      :page="page"
      :total="total"
      :page-size="pageSize"
      @page-change="goPage"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getArticles } from '../api/articles.js'
import PostList from '../components/PostList.vue'

const posts = ref([])
const loading = ref(false)
const error = ref('')
const page = ref(1)
const total = ref(0)
const pageSize = 10

async function fetchArticles() {
  loading.value = true
  error.value = ''
  try {
    const data = await getArticles(page.value, pageSize)
    posts.value = data.list || []
    total.value = data.total || 0
  } catch (e) {
    error.value = '加载失败：' + (e.message || '请确认后端服务已启动')
  }
  loading.value = false
}

function goPage(p) {
  page.value = p
  fetchArticles()
}

onMounted(() => fetchArticles())
</script>

<style scoped>
.home-page { padding: 40px 0; }
.error-banner {
  padding: 12px 16px;
  background: var(--danger-light); color: var(--danger);
  border-radius: var(--radius-sm); margin-bottom: 16px; font-size: 14px;
}
</style>
