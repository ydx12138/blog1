<template>
  <div class="search-results-page">
    <header class="search-results-header">
      <div class="results-title">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
        <h1>搜索结果</h1>
      </div>
      <p v-if="!searchLoading && !searchError" class="result-count">
        找到关于 <strong>「{{ keyword }}」</strong> 的 {{ searchResults.length }} 条结果
        <span v-if="searchDuration">（用时 {{ searchDuration.toFixed(3) }} 秒）</span>
      </p>
      <p v-else-if="searchLoading" class="result-count">正在搜索文章...</p>
      <p v-else class="result-count result-count--error">{{ searchError }}</p>
    </header>

    <section class="results-panel">
      <div class="results-tab">文章</div>
      <PostList
        :posts="searchResults"
        :loading="searchLoading"
        :highlight="keyword"
        variant="search"
      />
    </section>
  </div>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import PostList from '../components/PostList.vue'

const route = useRoute()
const search = inject('homeSearch')
const keyword = computed(() => String(route.query.keyword || '').trim())
const searchResults = computed(() => search.results.value)
const searchLoading = computed(() => search.loading.value)
const searchError = computed(() => search.error.value)
const searchDuration = computed(() => search.duration.value)

// 根据 URL 关键词加载结果页数据；参数 value 为路由查询词，返回值为空。
function loadResults(value) {
  const query = String(value || '').trim()
  search.keyword.value = query
  if (!query) {
    search.reset()
    return
  }
  search.run(query)
}

watch(() => route.query.keyword, loadResults, { immediate: true })
onBeforeUnmount(() => search.reset())
</script>

<style scoped>
.search-results-page { padding-top: var(--page-top); }
.search-results-header { padding: 28px 0 30px; text-align: center; }
.results-title { display: inline-flex; align-items: center; gap: 12px; color: var(--heading); }
.results-title svg { color: var(--heading); }
.results-title h1 { margin: 0; font-family: var(--font-serif); font-size: 30px; font-weight: 600; }
.result-count { margin-top: 12px; color: var(--text-secondary); font-size: 14px; }
.result-count strong { color: var(--heading); font-weight: 600; }
.result-count--error { color: var(--danger); }
.results-panel { padding: 0 18px 18px; background: var(--bg-card); }
.results-tab { display: inline-block; padding: 16px 4px 12px; border-bottom: 2px solid var(--heading); color: var(--heading); font-family: var(--font-serif); font-size: 15px; }
</style>
