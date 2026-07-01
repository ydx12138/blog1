<template>
  <article class="post-card" @click="goPost">
    <!-- 封面图 -->
    <div class="post-cover" v-if="post.cover">
      <img :src="post.cover" :alt="post.title" @error="onCoverError" />
    </div>
    <div class="post-body">
      <span class="post-title">{{ post.title }}</span>
      <p class="post-excerpt" v-if="post.summary">{{ post.summary }}</p>
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
        <span v-for="t in tags" :key="t" class="tag">{{ t }}</span>
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
  padding: 24px 0;
  border-bottom: 1px solid var(--border-light);
  transition: all var(--transition);
  cursor: pointer;
}
.post-card:first-child { padding-top: 0; }
.post-card:hover { background: linear-gradient(to right, transparent, var(--accent-light)); }

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
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 100px;
  background: var(--tag-bg);
  color: var(--tag-text);
  font-family: var(--font-mono);
}

@media (max-width: 768px) {
  .post-card { flex-direction: column; gap: 12px; padding: 18px 0; }
  .post-cover { width: 100%; height: 160px; }
  .post-title { font-size: 18px; }
  .post-stats { margin-left: 0; }
}
</style>
