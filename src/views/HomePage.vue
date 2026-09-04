<template>
  <div class="home-page">
    <div class="error-banner" v-if="error">{{ error }}</div>
    <PostList
      :posts="posts"
      :loading="loading"
      :loading-more="loadingMore"
      :has-more="hasMore"
      continuous
    />
    <div ref="loadMoreTrigger" class="load-more-trigger" aria-hidden="true"></div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { getArticles } from '../api/articles.js'
import PostList from '../components/PostList.vue'

const posts = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const error = ref('')
const page = ref(1)
const total = ref(0)
const loadMoreTrigger = ref(null)
const pageSize = 10
let loadMoreObserver

const hasMore = computed(() => posts.value.length < total.value)

// fetchArticles 获取首页下一页文章；参数 reset 表示是否从第一页重新加载；返回请求结果。
async function fetchArticles(reset = false) {
  if (loading.value || loadingMore.value) return
  if (reset) {
    page.value = 1
    posts.value = []
    total.value = 0
  }
  if (!reset && !hasMore.value && total.value > 0) return

  const isInitialLoad = posts.value.length === 0
  if (isInitialLoad) loading.value = true
  else loadingMore.value = true
  error.value = ''
  try {
    const data = await getArticles(page.value, pageSize)
    const nextPosts = data.list || []
    const knownIDs = new Set(posts.value.map((post) => post.id))
    posts.value.push(...nextPosts.filter((post) => !knownIDs.has(post.id)))
    total.value = data.total || 0
    if (nextPosts.length) page.value += 1
  } catch (e) {
    error.value = '加载失败：' + (e.message || '请确认后端服务已启动')
  } finally {
    loading.value = false
    loadingMore.value = false
    if (hasMore.value && loadMoreTrigger.value?.getBoundingClientRect().top <= window.innerHeight + 320) {
      fetchArticles()
    }
  }
}

onMounted(() => {
  fetchArticles(true)
  loadMoreObserver = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting && hasMore.value) fetchArticles()
  }, { rootMargin: '320px 0px' })
  if (loadMoreTrigger.value) loadMoreObserver.observe(loadMoreTrigger.value)
})

onUnmounted(() => loadMoreObserver?.disconnect())
</script>

<style scoped>
.home-page { padding: var(--page-top) 0 0; }
.load-more-trigger { height: 1px; }
.error-banner {
  padding: 12px 16px;
  background: var(--danger-light); color: var(--danger);
  border-radius: var(--radius-sm); margin-bottom: 16px; font-size: 14px;
}
</style>
