<template>
  <div class="categories-page">
    <div v-if="categoryError" class="error-banner">分类加载失败：{{ categoryError }}</div>

    <div v-if="categories.length" class="category-picker" @click.stop>
      <div class="category-strip">
        <div class="category-strip__items">
          <button
            class="category-tab"
            :class="{ active: categoryId === 0 }"
            type="button"
            @click="selectCategory(0)"
          >
            全部文章
          </button>
          <button
            v-for="category in topCategories"
            :key="category.id"
            class="category-tab"
            :class="{ active: categoryId === Number(category.id) }"
            type="button"
            @click="selectCategory(category.id)"
          >
            {{ category.name }}
          </button>
        </div>
        <button
          class="category-toggle"
          :class="{ open: categoryPickerOpen }"
          type="button"
          aria-label="展开全部分类"
          :aria-expanded="categoryPickerOpen"
          @click="toggleCategoryPicker"
        >
          <svg class="category-toggle__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="15 6 9 12 15 18" />
          </svg>
        </button>
      </div>

      <Transition name="category-dropdown">
        <div v-if="categoryPickerOpen" class="category-panel">
          <div class="panel-heading">
            <span class="panel-heading__title">全部分类</span>
            <label class="category-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-4-4" />
              </svg>
              <input
                v-model="categorySearch"
                type="search"
                autocomplete="off"
                placeholder="搜索分类..."
                aria-label="搜索分类"
                @keydown.esc.stop="categorySearch = ''"
              />
            </label>
            <small>{{ categories.length }} 个分类</small>
          </div>
          <div class="category-options" role="listbox" aria-label="全部分类选项">
            <button
              class="category-option"
              :class="{ active: categoryId === 0 }"
              type="button"
              role="option"
              :aria-selected="categoryId === 0"
              @click="selectCategory(0)"
            >
              全部文章
            </button>
            <button
              v-for="category in filteredCategories"
              :key="category.id"
              class="category-option"
              :class="{ active: categoryId === Number(category.id) }"
              type="button"
              role="option"
              :aria-selected="categoryId === Number(category.id)"
              @click="selectCategory(category.id)"
            >
              {{ category.name }}
            </button>
            <p v-if="categorySearch.trim() && !filteredCategories.length" class="category-search-empty">
              没有匹配的分类
            </p>
          </div>
        </div>
      </Transition>
    </div>

    <section class="article-feed" aria-live="polite">
      <div class="feed-heading">
        <span class="feed-count">{{ total ? `${total} 篇文章` : `${posts.length} 篇已加载` }}</span>
      </div>

      <PostList
        :posts="posts"
        :loading="loading"
        :loading-more="loadingMore"
        :has-more="hasMore"
        continuous
      />

      <div v-if="loadError && !loading" class="load-error">
        <p>{{ loadError }}</p>
        <button type="button" @click="retryLoad">重新加载</button>
      </div>
      <div ref="loadMoreTrigger" class="load-more-trigger" aria-hidden="true"></div>
    </section>

    <div v-if="!loading && !loadError && !posts.length" class="empty">该分类下暂时没有文章</div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCategories, getCategoryArticlesPage } from '../api/categories.js'
import { getArticles } from '../api/articles.js'
import PostList from '../components/PostList.vue'
import { getHasMore, mergeUniquePosts } from '../utils/infiniteList.js'
import { filterCategories, getTopCategories } from '../utils/categoryDisplay.js'

const route = useRoute()
const router = useRouter()
const categories = ref([])
const posts = ref([])
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const total = ref(0)
const page = ref(1)
const categoryError = ref('')
const loadError = ref('')
const categoryPickerOpen = ref(false)
const categorySearch = ref('')
const loadMoreTrigger = ref(null)
const pageSize = 10
let loadMoreObserver
let requestSequence = 0

const categoryId = computed(() => {
  const value = Number(route.query.category_id)
  return Number.isInteger(value) && value > 0 ? value : 0
})

const topCategories = computed(() => getTopCategories(categories.value, 5))
const filteredCategories = computed(() => filterCategories(categories.value, categorySearch.value))

// 加载分类选项；参数无；返回值无，结果写入分类选项状态。
async function loadCategories() {
  try {
    categories.value = await getCategories()
  } catch (error) {
    categoryError.value = error.message || '分类加载失败，请稍后重试'
  }
}

