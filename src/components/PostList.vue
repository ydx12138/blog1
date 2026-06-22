<template>
  <section class="post-list-section">
    <div class="post-list" v-if="posts.length">
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
    </div>
    <div class="empty" v-else-if="!loading">
      <p>暂无文章</p>
    </div>
    <div class="empty" v-if="loading">
      <p class="loading-dots">加载中<span>.</span><span>.</span><span>.</span></p>
    </div>

    <!-- 页码 -->
    <div class="pagination" v-if="totalPages > 1">
      <button class="page-btn" :disabled="page <= 1" @click="$emit('page-change', page - 1)">上一页</button>
      <template v-for="p in pages" :key="p">
        <span v-if="p === '...'" class="page-ellipsis">...</span>
        <button v-else class="page-btn" :class="{ active: p === page }" @click="$emit('page-change', p)">{{ p }}</button>
      </template>
      <button class="page-btn" :disabled="page >= totalPages" @click="$emit('page-change', page + 1)">下一页</button>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import PostCard from './PostCard.vue'

const props = defineProps({
  posts: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  page: { type: Number, default: 1 },
  total: { type: Number, default: 0 },
  pageSize: { type: Number, default: 10 },
})

defineEmits(['page-change'])

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))

const pages = computed(() => {
  const t = totalPages.value
  const p = props.page
  if (t <= 7) {
    return Array.from({ length: t }, (_, i) => i + 1)
  }
  const result = []
  result.push(1)
  if (p > 3) result.push('...')
  for (let i = Math.max(2, p - 1); i <= Math.min(t - 1, p + 1); i++) {
    result.push(i)
  }
  if (p < t - 2) result.push('...')
  result.push(t)
  return result
})
</script>

<style scoped>
.post-list-section { padding: 0; }
.empty { text-align: center; padding: 64px 0; color: var(--text-muted); font-size: 14px; }
.loading-dots span { animation: dot 1.4s infinite; display: inline-block; }
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dot { 0%, 80%, 100% { opacity: 0; } 40% { opacity: 1; } }

.pagination {
  display: flex; justify-content: center; align-items: center; gap: 4px;
  padding: 32px 0 40px;
}
.page-btn {
  min-width: 34px; height: 34px; padding: 0 8px;
  border: 1px solid var(--border); border-radius: var(--radius-sm);
  background: var(--bg-card); color: var(--text-secondary);
  font-size: 13px; font-family: var(--font-mono); cursor: pointer;
  transition: all var(--transition);
}
.page-btn:hover:not(:disabled):not(.active) {
  border-color: var(--accent-border); color: var(--accent);
}
.page-btn.active {
  background: var(--accent); color: #fff; border-color: var(--accent);
}
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-ellipsis { width: 34px; text-align: center; color: var(--text-muted); font-size: 13px; }
</style>
