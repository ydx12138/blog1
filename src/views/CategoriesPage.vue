<template>
  <div class="categories-page">
    <!-- 分类网格索引视图（默认） -->
    <template v-if="!categoryId">
      <div v-if="categoryError" class="error-banner">分类加载失败：{{ categoryError }}</div>

      <header class="hero">
        <h1 class="hero__title">专题，知识集，智慧之光。</h1>
        <p class="hero__caption">{{ categories.length }} 个专题，等待与你相遇</p>
      </header>

      <section v-if="categories.length" class="grid-wrap" aria-label="全部分类">
        <ul class="grid">
          <li v-for="category in pagedCategories" :key="category.id" class="card-cell">
            <router-link
              :to="{ name: 'categories', query: { category_id: category.id } }"
              class="card"
            >
              <div class="card__cover">
                <img
                  :src="category.cover"
                  :alt="category.name"
                  loading="lazy"
                  class="card__img"
                  @error="onCoverError($event)"
                />
                <span class="card__badge">{{ category.article_count }} 篇</span>
              </div>
              <div class="card__body">
                <h3 class="card__title" :title="category.name">{{ category.name }}</h3>
                <div class="card__meta">
                  <span class="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {{ formatViewCount(category.view_count) }}
                  </span>
                  <span class="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="9" />
                      <polyline points="12 7 12 12 15 14" />
                    </svg>
                    {{ formatDate(category.created_at) }}
                  </span>
                </div>
              </div>
            </router-link>
          </li>
        </ul>

        <nav v-if="totalPages > 1" class="pager" aria-label="分页">
          <button
            class="pager__btn pager__btn--nav"
            :disabled="page <= 1"
            type="button"
            aria-label="上一页"
            @click="goPage(page - 1)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="15 6 9 12 15 18" />
            </svg>
          </button>

          <span class="pager__total">共 {{ categories.length }} 条</span>

          <button
            v-for="p in pages"
            :key="`p-${p}`"
            class="pager__btn pager__btn--num"
            :class="{ active: p === page }"
            type="button"
            :aria-current="p === page ? 'page' : undefined"
            @click="goPage(p)"
          >
            {{ p }}
          </button>

          <button
            class="pager__btn pager__btn--nav"
            :disabled="page >= totalPages"
            type="button"
            aria-label="下一页"
            @click="goPage(page + 1)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </button>
        </nav>
      </section>

      <div v-else-if="!loading && !categoryError" class="empty">暂无分类</div>
    </template>

    <!-- 分类文章流视图（点击分类卡后进入） -->
    <template v-else>
      <button class="back-link" type="button" @click="backToIndex">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="15 6 9 12 15 18" />
        </svg>
        <span>返回分类索引</span>
      </button>

      <div v-if="categories.length" class="category-picker" @click.stop>
        <div class="category-strip">
          <div class="category-strip__items">
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
    </template>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getCategories, getCategoryArticlesPage } from '../api/categories.js'
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
const articlePageSize = 10
const gridPageSize = 15
let loadMoreObserver
let requestSequence = 0

const categoryId = computed(() => {
  const value = Number(route.query.category_id)
  return Number.isInteger(value) && value > 0 ? value : 0
})

const topCategories = computed(() => getTopCategories(categories.value, 5))
const filteredCategories = computed(() => filterCategories(categories.value, categorySearch.value))

// 分类网格分页相关
const totalPages = computed(() => Math.max(1, Math.ceil(categories.value.length / gridPageSize)))
const pagedCategories = computed(() => {
  const start = (page.value - 1) * gridPageSize
  return categories.value.slice(start, start + gridPageSize)
})
const pages = computed(() => {
  const t = totalPages.value
  const p = page.value
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1)
  const result = [1]
  const left = Math.max(2, p - 1)
  const right = Math.min(t - 1, p + 1)
  if (left > 2) result.push('...')
  for (let i = left; i <= right; i++) result.push(i)
  if (right < t - 1) result.push('...')
  result.push(t)
  return result
})

