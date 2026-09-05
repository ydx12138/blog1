<template>
  <div class="tags-page">
    <header class="tags-header">
      <h1 class="tags-title">标签</h1>
      <p class="tags-subtitle">
        <template v-if="tags.length">{{ tags.length }} 个标签，穿梭于文章之间</template>
        <template v-else>所有标签都会沉淀在这里</template>
      </p>
    </header>

    <div class="tag-cloud" v-if="tags.length">
      <button
        v-for="item in tags"
        :key="item.name"
        class="tag-pill"
        :class="{ 'tag-pill--active': item.name === activeTag }"
        @click="selectTag(item.name)"
      >
        {{ item.name }}
        <span class="tag-pill__count">{{ item.count }}</span>
      </button>
    </div>
    <div class="empty" v-else-if="!loadingTags">暂无标签</div>

    <section class="tag-articles" v-if="activeTag">
      <div class="tag-articles-head">
        <h2 class="tag-articles-title">「{{ activeTag }}」的文章</h2>
        <span class="tag-articles-count">共 {{ total }} 篇</span>
      </div>
      <PostList
        :posts="posts"
        :loading="loading"
        :page="page"
        :total="total"
        :page-size="pageSize"
        @page-change="changePage"
      />
    </section>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchTagCloud, getArticlesByTag } from '../api/tags.js'
import PostList from '../components/PostList.vue'

const route = useRoute()
const router = useRouter()

const tags = ref([])
const loadingTags = ref(false)
const activeTag = ref('')
const posts = ref([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = 10

async function loadTags() {
  loadingTags.value = true
  try {
    tags.value = await fetchTagCloud()
  } catch (e) {
    console.error('加载标签失败:', e)
  }
  loadingTags.value = false
}

async function loadArticles(tag, p) {
  loading.value = true
  try {
    const data = await getArticlesByTag(tag, p, pageSize)
    posts.value = data.list || []
    total.value = data.total || 0
  } catch (e) {
    console.error('加载标签文章失败:', e)
  }
  loading.value = false
}

function selectTag(name) {
  if (name === activeTag.value) return
  activeTag.value = name
  page.value = 1
  router.replace({ query: { tag: name } })
  loadArticles(name, 1)
}

function changePage(p) {
  page.value = p
  loadArticles(activeTag.value, p)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 根据 URL 的 tag 参数同步选中标签与文章列表；无参数；返回值为空。
function syncFromQuery() {
  const t = String(route.query.tag || '').trim()
  if (t && t !== activeTag.value) {
    activeTag.value = t
    page.value = 1
    loadArticles(t, 1)
  } else if (!t && activeTag.value) {
    activeTag.value = ''
    posts.value = []
    total.value = 0
    page.value = 1
  }
}

onMounted(() => {
  loadTags()
  syncFromQuery()
})
watch(() => route.query.tag, syncFromQuery)
</script>

<style scoped>
.tags-page { padding: var(--page-top) 0; }

.tags-header { padding: 0 0 26px; text-align: center; }
.tags-title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 34px;
  font-weight: 700;
  color: var(--heading);
  letter-spacing: 0.04em;
}
.tags-subtitle {
  margin: 12px 0 0;
  color: var(--text-muted);
  font-size: 14px;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  padding: 26px 0 8px;
  border-top: 1px solid var(--border-light);
}
.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--bg-card);
  color: var(--text-secondary);
  font-family: var(--font-sans);
  font-size: 13px;
  cursor: pointer;
  transition: all var(--transition);
}
.tag-pill:hover {
  color: var(--heading);
  border-color: var(--accent-border);
  transform: translateY(-1px);
}
.tag-pill--active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  font-weight: 600;
}
.tag-pill--active:hover { color: #fff; }
.tag-pill__count {
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 999px;
  background: var(--tag-bg);
  color: var(--tag-text);
}
.tag-pill--active .tag-pill__count {
  background: rgba(255, 255, 255, 0.22);
  color: #fff;
}

.empty {
  padding: 48px 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}

.tag-articles { margin-top: 24px; }
.tag-articles-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 14px;
  border-bottom: 2px solid var(--accent);
}
.tag-articles-title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: 600;
  color: var(--heading);
}
.tag-articles-count {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
}
</style>
