<template>
  <div class="article-list">
    <div class="page-header">
      <h1 class="page-title">文章管理</h1>
    </div>

    <div class="filter-bar">
      <input v-model="keyword" placeholder="搜索标题或摘要..." @input="onSearchInput" class="search-input" />
    </div>

    <div class="loading" v-if="loading">加载中...</div>
    <table class="data-table" v-else-if="articles.length">
      <colgroup>
        <col style="width:50px">
        <col style="width:60px">
        <col style="width:180px">
        <col style="width:90px">
        <col style="width:50px">
        <col style="width:50px">
        <col style="width:50px">
        <col style="width:110px">
        <col style="width:160px">
      </colgroup>
      <thead><tr><th>ID</th><th>封面</th><th>标题</th><th>分类</th><th>浏览</th><th>点赞</th><th>评论</th><th>发布时间</th><th>操作</th></tr></thead>
      <tbody>
        <tr v-for="a in articles" :key="a.id">
          <td>{{ a.id }}</td>
          <td class="cover-cell">
            <img v-if="a.cover" :src="a.cover" class="cover-thumb" @error="$event.target.style.display='none'" />
          </td>
          <td class="title-cell">{{ a.title }}</td>
          <td>{{ a.Category?.name || '-' }}</td>
          <td>{{ a.view_count }}</td>
          <td>{{ a.like_count }}</td>
          <td>{{ a.comment_count }}</td>
          <td>{{ formatDate(a.publish_time || a.created_at) }}</td>
          <td class="actions">
            <router-link :to="`/admin/articles/${a.id}/preview`" class="btn-sm">浏览</router-link>
            <router-link :to="`/admin/articles/${a.id}/edit`" class="btn-sm">编辑</router-link>
            <button @click="deleteArticle(a.id)" class="btn-sm btn-danger">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="empty" v-else>暂无文章</div>

    <!-- 分页 -->
    <div class="pagination" v-if="totalPages > 1">
      <button class="page-btn" :disabled="page <= 1" @click="goPage(page - 1)">上一页</button>
      <button v-for="p in totalPages" :key="p" class="page-btn" :class="{ active: p === page }" @click="goPage(p)">{{ p }}</button>
      <button class="page-btn" :disabled="page >= totalPages" @click="goPage(page + 1)">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAdminArticles, deleteArticle as delArticle } from '../../api/admin.js'
import { useConfirm } from '../../composables/useConfirm.js'

const articles = ref([])
const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const total = ref(0)
const pageSize = 10
let searchTimer = null

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

function formatDate(d) { if (!d) return '-'; return new Date(d).toLocaleDateString('zh-CN') }

async function fetchData() {
  loading.value = true
  try {
    const data = await getAdminArticles({ page: page.value, pageSize, keyword: keyword.value, status: 2 })
    articles.value = data.list || []
    total.value = data.total || 0
  } catch (e) { console.error(e) }
  loading.value = false
}

function search() { page.value = 1; fetchData() }
function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => search(), 300)
}
function goPage(p) { page.value = p; fetchData() }

const { showConfirm } = useConfirm()

async function deleteArticle(id) {
  const ok = await showConfirm('确定删除此文章？')
  if (ok) { try { await delArticle(id); fetchData() } catch (e) { alert(e.message) } }
}

onMounted(fetchData)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-family: var(--font-serif); font-size: 28px; font-weight: 700; color: var(--heading); }
.filter-bar { display: flex; gap: 12px; margin-bottom: 20px; }
.search-input { flex: 1; height: 38px; padding: 0 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg); color: var(--text); font-size: 14px; outline: none; }
.search-input:focus { border-color: var(--accent-border); }
.data-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.data-table th, .data-table td { padding: 12px 14px; text-align: left; border-bottom: 1px solid var(--border-light); font-size: 14px; }
.data-table th { font-weight: 600; color: var(--text-secondary); font-size: 12px; text-transform: uppercase; }
.title-cell { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cover-cell { padding: 6px 14px; }
.cover-thumb { width: 48px; height: 32px; object-fit: cover; border-radius: 4px; display: block; }
.actions { display: flex; gap: 6px; }
.btn-sm { padding: 4px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-card); color: var(--text-secondary); font-size: 12px; cursor: pointer; text-decoration: none; transition: all var(--transition); }
.btn-sm:hover { border-color: var(--accent-border); color: var(--accent); }
.btn-danger:hover { border-color: #dc2626; color: #dc2626; }
.loading, .empty { text-align: center; padding: 48px 0; color: var(--text-muted); }
.pagination { display: flex; justify-content: center; align-items: center; gap: 4px; padding: 24px 0 32px; }
.page-btn { min-width: 32px; height: 32px; padding: 0 8px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-card); color: var(--text-secondary); font-size: 13px; font-family: var(--font-mono); cursor: pointer; transition: all var(--transition); }
.page-btn:hover:not(:disabled):not(.active) { border-color: var(--accent-border); color: var(--accent); }
.page-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
