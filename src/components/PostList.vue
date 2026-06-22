<template>
  <section class="post-list-section">
    <div class="post-list" v-if="posts.length">
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
    </div>
    <div class="empty" v-else-if="!loading">
      <p>暂无文章</p>
    </div>
    <div class="empty" v-if="loading && !posts.length">
      <p class="loading-dots">加载中<span>.</span><span>.</span><span>.</span></p>
    </div>
    <div class="pagination" v-if="hasMore">
      <button class="btn-load-more" @click="$emit('load-more')" :disabled="loading">
        {{ loading ? '加载中...' : '加载更多' }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import PostCard from './PostCard.vue'

const props = defineProps({
  posts: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  total: { type: Number, default: 0 },
})

defineEmits(['load-more'])

const hasMore = computed(() => props.total > props.posts.length)
</script>

<style scoped>
.post-list-section {
  padding: 0;
}

.empty {
  text-align: center;
  padding: 64px 0;
  color: var(--text-muted);
  font-size: 14px;
}

.loading-dots span {
  animation: dot 1.4s infinite;
  display: inline-block;
}
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dot {
  0%, 80%, 100% { opacity: 0; }
  40% { opacity: 1; }
}

.pagination {
  text-align: center;
  padding: 28px 0 40px;
}
.btn-load-more {
  padding: 10px 40px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 14px;
  font-family: var(--font-sans);
  cursor: pointer;
  transition: all var(--transition);
}
.btn-load-more:hover:not(:disabled) {
  border-color: var(--accent-border);
  color: var(--accent);
}
.btn-load-more:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
