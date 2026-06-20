<template>
  <article class="post-card">
    <time class="post-date" :datetime="post.created_at">{{ formattedDate }}</time>
    <div class="post-content">
      <h2 class="post-title">
        <router-link :to="`/posts/${post.id}`">{{ post.title }}</router-link>
      </h2>
      <p class="post-excerpt">{{ post.summary }}</p>
      <div class="post-meta">
        <router-link v-if="post.category_name" to="" class="post-category">
          {{ post.category_name }}
        </router-link>
        <span v-if="tags.length" class="post-tags">
          <span v-for="tag in tags" :key="tag" class="post-tag">{{ tag }}</span>
        </span>
        <span class="post-stats" v-if="showStats">
          <span class="stat-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {{ formatCount(post.view_count) }}
          </span>
          <span class="stat-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/></svg>
            {{ formatCount(post.like_count) }}
          </span>
          <span class="stat-item">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {{ formatCount(post.comment_count) }}
          </span>
        </span>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  post: { type: Object, required: true },
  showStats: { type: Boolean, default: false },
})

const formattedDate = computed(() => {
  const d = new Date(props.post.created_at)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
})

const tags = computed(() => {
  if (!props.post.tags) return []
  if (Array.isArray(props.post.tags)) return props.post.tags
  return props.post.tags.split(',').map(t => t.trim()).filter(Boolean)
})

function formatCount(n) {
  if (!n) return '0'
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}
</script>

<style scoped>
.post-card { display: flex; gap: 32px; padding: 28px 0; border-bottom: 1px solid var(--border-light); transition: background var(--transition); }
.post-card:first-child { padding-top: 0; }
.post-card:hover { background: linear-gradient(to right, transparent, var(--accent-light), transparent); }
.post-date { flex-shrink: 0; width: 100px; font-size: 14px; color: var(--text-muted); font-family: var(--font-mono); padding-top: 4px; }
.post-content { flex: 1; min-width: 0; }
.post-title { font-family: var(--font-serif); font-size: 20px; font-weight: 600; line-height: 1.4; margin-bottom: 6px; }
.post-title a { color: var(--heading); transition: color var(--transition); }
.post-title a:hover { color: var(--accent); opacity: 1; }
.post-excerpt { font-size: 15px; color: var(--text-secondary); line-height: 1.65; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 10px; }
.post-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.post-category { font-size: 12px; padding: 2px 10px; border-radius: 100px; background: var(--accent-light); color: var(--accent); font-family: var(--font-mono); letter-spacing: 0.5px; text-decoration: none; transition: all var(--transition); }
.post-category:hover { background: var(--accent-border); opacity: 1; }
.post-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.post-tag { font-size: 12px; padding: 2px 10px; border-radius: 100px; background: var(--tag-bg); color: var(--tag-text); font-family: var(--font-mono); letter-spacing: 0.5px; }
.post-stats { display: flex; align-items: center; gap: 14px; margin-left: auto; }
.stat-item { display: inline-flex; align-items: center; gap: 3px; font-size: 12px; color: var(--text-muted); font-family: var(--font-mono); }
@media (max-width: 768px) {
  .post-card { flex-direction: column; gap: 6px; padding: 20px 0; }
  .post-date { width: auto; padding-top: 0; }
  .post-title { font-size: 18px; }
}
</style>