// 加载当前分类的一批文章；参数 reset 表示是否清空旧列表；返回值无，结果写入文章流状态。
async function loadPosts(reset = false) {
  if (loading.value || loadingMore.value) return
  if (!reset && !hasMore.value) return

  const requestID = ++requestSequence
  if (reset) {
    page.value = 1
    posts.value = []
    total.value = 0
    hasMore.value = true
  }

  const firstBatch = posts.value.length === 0
  if (firstBatch) loading.value = true
  else loadingMore.value = true
  loadError.value = ''

  try {
    const data = categoryId.value
      ? await getCategoryArticlesPage(categoryId.value, page.value, pageSize)
      : await getArticles(page.value, pageSize)
    if (requestID !== requestSequence) return

    const nextPosts = Array.isArray(data) ? data : data?.list || []
    posts.value = mergeUniquePosts(posts.value, nextPosts)
    total.value = Number(data?.total || 0)
    hasMore.value = categoryId.value
      ? getHasMore({ mode: 'category', hasMore: data?.has_more, postsLength: posts.value.length, total: total.value })
      : getHasMore({ mode: 'all', postsLength: posts.value.length, total: total.value })
    page.value = Number(data?.next_page) || page.value + 1
    await nextTick()
  } catch (error) {
    if (requestID === requestSequence) loadError.value = error.message || '文章加载失败，请稍后重试'
  } finally {
    if (requestID !== requestSequence) return
    loading.value = false
    loadingMore.value = false
  }
}

// 打开或收起分类面板；参数无；返回值无。
function toggleCategoryPicker() {
  categoryPickerOpen.value = !categoryPickerOpen.value
  if (!categoryPickerOpen.value) categorySearch.value = ''
}

// 关闭分类面板；参数无；返回值无。
function closeCategoryPicker() {
  categoryPickerOpen.value = false
  categorySearch.value = ''
}

// 处理页面点击事件并关闭分类面板；参数无；返回值无。
function handleDocumentClick() {
  closeCategoryPicker()
}

// 将 PC 端分类页立即滚回顶部；参数无；返回值无，用于避免文章列表刷新时保留旧滚动锚点。
function scrollToCategoryTop() {
  if (!window.matchMedia('(min-width: 769px)').matches) return
  const root = document.documentElement
  const previousBehavior = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'
  window.scrollTo(0, 0)
  if (previousBehavior) root.style.scrollBehavior = previousBehavior
  else root.style.removeProperty('scroll-behavior')
}

// 切换文章分类并同步地址；参数为分类 ID，0 代表全部文章；返回值无。
function selectCategory(id) {
  closeCategoryPicker()
  scrollToCategoryTop()
  const query = Number(id) > 0 ? { category_id: String(id) } : {}
  router.push({ name: 'categories', query }).then(() => {
    scrollToCategoryTop()
  })
}

// 重新加载当前文章批次；参数无；返回值为加载请求的 Promise。
function retryLoad() {
  return loadPosts(posts.value.length === 0)
}

onMounted(async () => {
  document.addEventListener('click', handleDocumentClick)
  await loadCategories()
  await loadPosts(true)
  loadMoreObserver = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting && hasMore.value) loadPosts()
  }, { rootMargin: '320px 0px' })
  if (loadMoreTrigger.value) loadMoreObserver.observe(loadMoreTrigger.value)
})

watch(categoryId, () => {
  scrollToCategoryTop()
  loadPosts(true)
})

