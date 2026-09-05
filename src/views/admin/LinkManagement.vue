<template>
  <section class="link-management">
    <header class="page-header">
      <div>
        <h1 class="page-title">友情链接管理</h1>
        <p class="page-desc">维护前台「友情链接」页所展示的站点，禁用后即从前台隐藏</p>
      </div>
      <button class="btn-primary" @click="openCreate">新增友链</button>
    </header>

    <div v-if="loading" class="empty-state">加载中...</div>
    <div v-else-if="!links.length" class="empty-state">暂无友情链接</div>
    <div v-else class="table-scroll">
      <table class="data-table">
        <colgroup>
          <col style="width:64px" />
          <col style="width:96px" />
          <col style="width:120px" />
          <col style="width:auto" />
          <col style="width:auto" />
          <col style="width:80px" />
          <col style="width:80px" />
          <col style="width:160px" />
          <col style="width:160px" />
        </colgroup>
        <thead>
          <tr>
            <th>ID</th>
            <th>头像</th>
            <th>名称</th>
            <th>链接</th>
            <th>描述</th>
            <th>排序</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="link in links" :key="link.id">
            <td>{{ link.id }}</td>
            <td>
              <img v-if="link.logo" class="link-avatar" :src="link.logo" :alt="link.name" />
              <span v-else class="link-avatar link-avatar--placeholder">{{ initial(link.name) }}</span>
            </td>
            <td class="cell-ellipsis" :title="link.name">{{ link.name }}</td>
            <td class="cell-ellipsis" :title="link.url">
              <a :href="link.url" target="_blank" rel="noopener noreferrer" class="link-url">{{ link.url }}</a>
            </td>
            <td class="cell-ellipsis" :title="link.description || '-'">{{ link.description || '-' }}</td>
            <td>{{ link.sort }}</td>
            <td>
              <span class="status-pill" :class="link.status === 1 ? 'status-pill--on' : 'status-pill--off'">
                {{ link.status === 1 ? '已启用' : '已禁用' }}
              </span>
            </td>
            <td>{{ formatDate(link.created_at) }}</td>
            <td class="op-cell">
              <button class="btn-link" @click="openEdit(link)">编辑</button>
              <button class="btn-link btn-link--danger" @click="confirmDelete(link)">删除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 编辑/创建弹窗 -->
    <div v-if="dialogVisible" class="modal-mask" @click.self="closeDialog">
      <div class="modal" role="dialog" aria-modal="true">
        <header class="modal__header">
          <h2>{{ editing ? '编辑友链' : '新增友链' }}</h2>
          <button class="modal__close" type="button" aria-label="关闭" @click="closeDialog">×</button>
        </header>
        <div class="modal__body">
          <div class="form-row">
            <label for="link-name">名称<span class="req">*</span></label>
            <input id="link-name" v-model.trim="form.name" class="text-input" maxlength="50" placeholder="例如：xxx的博客" />
          </div>
          <div class="form-row">
            <label for="link-url">链接<span class="req">*</span></label>
            <input id="link-url" v-model.trim="form.url" class="text-input" placeholder="支持任意格式：https://、http://、//、www. 等" />
          </div>
          <div class="form-row">
            <label for="link-logo">头像 URL</label>
            <input id="link-logo" v-model.trim="form.logo" class="text-input" placeholder="https://..." />
          </div>
          <div class="form-row">
            <label for="link-desc">描述</label>
            <textarea id="link-desc" v-model.trim="form.description" class="text-input" rows="3" maxlength="200" placeholder="一句话介绍对方的博客（可选）"></textarea>
          </div>
          <div class="form-row form-row--inline">
            <label for="link-sort">排序</label>
            <input id="link-sort" v-model.number="form.sort" type="number" class="text-input text-input--narrow" />
            <span class="form-hint">数字越小越靠前</span>
          </div>
          <div class="form-row form-row--inline">
            <label>状态</label>
            <label class="switch">
              <input v-model="form.status" type="checkbox" :true-value="1" :false-value="0" />
              <span>{{ form.status === 1 ? '已启用' : '已禁用' }}</span>
            </label>
          </div>
          <p v-if="formError" class="form-error">{{ formError }}</p>
        </div>
        <footer class="modal__footer">
          <button class="btn-secondary" type="button" @click="closeDialog">取消</button>
          <button class="btn-primary" type="button" :disabled="submitting" @click="submit">
            {{ submitting ? '保存中...' : '保存' }}
          </button>
        </footer>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { adminListLinks, adminCreateLink, adminUpdateLink, adminDeleteLink } from '../../api/links.js'

const links = ref([])
const loading = ref(true)
const dialogVisible = ref(false)
const editing = ref(null)
const submitting = ref(false)
const formError = ref('')

const form = reactive({
  name: '',
  url: '',
  logo: '',
  description: '',
  sort: 0,
  status: 1,
})

function initial(name) {
  if (!name) return '?'
  return name.trim().charAt(0).toUpperCase()
}

