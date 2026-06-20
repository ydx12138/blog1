<template>
  <div class="user-list">
    <h1 class="page-title">用户管理</h1>
    <div class="loading" v-if="loading">加载中...</div>
    <table class="data-table" v-else-if="users.length">
      <thead><tr><th>ID</th><th>邮箱</th><th>昵称</th><th>状态</th><th>注册时间</th><th>操作</th></tr></thead>
      <tbody>
        <tr v-for="u in users" :key="u.id">
          <td>{{ u.id }}</td>
          <td>{{ u.email }}</td>
          <td>{{ u.nickname }}</td>
          <td><span :class="['badge', u.status === 1 ? 'badge-ok' : 'badge-ban']">{{ u.status === 1 ? '正常' : '封禁' }}</span></td>
          <td>{{ u.created_at }}</td>
          <td class="actions">
            <button v-if="u.status === 1" @click="ban(u.id)" class="btn-sm btn-warn">封禁</button>
            <button v-else @click="unban(u.id)" class="btn-sm btn-green">解封</button>
            <button @click="del(u.id)" class="btn-sm btn-danger">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="empty" v-else>暂无用户</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUsers, banUser, unbanUser, deleteUser } from '../../api/admin.js'

const users = ref([])
const loading = ref(false)

async function fetchData() { loading.value = true; try { const d = await getUsers(); users.value = d.list || [] } catch (e) { console.error(e) } loading.value = false }
async function ban(id) { try { await banUser(id); fetchData() } catch (e) { alert(e.message) } }
async function unban(id) { try { await unbanUser(id); fetchData() } catch (e) { alert(e.message) } }
async function del(id) { if (confirm('确定删除此用户？')) { try { await deleteUser(id); fetchData() } catch (e) { alert(e.message) } } }

onMounted(fetchData)
</script>

<style scoped>
.page-title { font-family: var(--font-serif); font-size: 28px; font-weight: 700; color: var(--heading); margin-bottom: 24px; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 12px 14px; text-align: left; border-bottom: 1px solid var(--border-light); font-size: 14px; }
.data-table th { font-weight: 600; color: var(--text-secondary); font-size: 12px; }
.badge { display: inline-block; padding: 2px 10px; border-radius: 100px; font-size: 12px; }
.badge-ok { background: #dcfce7; color: #166534; }
.badge-ban { background: #fee2e2; color: #991b1b; }
.actions { display: flex; gap: 6px; }
.btn-sm { padding: 4px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-card); color: var(--text-secondary); font-size: 12px; cursor: pointer; transition: all var(--transition); }
.btn-sm:hover { border-color: var(--accent-border); color: var(--accent); }
.btn-green:hover { border-color: #22c55e; color: #22c55e; }
.btn-warn:hover { border-color: #f59e0b; color: #f59e0b; }
.btn-danger:hover { border-color: #dc2626; color: #dc2626; }
.loading, .empty { text-align: center; padding: 48px 0; color: var(--text-muted); }
</style>
