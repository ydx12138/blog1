<template>
  <section class="home-search" aria-label="文章搜索">
    <form class="search-form" role="search" @submit.prevent="submitSearch">
      <div class="search-bar">
        <div class="search-control">
          <svg class="search-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <input
            v-model="search.keyword.value"
            class="search-input"
            type="search"
            autocomplete="off"
            placeholder="搜索文章..."
            aria-label="搜索文章"
            :aria-expanded="showSuggestions"
            aria-controls="home-search-suggestions"
            @focus="suggestionsFocused = true"
            @keydown.esc="suggestionsFocused = false"
          />
        </div>
        <button class="search-button" type="submit" :disabled="search.loading.value">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <span>搜索</span>
        </button>
      </div>

      <ul
        v-if="showSuggestions"
        id="home-search-suggestions"
        class="search-suggestions"
        role="listbox"
        aria-label="搜索建议"
      >
        <li v-for="article in suggestions" :key="article.id" role="option">
          <button type="button" @mousedown.prevent="chooseSuggestion(article)">
            <span class="suggestion-title">
              <template v-for="(part, index) in splitText(article.title)" :key="`title-${index}`">
                <mark v-if="part.highlighted">{{ part.text }}</mark>
                <template v-else>{{ part.text }}</template>
              </template>
            </span>
            <span class="suggestion-excerpt">
              <template v-for="(part, index) in splitText(article.search_excerpt || article.summary)" :key="`excerpt-${index}`">
                <mark v-if="part.highlighted">{{ part.text }}</mark>
                <template v-else>{{ part.text }}</template>
              </template>
            </span>
          </button>
        </li>
      </ul>
    </form>

    <div
      :key="search.version.value"
      class="search-line"
      :class="{ 'search-line--active': search.loading.value || search.active.value }"
      aria-hidden="true"
    ></div>
  </section>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { searchArticleSuggestions } from '../api/articles.js'

const search = inject('homeSearch')
const route = useRoute()
const router = useRouter()
const suggestions = ref([])
const suggestionsFocused = ref(false)
const suggestionsLoading = ref(false)
let suggestionsTimer
let suggestionsRequestID = 0

const showSuggestions = computed(() => (
  suggestionsFocused.value &&
  !suggestionsLoading.value &&
  Boolean(search.keyword.value.trim()) &&
  suggestions.value.length > 0
))

watch(() => search.keyword.value, (value) => {
  clearTimeout(suggestionsTimer)
  suggestionsRequestID += 1
  suggestions.value = []
  const keyword = value.trim()
  if (!keyword) return

  const requestID = suggestionsRequestID
  suggestionsTimer = setTimeout(() => fetchSuggestions(keyword, requestID), 220)
})

// 获取搜索建议；参数 keyword 为输入关键词、requestID 为请求版本，返回值为空并更新建议列表。
async function fetchSuggestions(keyword, requestID) {
  suggestionsLoading.value = true
  try {
    const data = await searchArticleSuggestions(keyword)
    if (requestID === suggestionsRequestID) suggestions.value = Array.isArray(data) ? data : []
  } catch {
    if (requestID === suggestionsRequestID) suggestions.value = []
  } finally {
    if (requestID === suggestionsRequestID) suggestionsLoading.value = false
  }
}

// 提交搜索并跳转独立结果页；参数和返回值为空，空关键词会返回首页。
function submitSearch() {
  const keyword = search.keyword.value.trim()
  suggestionsFocused.value = false
  if (!keyword) {
    search.reset()
    if (route.name === 'search') router.push({ name: 'home' })
    return
  }
  if (route.name === 'search' && route.query.keyword === keyword) {
    search.run(keyword)
    return
  }
  router.push({ name: 'search', query: { keyword } })
}

// 选择真实建议文章；参数 article 为建议文章，返回值为空并直接跳转文章详情页。
function chooseSuggestion(article) {
  suggestionsFocused.value = false
  router.push({ name: 'post-detail', params: { id: article.id } })
}

// 将关键词匹配文本拆分为安全片段；参数 value 为待处理文本，返回带高亮标记的片段数组。
function splitText(value) {
  const text = String(value || '')
  const keyword = search.keyword.value.trim()
  if (!keyword) return [{ text, highlighted: false }]
  const matcher = new RegExp(`(${escapeRegExp(keyword)})`, 'gi')
  return text.split(matcher).filter(Boolean).map((part) => ({
    text: part,
    highlighted: part.toLocaleLowerCase() === keyword.toLocaleLowerCase(),
  }))
}

// 转义正则特殊字符；参数为用户输入关键词，返回可安全用于正则的文本。
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

onBeforeUnmount(() => clearTimeout(suggestionsTimer))
</script>

<style scoped>
.home-search { width: 100%; }
.search-form { position: relative; width: min(100%, 620px); }
.search-bar {
  display: flex;
  width: 100%;
  height: 42px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--bg-card);
  transition: border-color var(--transition), box-shadow var(--transition);
}
.search-bar:focus-within {
  border-color: var(--accent-border);
  box-shadow: 0 0 0 3px var(--accent-light);
}
.search-control { display: flex; align-items: center; min-width: 0; flex: 1; gap: 8px; padding-left: 15px; }
.search-icon { flex: 0 0 auto; color: var(--text-muted); }
.search-input {
  min-width: 0;
  flex: 1;
  height: 100%;
  padding: 0 8px 0 0;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--heading);
  font: inherit;
  font-size: 13px;
}
.search-input::placeholder { color: var(--text-muted); }
.search-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex: 0 0 72px;
  height: 42px;
  border: 0;
  border-radius: 0 999px 999px 0;
  background: var(--accent);
  color: #fff;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
  transition: background var(--transition), opacity var(--transition);
}
.search-button:hover:not(:disabled) { background: var(--accent-hover); }
.search-button:disabled { cursor: wait; opacity: 0.7; }
.search-suggestions {
  position: absolute;
  z-index: 20;
  top: 50px;
  right: 0;
  left: 0;
  max-height: 430px;
  margin: 0;
  padding: 6px 0;
  overflow-y: auto;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  box-shadow: 0 10px 24px rgba(31, 35, 41, 0.12);
  list-style: none;
}
.search-suggestions button {
  display: block;
  width: 100%;
  padding: 9px 14px;
  border: 0;
  background: transparent;
  color: var(--text-secondary);
  text-align: left;
  font: inherit;
  cursor: pointer;
}
.search-suggestions button:hover,
.search-suggestions button:focus-visible { outline: 0; background: var(--border-light); }
.suggestion-title { display: block; overflow: hidden; color: var(--heading); font-size: 13px; line-height: 1.45; text-overflow: ellipsis; white-space: nowrap; }
.suggestion-excerpt { display: -webkit-box; margin-top: 2px; overflow: hidden; color: var(--text-muted); font-size: 12px; line-height: 1.45; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.search-suggestions mark { padding: 0 1px; background: #ffe57f; color: inherit; }
.search-line { width: 100%; height: 3px; margin-top: 12px; transform: scaleX(0); transform-origin: center; border-radius: 999px; background: var(--accent); opacity: 0; }
.search-line--active { opacity: 1; animation: search-line-expand 0.5s cubic-bezier(0.22, 0.61, 0.36, 1) forwards; }
@keyframes search-line-expand { from { transform: scaleX(0); } to { transform: scaleX(1); } }
</style>