function formatDate(value) {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '-'
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

async function load() {
  loading.value = true
  try {
    const res = await adminListLinks()
    links.value = Array.isArray(res) ? res : (res?.data || [])
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editing.value = null
  form.name = ''
  form.url = ''
  form.logo = ''
  form.description = ''
  form.sort = 0
  form.status = 1
  formError.value = ''
  dialogVisible.value = true
}

function openEdit(link) {
  editing.value = link
  form.name = link.name || ''
  form.url = link.url || ''
  form.logo = link.logo || ''
  form.description = link.description || ''
  form.sort = link.sort || 0
  form.status = link.status ?? 1
  formError.value = ''
  dialogVisible.value = true
}

function closeDialog() {
  if (submitting.value) return
  dialogVisible.value = false
}

function validate() {
  if (!form.name) return '请输入名称'
  if (form.name.length > 50) return '名称长度不能超过 50'
  if (!form.url) return '请输入链接'
  if (form.url.length > 500) return '链接长度不能超过 500'
  return ''
}

async function submit() {
  formError.value = validate()
  if (formError.value) return
  submitting.value = true
  try {
    const payload = {
      name: form.name,
      url: form.url,
      logo: form.logo,
      description: form.description,
      sort: form.sort,
      status: form.status,
    }
    if (editing.value) {
      await adminUpdateLink(editing.value.id, payload)
    } else {
      await adminCreateLink(payload)
    }
    dialogVisible.value = false
    await load()
  } catch (e) {
    formError.value = e.message || '保存失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

async function confirmDelete(link) {
  if (!window.confirm(`确认删除友情链接「${link.name}」吗？此操作不可恢复。`)) return
  try {
    await adminDeleteLink(link.id)
    await load()
  } catch (e) {
    window.alert(e.message || '删除失败')
  }
}

onMounted(load)
</script>

<style scoped>
.link-management { display: flex; flex-direction: column; gap: 16px; }

.page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.page-title { font-family: var(--font-serif); font-size: 22px; font-weight: 700; margin: 0; color: var(--heading); }
.page-desc { color: var(--text-secondary); font-size: 13px; margin: 4px 0 0; }

.btn-primary {
  padding: 8px 16px; border: none; border-radius: var(--radius-sm); background: var(--accent); color: #fff;
  font-size: 14px; cursor: pointer; transition: opacity var(--transition);
}
.btn-primary:hover { opacity: 0.88; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary {
  padding: 8px 16px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: transparent;
  color: var(--text-secondary); font-size: 14px; cursor: pointer; transition: all var(--transition);
}
.btn-secondary:hover { color: var(--heading); border-color: var(--accent-border); }

.empty-state { padding: 40px; text-align: center; color: var(--text-secondary); background: var(--bg-card); border-radius: var(--radius-md); }

.table-scroll { background: var(--bg-card); border-radius: var(--radius-md); overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.data-table th, .data-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid var(--border-light); }
.data-table th { background: var(--bg-soft); color: var(--text-secondary); font-weight: 600; font-size: 13px; }
.data-table tr:hover td { background: var(--bg-soft); }

.cell-ellipsis { max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.link-avatar { width: 40px; height: 40px; border-radius: 50%; object-fit: cover; background: var(--bg-soft); display: inline-flex; align-items: center; justify-content: center; font-weight: 600; color: var(--accent); }
.link-avatar--placeholder { background: var(--accent-light); }

.link-url { color: var(--accent); text-decoration: none; }
.link-url:hover { text-decoration: underline; }

.status-pill { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 12px; }
.status-pill--on { background: rgba(34, 197, 94, 0.12); color: #16a34a; }
.status-pill--off { background: rgba(148, 163, 184, 0.18); color: var(--text-muted); }

.op-cell { display: flex; gap: 8px; }
.btn-link { padding: 4px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: transparent; color: var(--accent); cursor: pointer; font-size: 12px; }
.btn-link:hover { background: var(--accent-light); }
.btn-link--danger { color: #dc2626; }
.btn-link--danger:hover { background: rgba(220, 38, 38, 0.08); border-color: #dc2626; }

.modal-mask { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.45); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 24px; }
.modal { width: 100%; max-width: 520px; background: var(--bg-card); border-radius: var(--radius-md); display: flex; flex-direction: column; max-height: 90vh; }
.modal__header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border-light); }
.modal__header h2 { margin: 0; font-size: 18px; font-family: var(--font-serif); }
.modal__close { background: transparent; border: none; font-size: 22px; cursor: pointer; color: var(--text-secondary); }
.modal__body { padding: 20px; overflow-y: auto; }
.modal__footer { padding: 12px 20px; border-top: 1px solid var(--border-light); display: flex; justify-content: flex-end; gap: 8px; }

.form-row { margin-bottom: 14px; display: flex; flex-direction: column; gap: 6px; }
.form-row--inline { flex-direction: row; align-items: center; gap: 12px; flex-wrap: wrap; }
.form-row label { font-size: 13px; color: var(--text-secondary); }
.req { color: #dc2626; margin-left: 2px; }
.text-input { padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: transparent; color: var(--text-primary); font-size: 14px; width: 100%; box-sizing: border-box; }
.text-input:focus { outline: none; border-color: var(--accent); }
.text-input--narrow { width: 120px; }
.form-hint { font-size: 12px; color: var(--text-muted); }
.form-error { color: #dc2626; font-size: 13px; margin: 4px 0 0; }

.switch { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: var(--text-secondary); }
.switch input { width: 16px; height: 16px; accent-color: var(--accent); }
</style>