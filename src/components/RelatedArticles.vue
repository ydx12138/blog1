<template>
  <section v-if="articles.length" class="related-section">
    <h3 class="related-title">相关文章</h3>
    <ul class="related-list">
      <li v-for="item in articles" :key="item.id" class="related-item">
        <router-link :to="`/posts/${item.id}`" class="related-link">
          <h4 class="related-item__title">{{ item.title }}</h4>
          <p v-if="item.summary" class="related-item__summary">{{ truncate(item.summary, 80) }}</p>
          <div class="related-item__meta">
            <span v-if="item.category_name" class="related-item__category">{{ item.category_name }}</span>
            <time class="related-item__date">{{ formatDate(item.created_at) }}</time>
          </div>
        </router-link>
      </li>
    </ul>
  </section>
</template>

<script setup>
defineProps({
  articles: { type: Array, default: () => [] },
})

function truncate(s, n) {
  if (!s) return ''
  return s.length > n ? s.slice(0, n) + '…' : s
}

function formatDate(t) {
  if (!t) return ''
  const d = new Date(t)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}
</script>

<style scoped>
.related-section {
  margin-top: 40px;
  padding-top: 28px;
  border-top: 1px solid var(--border-light);
}
.related-title {
  margin: 0 0 18px;
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 600;
  color: var(--heading);
  letter-spacing: 0.04em;
}

.related-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.related-item {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: var(--radius);
  transition: all var(--transition);
}
.related-item:hover {
  border-color: var(--accent-border);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
}

.related-link {
  display: block;
  padding: 14px 16px;
  color: var(--text);
  text-decoration: none;
}

.related-item__title {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--heading);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.related-link:hover .related-item__title { color: var(--accent); }

.related-item__summary {
  margin: 0 0 8px;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.related-item__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}
.related-item__category {
  padding: 1px 8px;
  border-radius: 999px;
  background: var(--accent-light);
  color: var(--accent);
}

@media (max-width: 600px) {
  .related-list { grid-template-columns: 1fr; }
}
</style>