function formatViewCount(n) {
  const value = Number(n) || 0
  if (value >= 10000) return `${(value / 10000).toFixed(1).replace(/\.0$/, '')}w`
  return String(value)
}

function formatDate(input) {
  if (!input) return ''
  const date = new Date(input)
  if (Number.isNaN(date.getTime())) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function onCoverError(event) {
  const fallback = '/default-category-cover.jpg'
  if (event?.target && event.target.src !== fallback) {
    event.target.src = fallback
  }
}

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
  if (!categoryId.value) return

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
    const data = await getCategoryArticlesPage(categoryId.value, page.value, articlePageSize)
    if (requestID !== requestSequence) return

    const nextPosts = Array.isArray(data) ? data : data?.list || []
    posts.value = mergeUniquePosts(posts.value, nextPosts)
    total.value = Number(data?.total || 0)
    hasMore.value = getHasMore({ mode: 'category', hasMore: data?.has_more, postsLength: posts.value.length, total: total.value })
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

function toggleCategoryPicker() {
  categoryPickerOpen.value = !categoryPickerOpen.value
  if (!categoryPickerOpen.value) categorySearch.value = ''
}

function closeCategoryPicker() {
  categoryPickerOpen.value = false
  categorySearch.value = ''
}

function handleDocumentClick() {
  closeCategoryPicker()
}

function scrollToCategoryTop() {
  if (!window.matchMedia('(min-width: 769px)').matches) return
  const root = document.documentElement
  const previousBehavior = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'
  window.scrollTo(0, 0)
  if (previousBehavior) root.style.scrollBehavior = previousBehavior
  else root.style.removeProperty('scroll-behavior')
}

// 切换分类：保留现有的文章流筛选行为。
function selectCategory(id) {
  closeCategoryPicker()
  scrollToCategoryTop()
  const query = Number(id) > 0 ? { category_id: String(id) } : {}
  router.push({ name: 'categories', query }).then(() => {
    scrollToCategoryTop()
  })
}

// 网格分页跳转。
function goPage(target) {
  if (target === '...' || !Number.isInteger(target)) return
  if (target < 1 || target > totalPages.value) return
  page.value = target
  scrollToCategoryTop()
}

function backToIndex() {
  router.push({ name: 'categories' }).then(() => {
    scrollToCategoryTop()
  })
}

function retryLoad() {
  return loadPosts(posts.value.length === 0)
}

function ensureArticleListListeners() {
  if (typeof document === 'undefined') return
  document.addEventListener('click', handleDocumentClick)
}

function detachArticleListListeners() {
  if (typeof document === 'undefined') return
  document.removeEventListener('click', handleDocumentClick)
  closeCategoryPicker()
}

onMounted(async () => {
  await loadCategories()
  if (!categoryId.value) return
  ensureArticleListListeners()
  await loadPosts(true)
  loadMoreObserver = new IntersectionObserver((entries) => {
    if (entries[0]?.isIntersecting && hasMore.value) loadPosts()
  }, { rootMargin: '320px 0px' })
  if (loadMoreTrigger.value) loadMoreObserver.observe(loadMoreTrigger.value)
})

watch(categoryId, async (next) => {
  // 进入分类文章流时启用点击关闭分类面板，离开时清理。
  if (next === 0) {
    page.value = 1
    posts.value = []
    total.value = 0
    hasMore.value = true
    detachArticleListListeners()
    return
  }
  ensureArticleListListeners()
  scrollToCategoryTop()
  await loadPosts(true)
})

onUnmounted(() => {
  loadMoreObserver?.disconnect()
  detachArticleListListeners()
})
</script>

<style scoped>
.categories-page { padding: var(--page-top) 0 0; overflow-anchor: none; }

/* ===== Hero ===== */
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 56px 0 38px;
  text-align: center;
}
.hero__title {
  font-family: var(--font-serif);
  font-size: 36px;
  font-weight: 300;
  letter-spacing: 0.08em;
  color: var(--heading);
  margin: 0;
}
.hero__caption {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
  margin: 0;
}
.hero__caption::before,
.hero__caption::after {
  content: '·';
  margin: 0 10px;
  color: var(--accent);
}

