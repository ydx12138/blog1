<template>
  <section class="post-list-section">
    <h2 class="section-title">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="section-icon">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
      文章
    </h2>
    <div class="post-list" v-if="posts.length">
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
    </div>
    <div class="empty" v-else>
      <p v-if="loading">加载中...</p>
      <p v-else>暂无文章</p>
    </div>
    <div class="pagination" v-if="total > posts.length">
      <button class="btn-load-more" @click="$emit('load-more')" :disabled="loading">
        {{ loading ? '加载中...' : '加载更多' }}
      </button>
    </div>
  </section>
</template>

<script setup>
import PostCard from './PostCard.vue'

defineProps({
  posts: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  total: { type: Number, default: 0 },
})

defineEmits(['load-more'])
</script>

<style scoped>
.post-list-section { padding: 48px 0; }
.section-title { display: flex; align-items: center; gap: 10px; font-family: var(--font-serif); font-size: 24px; font-weight: 700; color: var(--heading); margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid var(--accent); }
.section-icon { color: var(--accent); }
.empty { text-align: center; padding: 48px 0; color: var(--text-muted); }
.pagination { text-align: center; padding: 24px 0; }
.btn-load-more { padding: 10px 32px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-card); color: var(--text-secondary); font-size: 14px; cursor: pointer; transition: all var(--transition); }
.btn-load-more:hover:not(:disabled) { border-color: var(--accent-border); color: var(--accent); }
.btn-load-more:disabled { opacity: 0.5; cursor: not-allowed; }
@media (max-width: 768px) { .post-list-section { padding: 32px 0; } .section-title { font-size: 20px; margin-bottom: 16px; } }
</style>
