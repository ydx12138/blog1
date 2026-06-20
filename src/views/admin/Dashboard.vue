<template>
  <div class="dashboard">
    <h1 class="page-title">数据面板</h1>
    <div class="stats-grid">
      <div class="stat-card"><span class="stat-num">{{ data.total_articles }}</span><span class="stat-label">文章总数</span></div>
      <div class="stat-card"><span class="stat-num">{{ data.published_articles }}</span><span class="stat-label">已发布</span></div>
      <div class="stat-card"><span class="stat-num">{{ data.draft_articles }}</span><span class="stat-label">草稿</span></div>
      <div class="stat-card"><span class="stat-num">{{ data.total_comments }}</span><span class="stat-label">评论总数</span></div>
      <div class="stat-card warn"><span class="stat-num">{{ data.pending_comments }}</span><span class="stat-label">待审核评论</span></div>
      <div class="stat-card"><span class="stat-num">{{ data.total_users }}</span><span class="stat-label">用户数</span></div>
      <div class="stat-card"><span class="stat-num">{{ formatNum(data.total_views) }}</span><span class="stat-label">总浏览数</span></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDashboard } from '../../api/admin.js'

const data = ref({ total_articles: 0, published_articles: 0, draft_articles: 0, total_comments: 0, pending_comments: 0, total_users: 0, total_views: 0 })

function formatNum(n) {
  if (!n) return '0'
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

onMounted(async () => {
  try { data.value = await getDashboard() } catch (e) { console.error(e) }
})
</script>

<style scoped>
.dashboard { padding: 0; }
.page-title { font-family: var(--font-serif); font-size: 28px; font-weight: 700; color: var(--heading); margin-bottom: 28px; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
.stat-card { padding: 24px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); text-align: center; }
.stat-card.warn { border-color: #f59e0b; background: rgba(245, 158, 11, 0.05); }
.stat-num { display: block; font-family: var(--font-mono); font-size: 36px; font-weight: 700; color: var(--accent); margin-bottom: 6px; }
.stat-label { font-size: 14px; color: var(--text-secondary); }
</style>