/* ===== Error banner ===== */
.error-banner {
  padding: 12px 16px;
  margin-bottom: 18px;
  border: 1px solid var(--danger-light);
  border-radius: var(--radius-sm);
  background: var(--danger-light);
  color: var(--danger);
  font-size: 14px;
}

/* ===== Grid ===== */
.grid-wrap { padding-bottom: 28px; }
.grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 22px 18px;
}
.card-cell { display: flex; min-width: 0; }
.card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: auto;
  border-radius: var(--radius);
  background: var(--bg-card);
  color: var(--text);
  text-decoration: none;
  overflow: hidden;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-light);
  transition: transform 0.32s cubic-bezier(0.2, 0.7, 0.2, 1), box-shadow 0.32s ease, border-color 0.32s ease;
}
.card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: var(--accent-border);
  color: var(--text);
}
.card__cover {
  position: relative;
  flex: 0 0 175px;
  height: 175px;
  overflow: hidden;
  background: var(--border-light);
}
.card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.card:hover .card__img { transform: scale(1.05); }
.card__badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 3px 9px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.04em;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  border-radius: 999px;
  backdrop-filter: blur(6px);
}
.card__body {
  display: flex;
  flex-direction: column;
  aspect-ratio: 5 / 2;
  padding: 14px 16px 14px;
  overflow: hidden;
}
.card__title {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  flex: 1 1 auto;
  min-height: 0;
  margin: 0;
  font-family: var(--font-serif);
  font-size: 15px;
  font-weight: 500;
  color: var(--heading);
  line-height: 1.45;
  overflow: hidden;
  word-break: break-word;
}
.card__meta {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 10px 0 0;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
}
.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}
.meta-item svg { flex: 0 0 auto; opacity: 0.85; }

/* ===== Pager ===== */
.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 48px;
  padding: 16px 0 4px;
}
.pager__total {
  margin: 0 8px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.04em;
}
.pager__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 12px;
  cursor: pointer;
  transition: color var(--transition), border-color var(--transition), background var(--transition);
}
.pager__btn:hover:not(:disabled):not(.active) {
  color: var(--accent);
  border-color: var(--accent-border);
  background: var(--accent-light);
}
.pager__btn--num.active {
  color: var(--accent);
  border-color: var(--accent);
  background: var(--accent-light);
  font-weight: 600;
}
.pager__btn--nav:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ===== Back link (article list view) ===== */
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 18px 0 4px;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--text-secondary);
  font-family: var(--font-serif);
  font-size: 13px;
  cursor: pointer;
  transition: color var(--transition);
}
.back-link:hover { color: var(--accent); }

/* ===== Article list (existing styles, kept) ===== */
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
.category-search { display: flex; flex: 1 1 190px; align-items: center; gap: 6px; height: 30px; padding: 0 10px; border: 1px solid var(--border-light); border-radius: 999px; background: var(--bg); color: var(--text-muted); transition: border-color var(--transition), box-shadow var(--transition); }
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

/* ===== Responsive ===== */
@media (max-width: 900px) {
  .hero__title { font-size: 30px; }
}
@media (max-width: 640px) {
  .grid { gap: 16px 12px; }
  .hero { padding: 36px 0 24px; }
  .hero__title { font-size: 24px; letter-spacing: 0.06em; }
}
@media (max-width: 768px) {
  .categories-page { overflow-anchor: auto; }
  .category-picker { transform: none; }
  .category-strip__items { gap: 20px; }
  .category-panel { width: 100%; }
  .category-search { display: none; }
  .category-option { display: block; min-height: 0; padding: 10px 11px; overflow: hidden; overflow-wrap: normal; text-overflow: ellipsis; white-space: nowrap; }
  .article-feed { margin-top: 0; }
}
</style>