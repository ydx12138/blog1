<template>
  <div class="app-inner" :class="{ 'has-sidebar': !isAdminRoute }">
    <SiteHeader v-if="!isAdminRoute" />
    <main class="main-content">
      <template v-if="isAdminRoute">
        <router-view />
      </template>
      <template v-else>
        <div class="global-search-shell">
          <div class="global-search-shell__inner">
            <HomeSearch />
          </div>
        </div>
        <FrontendLayout>
          <router-view />
          <SiteFooter />
        </FrontendLayout>
      </template>
    </main>
    <NoticeCenter />
  </div>
</template>

<script setup>
import { computed, provide, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { searchArticleResults } from './api/articles.js'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import NoticeCenter from './components/NoticeCenter.vue'
import HomeSearch from './components/HomeSearch.vue'
import FrontendLayout from './layouts/FrontendLayout.vue'

const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
const searchKeyword = ref('')
const searchResults = ref([])
const searchLoading = ref(false)
const searchActive = ref(false)
const searchError = ref('')
const searchedKeyword = ref('')
const searchVersion = ref(0)
const searchDuration = ref(0)
let searchRequestID = 0

// 清空搜索状态；参数和返回值均为空，用于恢复首页无限滚动列表。
function resetSearch() {
  searchRequestID += 1
  searchLoading.value = false
  searchResults.value = []
  searchActive.value = false
  searchError.value = ''
  searchedKeyword.value = ''
  searchDuration.value = 0
  searchVersion.value += 1
}

// 执行独立搜索页请求；参数 keyword 为搜索词，返回值为空，结果通过注入状态提供给搜索结果页。
async function runSearch(keyword) {
  keyword = String(keyword || '').trim()
  if (!keyword) {
    resetSearch()
    return
  }

  const requestID = ++searchRequestID
  const startedAt = performance.now()
  searchVersion.value += 1
  searchLoading.value = true
  searchActive.value = false
  searchResults.value = []
  searchError.value = ''

  try {
    const data = await searchArticleResults(keyword)
    const elapsed = performance.now() - startedAt
    searchDuration.value = elapsed / 1000
    await new Promise((resolve) => setTimeout(resolve, Math.max(0, 700 - elapsed)))
    if (requestID !== searchRequestID) return
    searchResults.value = Array.isArray(data) ? data : data?.list || []
    searchedKeyword.value = keyword
    searchActive.value = true
  } catch (error) {
    if (requestID !== searchRequestID) return
    const elapsed = performance.now() - startedAt
    await new Promise((resolve) => setTimeout(resolve, Math.max(0, 700 - elapsed)))
    if (requestID !== searchRequestID) return
    searchError.value = error.message || '搜索失败，请稍后重试'
    searchedKeyword.value = keyword
    searchActive.value = true
  } finally {
    if (requestID === searchRequestID) searchLoading.value = false
  }
}

watch(searchKeyword, (keyword) => {
  if (!keyword.trim()) resetSearch()
})

provide('homeSearch', {
  keyword: searchKeyword,
  results: searchResults,
  loading: searchLoading,
  active: searchActive,
  error: searchError,
  searchedKeyword,
  version: searchVersion,
  duration: searchDuration,
  run: runSearch,
  reset: resetSearch,
})
</script>

<style scoped>
.global-search-shell {
  width: min(100%, 1120px);
  padding-top: 24px;
  margin: 0 auto;
}

.global-search-shell__inner { width: min(100%, 720px); }

@media (max-width: 1040px) {
  .global-search-shell { display: none; }
}
</style>
