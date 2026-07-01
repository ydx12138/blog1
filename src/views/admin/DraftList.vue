<template>
  <div class="draft-list">
    <h1 class="page-title">草稿箱</h1>
    <div class="loading" v-if="loading">加载中...</div>
    <table class="data-table" v-else-if="drafts.length">
      <thead><tr><th>ID</th><th>封面</th><th>标题</th><th>创建时间</th><th>操作</th></tr></thead>
      <tbody>
        <tr v-for="a in drafts" :key="a.id" :class="{ 'row-link': a.status === 2 }" @click="a.status === 2 && openPost(a.id)">
          <td>{{ a.id }}</td>
          <td class="cover-cell">
            <img v-if="a.cover" :src="a.cover" class="cover-thumb" @error="$event.target.style.display='none'" />
          </td>
          <td class="title-cell">{{ a.title }}</td>
          <td>{{ formatDate(a.created_at) }}</td>
          <td class="actions" @click.stop>
            <router-link :to="`/admin/articles/${a.id}/edit`" class="btn-sm">编辑</router-link>
            <button @click="doPublish(a.id)" class="btn-sm btn-green">发布</button>
            <button @click="doDelete(a.id)" class="btn-sm btn-danger">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="empty" v-else>暂无草稿</div>

    <div class="pagination" v-if="totalPages > 1">
      <button class="page-btn" :disabled="page <= 1" @click="goPage(page - 1)">上一页</button>
      <button v-for="p in totalPages" :key="p" class="page-btn" :class="{ active: p === page }" @click="goPage(p)">{{ p }}</button>
      <button class="page-btn" :disabled="page >= totalPages" @click="goPage(page + 1)">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getDrafts, deleteArticle, publishArticle } from '../../api/admin.js'
import { useConfirm } from '../../composables/useConfirm.js'

const drafts = ref([])
const loading = ref(false)
const page = ref(1)
const total = ref(0)
const pageSize = 10

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

function formatDate(d) { if (!d) return '-'; return new Date(d).toLocaleDateString('zh-CN') }
function openPost(id) { window.open(`/posts/${id}`, '_blank') }

async function fetchData() {
  loading.value = true
  try {
    const d = await getDrafts(page.value, pageSize)
    drafts.value = d.list || []
    total.value = d.total || 0
  } catch (e) { console.error(e) }
  loading.value = false
}

function goPage(p) { page.value = p; fetchData() }

async function doPublish(id) { try { await publishArticle(id); fetchData() } catch (e) { alert(e.message) } }
const { showConfirm } = useConfirm()

async function doDelete(id) {
  const ok = await showConfirm('确定删除此草稿？')
  if (ok) { try { await deleteArticle(id); fetchData() } catch (e) { alert(e.message) } }
}

onMounted(fetchData)
</script>

<style scoped>
.page-title { font-family: var(--font-serif); font-size: 28px; font-weight: 700; color: var(--heading); margin-bottom: 24px; }
.data-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.data-table th, .data-table td { padding: 12px 14px; text-align: left; border-bottom: 1px solid var(--border-light); font-size: 14px; }
.data-table th { font-weight: 600; color: var(--text-secondary); font-size: 12px; text-transform: uppercase; }
.row-link { cursor: pointer; transition: background var(--transition); }
.row-link:hover { background: var(--accent-light); }
.title-cell { width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cover-cell { padding: 6px 14px; }
.cover-thumb { width: 48px; height: 32px; object-fit: cover; border-radius: 4px; display: block; }
.actions { display: flex; gap: 6px; }
.btn-sm { padding: 4px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-card); color: var(--text-secondary); font-size: 12px; cursor: pointer; text-decoration: none; transition: all var(--transition); }
.btn-sm:hover { border-color: var(--accent-border); color: var(--accent); }
.btn-green:hover { border-color: #22c55e; color: #22c55e; }
.btn-danger:hover { border-color: #dc2626; color: #dc2626; }
.loading, .empty { text-align: center; padding: 48px 0; color: var(--text-muted); }
.pagination { display: flex; justify-content: center; align-items: center; gap: 4px; padding: 24px 0 32px; }
.page-btn { min-width: 32px; height: 32px; padding: 0 8px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-card); color: var(--text-secondary); font-size: 13px; font-family: var(--font-mono); cursor: pointer; transition: all var(--transition); }
.page-btn:hover:not(:disabled):not(.active) { border-color: var(--accent-border); color: var(--accent); }
.page-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
