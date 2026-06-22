<template>
  <div class="comment-review">
    <h1 class="page-title">评论管理</h1>

    <div class="filter-bar">
      <input v-model="keyword" placeholder="搜索..." @input="onSearchInput" class="search-input" />
      <button :class="['toggle-btn', searchType === 'content' ? 'toggle-active' : '']" @click="searchType = 'content'; search()">搜内容</button>
      <button :class="['toggle-btn', searchType === 'nickname' ? 'toggle-active' : '']" @click="searchType = 'nickname'; search()">搜用户</button>
    </div>

    <div class="loading" v-if="loading">加载中...</div>
    <table class="data-table" v-else-if="comments.length">
      <colgroup>
        <col style="width:50px">
        <col style="width:200px">
        <col style="width:80px">
        <col style="width:auto">
        <col style="width:110px">
        <col style="width:210px">
      </colgroup>
      <thead><tr><th>ID</th><th>文章</th><th>用户</th><th>内容</th><th>状态</th><th>时间</th><th>操作</th></tr></thead>
      <tbody>
        <tr v-for="c in comments" :key="c.id">
          <td>{{ c.id }}</td>
          <td class="article-cell">
            <span class="article-title" :title="c.article_title">{{ c.article_title }}</span>
            <span class="article-id">#{{ c.article_id }}</span>
          </td>
          <td>{{ c.nickname }}</td>
          <td class="content-cell">{{ c.content }}</td>
          <td><span :class="statusBadge(c.status)">{{ statusLabel(c.status) }}</span></td>
          <td>{{ formatDate(c.created_at) }}</td>
          <td class="actions">
            <button
              v-for="s in [1, 2, 3]"
              :key="s"
              :class="['btn-sm', s === c.status ? 'btn-active' : '']"
              :disabled="s === c.status"
              @click="setStatus(c.id, s)"
            >{{ statusLabel(s) }}</button>
            <button class="btn-sm btn-danger" @click="doDelete(c.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="empty" v-else>暂无评论</div>

    <div class="pagination" v-if="totalPages > 1">
      <button class="page-btn" :disabled="page <= 1" @click="goPage(page - 1)">上一页</button>
      <button v-for="p in totalPages" :key="p" class="page-btn" :class="{ active: p === page }" @click="goPage(p)">{{ p }}</button>
      <button class="page-btn" :disabled="page >= totalPages" @click="goPage(page + 1)">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAllComments, setCommentStatus, deleteComment } from '../../api/admin.js'

const comments = ref([])
const loading = ref(false)
const page = ref(1)
const total = ref(0)
const pageSize = 10
const keyword = ref('')
const searchType = ref('content')
let searchTimer = null

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

const statusMap = { 1: '正常', 2: '隐藏', 3: '待审核' }
const badgeMap = { 1: 'badge-ok', 2: 'badge-hide', 3: 'badge-pending' }

function statusLabel(s) { return statusMap[s] || '未知' }
function statusBadge(s) { return ['badge', badgeMap[s]].join(' ') }
function formatDate(d) { if (!d) return '-'; return new Date(d).toLocaleString('zh-CN') }

async function fetchData() {
  loading.value = true
  try {
    const d = await getAllComments(page.value, pageSize, keyword.value, searchType.value)
    comments.value = d.list || []
    total.value = d.total || 0
  } catch (e) { console.error(e) }
  loading.value = false
}

function search() { page.value = 1; fetchData() }
function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => search(), 300)
}
function goPage(p) { page.value = p; fetchData() }

async function doDelete(id) { if (confirm('确定删除此评论？')) { try { await deleteComment(id); fetchData() } catch (e) { alert(e.message) } } }

async function setStatus(id, status) {
  try {
    await setCommentStatus(id, status)
    const found = comments.value.find(c => c.id === id)
    if (found) found.status = status
  } catch (e) { alert(e.message) }
}

onMounted(fetchData)
</script>

<style scoped>
.page-title { font-family: var(--font-serif); font-size: 28px; font-weight: 700; color: var(--heading); margin-bottom: 20px; }
.filter-bar { display: flex; gap: 8px; margin-bottom: 20px; }
.search-input { flex: 1; height: 38px; padding: 0 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg); color: var(--text); font-size: 14px; outline: none; }
.search-input:focus { border-color: var(--accent-border); }
.toggle-btn { height: 38px; padding: 0 14px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-card); color: var(--text-secondary); font-size: 13px; cursor: pointer; white-space: nowrap; transition: all var(--transition); }
.toggle-btn:hover { border-color: var(--accent-border); color: var(--accent); }
.toggle-active { background: var(--accent); color: #fff; border-color: var(--accent); }
.toggle-active:hover { color: #fff; }
.data-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.data-table th, .data-table td { padding: 12px 14px; text-align: left; border-bottom: 1px solid var(--border-light); font-size: 14px; }
.data-table th { font-weight: 600; color: var(--text-secondary); font-size: 12px; text-transform: uppercase; }
.content-cell { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.article-cell { display: flex; flex-direction: column; gap: 2px; }
.article-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; color: var(--heading); }
.article-id { font-size: 11px; color: var(--text-muted); font-family: var(--font-mono); }
.actions { display: flex; gap: 3px; flex-wrap: wrap; }

.badge { display: inline-block; padding: 2px 10px; border-radius: 100px; font-size: 12px; }
.badge-ok { background: #dcfce7; color: #166534; }
.badge-hide { background: var(--tag-bg); color: var(--tag-text); }
.badge-pending { background: #fef3c7; color: #92400e; }

.btn-sm { padding: 3px 8px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-card); color: var(--text-secondary); font-size: 11px; cursor: pointer; transition: all var(--transition); }
.btn-sm:hover:not(:disabled) { border-color: var(--accent-border); color: var(--accent); }
.btn-sm:disabled { opacity: 0.5; cursor: default; }
.btn-active { background: var(--accent); color: #fff; border-color: var(--accent); }
.btn-danger:hover:not(:disabled) { border-color: #dc2626; color: #dc2626; }

.loading, .empty { text-align: center; padding: 48px 0; color: var(--text-muted); }
.pagination { display: flex; justify-content: center; align-items: center; gap: 4px; padding: 24px 0 32px; }
.page-btn { min-width: 32px; height: 32px; padding: 0 8px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-card); color: var(--text-secondary); font-size: 13px; font-family: var(--font-mono); cursor: pointer; transition: all var(--transition); }
.page-btn:hover:not(:disabled):not(.active) { border-color: var(--accent-border); color: var(--accent); }
.page-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
