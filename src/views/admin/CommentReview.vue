<template>
  <div class="comment-review">
    <h1 class="page-title">评论审核</h1>
    <div class="loading" v-if="loading">加载中...</div>
    <table class="data-table" v-else-if="comments.length">
      <thead><tr><th>ID</th><th>用户</th><th>内容</th><th>时间</th><th>操作</th></tr></thead>
      <tbody>
        <tr v-for="c in comments" :key="c.id">
          <td>{{ c.id }}</td>
          <td>{{ c.nickname }}</td>
          <td class="content-cell">{{ c.content }}</td>
          <td>{{ formatDate(c.created_at) }}</td>
          <td class="actions">
            <button @click="approve(c.id)" class="btn-sm btn-green">通过</button>
            <button @click="reject(c.id)" class="btn-sm btn-warn">拒绝</button>
            <button @click="del(c.id)" class="btn-sm btn-danger">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="empty" v-else>暂无待审核评论</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getPendingComments, approveComment, rejectComment, deleteComment } from '../../api/admin.js'

const comments = ref([])
const loading = ref(false)

function formatDate(d) { if (!d) return '-'; return new Date(d).toLocaleString('zh-CN') }
async function fetchData() { loading.value = true; try { const d = await getPendingComments(); comments.value = d.list || [] } catch (e) { console.error(e) } loading.value = false }
async function approve(id) { try { await approveComment(id); fetchData() } catch (e) { alert(e.message) } }
async function reject(id) { try { await rejectComment(id); fetchData() } catch (e) { alert(e.message) } }
async function del(id) { if (confirm('确定删除？')) { try { await deleteComment(id); fetchData() } catch (e) { alert(e.message) } } }

onMounted(fetchData)
</script>

<style scoped>
.page-title { font-family: var(--font-serif); font-size: 28px; font-weight: 700; color: var(--heading); margin-bottom: 24px; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 12px 14px; text-align: left; border-bottom: 1px solid var(--border-light); font-size: 14px; }
.data-table th { font-weight: 600; color: var(--text-secondary); font-size: 12px; }
.content-cell { max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.actions { display: flex; gap: 6px; }
.btn-sm { padding: 4px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-card); color: var(--text-secondary); font-size: 12px; cursor: pointer; transition: all var(--transition); }
.btn-sm:hover { border-color: var(--accent-border); color: var(--accent); }
.btn-green:hover { border-color: #22c55e; color: #22c55e; }
.btn-warn:hover { border-color: #f59e0b; color: #f59e0b; }
.btn-danger:hover { border-color: #dc2626; color: #dc2626; }
.loading, .empty { text-align: center; padding: 48px 0; color: var(--text-muted); }
</style>
