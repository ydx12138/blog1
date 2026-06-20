<template>
  <div class="draft-list">
    <h1 class="page-title">草稿箱</h1>
    <div class="loading" v-if="loading">加载中...</div>
    <table class="data-table" v-else-if="drafts.length">
      <thead><tr><th>ID</th><th>标题</th><th>创建时间</th><th>操作</th></tr></thead>
      <tbody>
        <tr v-for="a in drafts" :key="a.id">
          <td>{{ a.id }}</td>
          <td class="title-cell">{{ a.title }}</td>
          <td>{{ formatDate(a.CreatedAt) }}</td>
          <td class="actions">
            <router-link :to="`/admin/articles/${a.id}`" class="btn-sm">编辑</router-link>
            <button @click="doPublish(a.id)" class="btn-sm btn-green">发布</button>
            <button @click="doDelete(a.id)" class="btn-sm btn-danger">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="empty" v-else>暂无草稿</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDrafts, deleteArticle, publishArticle } from '../../api/admin.js'

const drafts = ref([])
const loading = ref(false)

function formatDate(d) { if (!d) return '-'; return new Date(d).toLocaleDateString('zh-CN') }
async function fetchData() { loading.value = true; try { const d = await getDrafts(); drafts.value = d.list || [] } catch (e) { console.error(e) } loading.value = false }
async function doPublish(id) { try { await publishArticle(id); fetchData() } catch (e) { alert(e.message) } }
async function doDelete(id) { if (confirm('确定删除？')) { try { await deleteArticle(id); fetchData() } catch (e) { alert(e.message) } } }

onMounted(fetchData)
</script>

<style scoped>
.page-title { font-family: var(--font-serif); font-size: 28px; font-weight: 700; color: var(--heading); margin-bottom: 24px; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 12px 14px; text-align: left; border-bottom: 1px solid var(--border-light); font-size: 14px; }
.data-table th { font-weight: 600; color: var(--text-secondary); font-size: 12px; text-transform: uppercase; }
.title-cell { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.actions { display: flex; gap: 6px; }
.btn-sm { padding: 4px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-card); color: var(--text-secondary); font-size: 12px; cursor: pointer; text-decoration: none; transition: all var(--transition); }
.btn-sm:hover { border-color: var(--accent-border); color: var(--accent); }
.btn-green:hover { border-color: #22c55e; color: #22c55e; }
.btn-danger:hover { border-color: #dc2626; color: #dc2626; }
.loading, .empty { text-align: center; padding: 48px 0; color: var(--text-muted); }
</style>
