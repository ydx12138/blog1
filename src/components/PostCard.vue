<template>
  <article class="post-card" :class="{ 'post-card--search': variant === 'search' }" @click="goPost">
    <!-- 封面图 -->
    <div class="post-cover" v-if="post.cover && variant !== 'search'">
      <img :src="post.cover" :alt="post.title" @error="onCoverError" />
    </div>
    <div class="post-body">
      <span class="post-title">
        <template v-for="(part, index) in highlightedTitle" :key="`title-${index}`">
          <mark v-if="part.highlighted" class="search-highlight">{{ part.text }}</mark>
          <template v-else>{{ part.text }}</template>
        </template>
      </span>
      <p class="post-excerpt" v-if="excerptText">
        <template v-for="(part, index) in highlightedSummary" :key="`summary-${index}`">
          <mark v-if="part.highlighted" class="search-highlight">{{ part.text }}</mark>
          <template v-else>{{ part.text }}</template>
        </template>
      </p>
      <div class="post-meta">
        <time class="post-date" :datetime="post.created_at">{{ formattedDate }}</time>
        <span class="meta-sep" v-if="post.category_name">·</span>
        <span class="post-category" v-if="post.category_name">{{ post.category_name }}</span>

        <!-- 统计数据 -->
        <span class="post-stats">
          <span class="stat" title="阅读">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {{ fmt(post.view_count) }}
          </span>
          <span class="stat" title="点赞">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/></svg>
            {{ fmt(post.like_count) }}
          </span>
          <span class="stat" title="评论">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {{ fmt(post.comment_count) }}
          </span>
        </span>
      </div>

      <!-- 标签 -->
      <div class="post-tags" v-if="tags.length">
        <router-link
          v-for="t in tags"
          :key="t"
          class="tag"
          :to="{ path: '/tags', query: { tag: t } }"
          @click.stop
        >{{ t }}</router-link>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
  post: { type: Object, required: true },
  highlight: { type: String, default: '' },
  variant: { type: String, default: 'default' },
})

function goPost() {
  router.push(`/posts/${props.post.id}`)
}

const formattedDate = computed(() => {
  const d = new Date(props.post.created_at)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
})

const tags = computed(() => {
  if (!props.post.tags) return []
  if (Array.isArray(props.post.tags)) return props.post.tags
  return props.post.tags.split(',').map(t => t.trim()).filter(Boolean)
})

const highlightedTitle = computed(() => splitHighlightedText(props.post.title))
const excerptText = computed(() => props.post.search_excerpt || props.post.summary || '')
const highlightedSummary = computed(() => splitHighlightedText(excerptText.value))

// 将匹配词拆成安全文本片段；参数为待处理文本，返回带高亮标记的片段数组。
function splitHighlightedText(value) {
  const text = String(value ?? '')
  const keyword = props.highlight.trim()
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

function fmt(n) {
  if (n == null) return '0'
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

function onCoverError(e) {
  e.target.parentElement.style.display = 'none'
}
</script>

<style scoped>
.post-card {
  display: flex;
  gap: 20px;
  padding: 24px 20px;
  margin: 0 -20px;
  border-bottom: 1px solid var(--border-light);
  border-radius: var(--radius);
  transition: background-color var(--transition), transform var(--transition);
  cursor: pointer;
}
.post-card:first-child { padding-top: 20px; }
.post-card:last-child { border-bottom: none; }
.post-card:hover {
  background-color: var(--accent-light);
  transform: translateX(2px);
}

.post-cover {
  flex-shrink: 0;
  width: 180px;
  height: 120px;
  border-radius: var(--radius);
  overflow: hidden;
}
.post-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.post-body { flex: 1; min-width: 0; }

.post-title {
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: 600;
  color: var(--heading);
  line-height: 1.4;
  display: inline-block;
  margin-bottom: 6px;
}
.post-card:hover .post-title { color: var(--accent); }
.post-card--search { padding: 26px 0; }
.post-card--search .post-title { font-size: 22px; }
.search-highlight {
  padding: 0 2px;
  border-radius: 2px;
  background: #ffe57f;
  color: inherit;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
}

.post-excerpt {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8px;
}

.post-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-muted);
}
.post-date { font-family: var(--font-mono); font-size: 12px; }
.meta-sep { color: var(--border); }
.post-category {
  font-size: 12px;
  padding: 1px 8px;
  border-radius: 100px;
  background: var(--accent-light);
  color: var(--accent);
  font-weight: 500;
}

.post-stats {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}
.stat {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
}

.post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}
.tag {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 100px;
  background: var(--tag-bg);
  color: var(--tag-text);
  font-family: var(--font-mono);
  text-decoration: none;
  transition: all var(--transition);
}
.tag:hover {
  background: var(--accent-light);
  color: var(--accent);
}

@media (max-width: 768px) {
  .post-card { flex-direction: column; gap: 12px; padding: 18px 0; }
  .post-cover { width: 100%; height: 160px; }
  .post-title { font-size: 18px; }
  .post-stats { margin-left: 0; }
}
</style>
