<template>
  <div class="archive-page">
    <header class="archive-header">
      <h1 class="archive-title">归档</h1>
      <p class="archive-subtitle">
        <template v-if="archive.total">共 {{ archive.total }} 篇文章，按年份沉淀</template>
        <template v-else>还没有发布的文章</template>
      </p>
    </header>

    <div v-if="loading" class="status-msg">加载中...</div>
    <div v-else-if="!archive.years.length" class="empty">暂无归档</div>

    <section v-else class="archive-list">
      <article v-for="node in archive.years" :key="node.year" class="archive-year">
        <header class="archive-year__head">
          <h2 class="archive-year__title">{{ node.year }}</h2>
          <span class="archive-year__count">{{ node.count }} 篇</span>
        </header>
        <ul class="archive-items">
          <li v-for="item in node.articles" :key="item.id" class="archive-item">
            <time class="archive-item__date">{{ formatDay(item.created_at) }}</time>
            <router-link class="archive-item__title" :to="`/posts/${item.id}`">
              {{ item.title }}
            </router-link>
            <span v-if="item.category_name" class="archive-item__category">{{ item.category_name }}</span>
          </li>
        </ul>
      </article>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getArchive } from '../api/archive.js'

const archive = ref({ total: 0, years: [] })
const loading = ref(false)

function formatDay(t) {
  if (!t) return ''
  const d = new Date(t)
  if (isNaN(d.getTime())) return ''
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${m}-${day}`
}

async function load() {
  loading.value = true
  try {
    archive.value = await getArchive()
  } catch (e) {
    console.error('加载归档失败:', e)
  }
  loading.value = false
}

onMounted(load)
</script>

<style scoped>
.archive-page { padding: var(--page-top) 0; }

.archive-header { padding: 0 0 26px; text-align: center; }
.archive-title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 34px;
  font-weight: 700;
  color: var(--heading);
  letter-spacing: 0.04em;
}
.archive-subtitle {
  margin: 12px 0 0;
  color: var(--text-muted);
  font-size: 14px;
}

.status-msg,
.empty {
  padding: 48px 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
}

.archive-list { border-top: 1px solid var(--border-light); }
.archive-year {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 32px;
  padding: 28px 0;
  border-bottom: 1px solid var(--border-light);
}
.archive-year__head {
  position: sticky;
  top: 24px;
  align-self: start;
  text-align: right;
}
.archive-year__title {
  margin: 0;
  font-family: var(--font-serif);
  font-size: 30px;
  font-weight: 700;
  color: var(--heading);
  letter-spacing: 0.02em;
}
.archive-year__count {
  display: inline-block;
  margin-top: 6px;
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--accent-light);
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 12px;
}

.archive-items {
  list-style: none;
  margin: 0;
  padding: 0;
}
.archive-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 0;
  font-size: 14px;
  color: var(--text);
  transition: color var(--transition);
}
.archive-item:hover { color: var(--accent); }
.archive-item__date {
  flex: 0 0 56px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
}
.archive-item__title {
  flex: 1;
  min-width: 0;
  color: var(--heading);
  text-decoration: none;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.archive-item:hover .archive-item__title {
  color: var(--accent);
}
.archive-item__category {
  flex: 0 0 auto;
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--tag-bg);
  color: var(--tag-text);
  font-family: var(--font-mono);
}

@media (max-width: 720px) {
  .archive-year { grid-template-columns: 1fr; gap: 12px; }
  .archive-year__head { position: static; text-align: left; }
  .archive-year__title { font-size: 24px; }
}
</style>