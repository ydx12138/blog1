<template>
  <div class="article-list">
    <div class="page-header">
      <h1 class="page-title">文章管理</h1>
      <router-link to="/admin/articles/new" class="btn-primary">+ 新建文章</router-link>
    </div>

    <div class="filter-bar">
      <input v-model="keyword" placeholder="搜索标题..." @input="search" class="search-input" />
      <select v-model="statusFilter" @change="search" class="status-select">
        <option :value="0">全部状态</option>
        <option :value="2">已发布</option>
        <option :value="1">草稿</option>
      </select>
    </div>

    <div class="loading" v-if="loading">加载中...</div>
    <table class="data-table" v-else-if="articles.length">
      <thead><tr><th>ID</th><th>标题</th><th>分类</th><th>状态</th><th>浏览</th><th>评论</th><th>创建</th><th>操作</th></tr></thead>
      <tbody>
        <tr v-for="a in articles" :key="a.id">
          <td>{{ a.id }}</td>
          <td class="title-cell">{{ a.title }}</td>
          <td>{{ a.Category?.name || '-' }}</td>
          <td><span :class="['badge', a.status === 2 ? 'badge-pub' : 'badge-draft']">{{ a.status === 2 ? '已发布' : '草稿' }}</span></td>
          <td>{{ a.view_count }}</td>
          <td>{{ a.comment_count }}</td>
          <td>{{ formatDate(a.CreatedAt) }}</td>
          <td class="actions">
            <router-link :to="`/admin/articles/${a.id}`" class="btn-sm">编辑</router-link>
            <button v-if="a.status === 1" @click="publishArticle(a.id)" class="btn-sm btn-green">发布</button>
            <button @click="deleteArticle(a.id)" class="btn-sm btn-danger">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="empty" v-else>暂无文章</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAdminArticles, deleteArticle as delArticle, publishArticle as pubArticle } from '../../api/admin.js'

const articles = ref([])
const loading = ref(false)
const keyword = ref('')
const statusFilter = ref(0)
const page = ref(1)

function formatDate(d) { if (!d) return '-'; return new Date(d).toLocaleDateString('zh-CN') }

async function fetchData() {
  loading.value = true
  try { const data = await getAdminArticles({ page: page.value, keyword: keyword.value, status: statusFilter.value }); articles.value = data.list || [] } catch (e) { console.error(e) }
  loading.value = false
}

function search() { page.value = 1; fetchData() }

async function publishArticle(id) { try { await pubArticle(id); fetchData() } catch (e) { alert(e.message) } }
async function deleteArticle(id) { if (confirm('确定删除此文章？')) { try { await delArticle(id); fetchData() } catch (e) { alert(e.message) } } }

onMounted(fetchData)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-title { font-family: var(--font-serif); font-size: 28px; font-weight: 700; color: var(--heading); }
.btn-primary { padding: 10px 20px; border-radius: var(--radius-sm); background: var(--accent); color: #fff; font-size: 14px; text-decoration: none; font-weight: 500; transition: opacity var(--transition); }
.btn-primary:hover { opacity: 0.9; }
.filter-bar { display: flex; gap: 12px; margin-bottom: 20px; }
.search-input { flex: 1; height: 38px; padding: 0 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg); color: var(--text); font-size: 14px; outline: none; }
.search-input:focus { border-color: var(--accent-border); }
.status-select { height: 38px; padding: 0 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg); color: var(--text); font-size: 14px; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 12px 14px; text-align: left; border-bottom: 1px solid var(--border-light); font-size: 14px; }
.data-table th { font-weight: 600; color: var(--text-secondary); font-size: 12px; text-transform: uppercase; }
.title-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.badge { display: inline-block; padding: 2px 10px; border-radius: 100px; font-size: 12px; }
.badge-pub { background: #dcfce7; color: #166534; }
.badge-draft { background: var(--tag-bg); color: var(--tag-text); }
.actions { display: flex; gap: 6px; }
.btn-sm { padding: 4px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-card); color: var(--text-secondary); font-size: 12px; cursor: pointer; text-decoration: none; transition: all var(--transition); }
.btn-sm:hover { border-color: var(--accent-border); color: var(--accent); }
.btn-green:hover { border-color: #22c55e; color: #22c55e; }
.btn-danger:hover { border-color: #dc2626; color: #dc2626; }
.loading, .empty { text-align: center; padding: 48px 0; color: var(--text-muted); }
</style>