onUnmounted(() => {
  loadMoreObserver?.disconnect()
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<style scoped>
.categories-page { padding: 5px 0 0; overflow-anchor: none; }
.error-banner {
  padding: 12px 16px;
  margin-bottom: 18px;
  border: 1px solid var(--danger-light);
  border-radius: var(--radius-sm);
  background: var(--danger-light);
  color: var(--danger);
  font-size: 14px;
}
.category-picker { position: relative; z-index: 5; width: 100%; }
.category-strip {
  display: flex;
  align-items: stretch;
  min-height: 48px;
  border-bottom: 1px solid var(--border);
}
.category-strip__items {
  display: flex;
  flex: 1;
  align-items: stretch;
  gap: 24px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.category-strip__items::-webkit-scrollbar { display: none; }
.category-tab {
  position: relative;
  flex: 0 0 auto;
  padding: 0 0 12px;
  border: 0;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  white-space: nowrap;
  transition: color var(--transition);
}
.category-tab::after {
  position: absolute;
  right: 0;
  bottom: -1px;
  left: 0;
  height: 2px;
  background: var(--accent);
  content: '';
  transform: scaleX(0);
  transition: transform var(--transition);
}
.category-tab:hover, .category-tab.active { color: var(--accent); }
.category-tab.active::after { transform: scaleX(1); }
.category-toggle {
  display: inline-flex;
  flex: 0 0 46px;
  align-items: center;
  justify-content: center;
  margin-left: 12px;
  border: 0;
  border-left: 1px solid var(--border-light);
  background: var(--bg);
  color: var(--text-secondary);
  cursor: pointer;
  transition: color var(--transition), background var(--transition);
}
.category-toggle:hover, .category-toggle:focus-visible { background: var(--accent-light); color: var(--accent); outline: none; }
.category-toggle__icon { transform: rotate(0deg); transition: transform var(--transition-slow); }
.category-toggle.open .category-toggle__icon { transform: rotate(-90deg); }
.category-panel {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  width: calc(100% - 58px);
  max-width: none;
  height: 280px;
  padding: 16px;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-card);
  box-shadow: var(--shadow-lg);
}
.panel-heading { display: flex; align-items: center; gap: 12px; min-height: 32px; margin-bottom: 12px; color: var(--heading); font-size: 14px; font-weight: 600; }
.panel-heading__title { flex: 0 0 auto; white-space: nowrap; }
.panel-heading small { flex: 0 0 auto; margin-left: auto; color: var(--text-muted); font-family: var(--font-mono); font-size: 10px; font-weight: 400; white-space: nowrap; }
.category-search { display: flex; flex: 0 1 190px; align-items: center; gap: 6px; height: 30px; padding: 0 10px; border: 1px solid var(--border-light); border-radius: 999px; background: var(--bg); color: var(--text-muted); transition: border-color var(--transition), box-shadow var(--transition); }
.category-search:focus-within { border-color: var(--accent-border); box-shadow: 0 0 0 3px var(--accent-light); color: var(--accent); }
.category-search svg { flex: 0 0 auto; }
.category-search input { width: 100%; min-width: 0; border: 0; outline: 0; background: transparent; color: var(--heading); font: inherit; font-size: 12px; font-weight: 400; }
.category-search input::placeholder { color: var(--text-muted); }
.category-options { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: minmax(40px, max-content); align-content: start; gap: 4px; height: calc(100% - 44px); overflow-y: auto; padding-right: 4px; }
.category-option { display: flex; align-items: center; min-width: 0; min-height: 40px; padding: 8px 11px; border: 1px solid transparent; border-radius: var(--radius-sm); background: transparent; color: var(--text-secondary); cursor: pointer; font-family: inherit; font-size: 13px; text-align: left; overflow-wrap: anywhere; white-space: normal; transition: color var(--transition), border-color var(--transition), background var(--transition), transform var(--transition); }
.category-option:hover, .category-option:focus-visible { border-color: var(--border); background: var(--accent-light); color: var(--accent); outline: none; transform: translateX(2px); }
.category-option.active { border-color: var(--accent-border); background: var(--accent-light); color: var(--accent); font-weight: 600; }
.category-search-empty { display: grid; grid-column: 1 / -1; min-height: 120px; place-items: center; color: var(--text-muted); font-size: 12px; text-align: center; }
.category-dropdown-enter-active, .category-dropdown-leave-active { transition: opacity var(--transition-slow), transform var(--transition-slow); transform-origin: top left; }
.category-dropdown-enter-from, .category-dropdown-leave-to { opacity: 0; transform: translateY(-8px) scaleY(0.96); }
.article-feed { padding-top: 28px; margin-top: 11px; }
.feed-heading { display: flex; align-items: flex-end; justify-content: flex-end; gap: 20px; padding-bottom: 18px; }
.feed-count { flex: 0 0 auto; color: var(--text-muted); font-family: var(--font-mono); font-size: 11px; }
.load-more-trigger { height: 1px; }
.load-error { display: flex; align-items: center; justify-content: center; gap: 14px; padding: 22px 0 4px; color: var(--danger); font-size: 13px; }
.load-error p { margin: 0; }
.load-error button { border: 0; background: transparent; color: var(--accent); cursor: pointer; font-size: 13px; }
.empty { padding: 64px 0; color: var(--text-muted); font-size: 14px; text-align: center; }

@media (max-width: 768px) {
  .categories-page { padding-top: 26px; overflow-anchor: auto; }
  .category-picker { transform: none; }
  .category-strip__items { gap: 20px; }
  .category-panel { width: 100%; }
  .category-search { display: none; }
  .category-option { display: block; min-height: 0; padding: 10px 11px; overflow: hidden; overflow-wrap: normal; text-overflow: ellipsis; white-space: nowrap; }
  .article-feed { margin-top: 0; }
}
</style>
