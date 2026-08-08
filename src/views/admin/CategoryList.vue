<template>
  <div class="category-list">
    <h1 class="page-title">分类管理</h1>

    <div class="filter-bar">
      <input v-model="keyword" placeholder="搜索分类名称..." @input="onSearchInput" class="search-input" />
      <button class="btn-new" @click="openCreateModal">+ 新建分类</button>
    </div>

    <div class="loading" v-if="loading">加载中...</div>
    <div class="table-wrapper" v-else-if="categories.length">
      <table class="data-table">
        <thead>
          <tr>
            <th class="col-drag"></th>
            <th>ID</th>
            <th>分类名称</th>
            <th>描述</th>
            <th>文章数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(cat, index) in categories" :key="cat.id"
              :ref="el => rowRefs[index] = el"
              :style="{
                transform: getRowTransform(index),
                transition: isDragging ? 'transform 0.25s ease' : 'none',
                opacity: dragIndex === index ? 0.3 : 1
              }">
            <td class="col-drag">
              <span class="drag-handle" @mousedown.prevent="onMouseDown($event, cat, index)">⠿</span>
            </td>
            <td>{{ cat.id }}</td>
            <td>{{ cat.name }}</td>
            <td class="desc-cell">{{ cat.description || '-' }}</td>
            <td>{{ cat.article_count }}</td>
            <td class="actions">
              <button @click="openArticlesModal(cat)" class="btn-sm">相关文章</button>
              <button @click="openEditModal(cat)" class="btn-sm">编辑</button>
              <button @click="handleDelete(cat)" class="btn-sm btn-danger">删除</button>
              <button @click="openTransferModal(cat)" class="btn-sm btn-warn">转移</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="empty" v-else>暂无分类</div>

    <!-- 拖拽浮动层 -->
    <div v-if="isDragging" class="drag-ghost" :style="ghostStyle">
      <table class="data-table ghost-table">
        <tbody>
          <tr>
            <td class="col-drag"><span class="drag-handle">⠿</span></td>
            <td>{{ dragItem?.id }}</td>
            <td>{{ dragItem?.name }}</td>
            <td class="desc-cell">{{ dragItem?.description || '-' }}</td>
            <td>{{ dragItem?.article_count }}</td>
            <td class="actions">
              <button class="btn-sm">相关文章</button>
              <button class="btn-sm">编辑</button>
              <button class="btn-sm btn-danger">删除</button>
              <button class="btn-sm btn-warn">转移</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 新建/编辑弹窗 -->
    <div class="modal-overlay" v-if="showEditModal" @click.self="closeEditModal">
      <div class="modal-card">
        <h3 class="modal-title">{{ isEditing ? '编辑分类' : '新建分类' }}</h3>
        <div class="form-field">
          <label>分类名称</label>
          <input v-model="editForm.name" placeholder="请输入分类名称" />
        </div>
        <div class="form-field">
          <label>描述</label>
          <textarea v-model="editForm.description" placeholder="请输入分类描述" rows="3"></textarea>
        </div>
        <div class="form-field" v-if="!isEditing">
          <label>排序值（越小越靠前）</label>
          <input v-model.number="editForm.sort" type="number" placeholder="0" />
        </div>
        <p class="form-error" v-if="editError">{{ editError }}</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="closeEditModal">取消</button>
          <button class="btn-confirm" @click="handleSave" :disabled="editLoading">
            {{ editLoading ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 相关文章弹窗 -->
    <div class="modal-overlay" v-if="showArticlesModal" @click.self="closeArticlesModal">
      <div class="modal-card modal-large">
        <h3 class="modal-title">「{{ currentCategory?.name }}」的文章</h3>
        <div class="loading" v-if="articlesLoading">加载中...</div>
        <table class="data-table" v-else-if="articles.length">
          <thead>
            <tr>
              <th>ID</th>
              <th>封面</th>
              <th>标题</th>
              <th>发布时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in articles" :key="a.id">
              <td>{{ a.id }}</td>
              <td><img v-if="a.cover" :src="a.cover" class="article-cover" /><span v-else>-</span></td>
              <td>{{ a.title }}</td>
              <td>{{ a.publish_time || '-' }}</td>
            </tr>
          </tbody>
        </table>
        <div class="empty" v-else>该分类下暂无文章</div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="closeArticlesModal">关闭</button>
        </div>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <div class="modal-overlay" v-if="showDeleteModal" @click.self="closeDeleteModal">
      <div class="modal-card">
        <h3 class="modal-title">删除分类</h3>
        <div v-if="deleteArticleCount > 0" class="delete-warning">
          <p>⚠️ 该分类下还有 <strong>{{ deleteArticleCount }}</strong> 篇文章</p>
          <p>请先将文章转移到其他分类，再删除该分类</p>
        </div>
        <div v-else class="delete-warning">
          <p>确定要删除分类「{{ currentCategory?.name }}」吗？</p>
          <p>该分类下没有文章，可以安全删除</p>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="closeDeleteModal">取消</button>
          <button class="btn-confirm btn-danger" @click="confirmDelete" :disabled="deleteArticleCount > 0">
            确认删除
          </button>
        </div>
      </div>
    </div>

    <!-- 转移文章弹窗 -->
    <div class="modal-overlay" v-if="showTransferModal" @click.self="closeTransferModal">
      <div class="modal-card">
        <h3 class="modal-title">转移文章</h3>
        <p class="transfer-info">将「{{ currentCategory?.name }}」下的所有文章转移到：</p>
        <div class="form-field">
          <label>目标分类</label>
          <select v-model="transferTargetId" class="transfer-select">
            <option value="" disabled>请选择目标分类</option>
            <option v-for="cat in otherCategories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>
        <p class="form-error" v-if="transferError">{{ transferError }}</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="closeTransferModal">取消</button>
          <button class="btn-confirm" @click="confirmTransfer" :disabled="!transferTargetId || transferLoading">
            {{ transferLoading ? '转移中...' : '确认转移' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  batchUpdateCategorySort,
  deleteCategory,
  getCategoryArticles,
  getCategoryArticleCount,
  transferArticles
} from '../../api/admin.js'

const categories = ref([])
const loading = ref(false)
const keyword = ref('')
let searchTimer = null

// 拖拽状态
const isDragging = ref(false)
const dragIndex = ref(-1)
const dragItem = ref(null)
const hoverIndex = ref(-1)
const startX = ref(0)
const startY = ref(0)
const offsetX = ref(0)
const offsetY = ref(0)
const ghostX = ref(0)
const ghostY = ref(0)
const rowRefs = reactive({})
const rowHeight = 48

// 编辑弹窗
const showEditModal = ref(false)
const isEditing = ref(false)
const editForm = ref({ name: '', description: '', sort: 0 })
const editId = ref(null)
const editLoading = ref(false)
const editError = ref('')

// 文章弹窗
const showArticlesModal = ref(false)
const articles = ref([])
const articlesLoading = ref(false)
const currentCategory = ref(null)

// 删除弹窗
const showDeleteModal = ref(false)
const deleteArticleCount = ref(0)

// 转移弹窗
const showTransferModal = ref(false)
const transferTargetId = ref('')
const transferLoading = ref(false)
const transferError = ref('')

const otherCategories = computed(() => {
  return categories.value.filter(c => c.id !== currentCategory.value?.id)
})

const ghostStyle = computed(() => ({
  position: 'fixed',
  left: ghostX.value + 'px',
  top: ghostY.value + 'px',
  zIndex: 9999,
  pointerEvents: 'none',
  opacity: 0.9,
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  borderRadius: '4px',
  background: 'var(--bg-card)',
  width: rowRefs[0]?.offsetWidth + 'px' || 'auto'
}))

// 计算每行的 Y 轴偏移
function getRowTransform(index) {
  if (!isDragging.value || dragIndex.value === -1 || hoverIndex.value === -1) {
    return 'translateY(0)'
  }
  if (index === dragIndex.value) {
    return 'translateY(0)'
  }
  if (dragIndex.value < hoverIndex.value) {
    if (index > dragIndex.value && index <= hoverIndex.value) {
      return 'translateY(-' + rowHeight + 'px)'
    }
  } else if (dragIndex.value > hoverIndex.value) {
    if (index >= hoverIndex.value && index < dragIndex.value) {
      return 'translateY(' + rowHeight + 'px)'
    }
  }
  return 'translateY(0)'
}

async function fetchData() {
  loading.value = true
  try {
    categories.value = await getAdminCategories(keyword.value)
  } catch (e) {
    console.error(e)
  }
  loading.value = false
}

function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(fetchData, 300)
}

// 鼠标拖拽
function onMouseDown(e, cat, index) {
  isDragging.value = true
  dragIndex.value = index
  dragItem.value = cat
  hoverIndex.value = index

  // 记录鼠标起始位置和偏移
  const rect = rowRefs[index].getBoundingClientRect()
  startX.value = e.clientX
  startY.value = e.clientY
  offsetX.value = e.clientX - rect.left
  offsetY.value = e.clientY - rect.top
  ghostX.value = rect.left
  ghostY.value = rect.top

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(e) {
  if (!isDragging.value) return

  // 浮动层跟随鼠标
  ghostX.value = e.clientX - offsetX.value
  ghostY.value = e.clientY - offsetY.value

  // 计算 hoverIndex：根据鼠标 Y 位置判断应该插入到哪一行
  const tableRect = rowRefs[0]?.closest('tbody')?.getBoundingClientRect()
  if (!tableRect) return

  const mouseY = e.clientY
  let newHoverIndex = dragIndex.value

  for (let i = 0; i < categories.value.length; i++) {
    if (i === dragIndex.value) continue
    const row = rowRefs[i]
    if (!row) continue
    const rect = row.getBoundingClientRect()
    const midY = rect.top + rect.height / 2
    if (mouseY < midY) {
      newHoverIndex = i
      break
    }
    newHoverIndex = i
  }

  hoverIndex.value = newHoverIndex
}

function onMouseUp() {
  if (!isDragging.value) return

  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)

  if (dragIndex.value !== hoverIndex.value) {
    const newCategories = [...categories.value]
    const [item] = newCategories.splice(dragIndex.value, 1)
    newCategories.splice(hoverIndex.value, 0, item)

    for (let i = 0; i < newCategories.length; i++) {
      newCategories[i].sort = i
    }
    categories.value = newCategories

    const ids = newCategories.map(c => c.id)
    batchUpdateCategorySort(ids).catch(e => {
      console.error(e)
      fetchData()
    })
  }

  isDragging.value = false
  dragIndex.value = -1
  dragItem.value = null
  hoverIndex.value = -1
}

onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)
})

// 新建/编辑
function openCreateModal() {
  isEditing.value = false
  editId.value = null
  editForm.value = { name: '', description: '', sort: categories.value.length }
  editError.value = ''
  showEditModal.value = true
}

function openEditModal(cat) {
  isEditing.value = true
  editId.value = cat.id
  editForm.value = { name: cat.name, description: cat.description, sort: cat.sort }
  editError.value = ''
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
}

async function handleSave() {
  if (!editForm.value.name.trim()) {
    editError.value = '请输入分类名称'
    return
  }
  editLoading.value = true
  editError.value = ''
  try {
    if (isEditing.value) {
      await updateCategory(editId.value, {
        name: editForm.value.name,
        description: editForm.value.description
      })
    } else {
      await createCategory(editForm.value)
    }
    closeEditModal()
    fetchData()
  } catch (e) {
    editError.value = e.message || '操作失败'
  }
  editLoading.value = false
}

// 文章列表
async function openArticlesModal(cat) {
  currentCategory.value = cat
  articlesLoading.value = true
  showArticlesModal.value = true
  try {
    const res = await getCategoryArticles(cat.id, 1, 100)
    articles.value = res.list || []
  } catch (e) {
    console.error(e)
  }
  articlesLoading.value = false
}

function closeArticlesModal() {
  showArticlesModal.value = false
}

// 删除
async function handleDelete(cat) {
  currentCategory.value = cat
  try {
    const res = await getCategoryArticleCount(cat.id)
    deleteArticleCount.value = res.count || 0
  } catch (e) {
    deleteArticleCount.value = 0
  }
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
}

async function confirmDelete() {
  try {
    await deleteCategory(currentCategory.value.id)
    closeDeleteModal()
    fetchData()
  } catch (e) {
    alert(e.message || '删除失败')
  }
}

// 转移
function openTransferModal(cat) {
  currentCategory.value = cat
  transferTargetId.value = ''
  transferError.value = ''
  showTransferModal.value = true
}

function closeTransferModal() {
  showTransferModal.value = false
}

async function confirmTransfer() {
  if (!transferTargetId.value) return
  transferLoading.value = true
  transferError.value = ''
  try {
    await transferArticles(currentCategory.value.id, transferTargetId.value)
    closeTransferModal()
    fetchData()
  } catch (e) {
    transferError.value = e.message || '转移失败'
  }
  transferLoading.value = false
}

onMounted(fetchData)
</script>

<style scoped>
.page-title { font-family: var(--font-serif); font-size: 28px; font-weight: 700; color: var(--heading); margin-bottom: 20px; }
.filter-bar { display: flex; gap: 10px; margin-bottom: 20px; }
.search-input { flex: 1; height: 38px; padding: 0 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg); color: var(--text); font-size: 14px; outline: none; }
.search-input:focus { border-color: var(--accent-border); }
.btn-new { height: 38px; padding: 0 16px; border: none; border-radius: var(--radius-sm); background: var(--accent); color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all var(--transition); }
.btn-new:hover { opacity: 0.88; }

.table-wrapper { overflow: visible; }
.data-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
.data-table th, .data-table td { padding: 12px 14px; text-align: left; border-bottom: 1px solid var(--border-light); font-size: 14px; }
.data-table th { font-weight: 600; color: var(--text-secondary); font-size: 12px; }
.data-table tbody tr { will-change: transform; }
.col-drag { width: 40px; }
.desc-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.drag-handle { cursor: grab; color: var(--text-muted); font-size: 18px; user-select: none; }
.drag-handle:active { cursor: grabbing; }

/* 拖拽浮动层 */
.drag-ghost { pointer-events: none; }
.ghost-table { margin: 0; }
.ghost-table td { padding: 12px 14px; font-size: 14px; }

.actions { display: flex; gap: 6px; flex-wrap: wrap; }
.btn-sm { padding: 4px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-card); color: var(--text-secondary); font-size: 12px; cursor: pointer; transition: all var(--transition); }
.btn-sm:hover { border-color: var(--accent-border); color: var(--accent); }
.btn-danger:hover { border-color: #dc2626; color: #dc2626; }
.btn-warn:hover { border-color: #f59e0b; color: #f59e0b; }

.loading, .empty { text-align: center; padding: 48px 0; color: var(--text-muted); }

/* 弹窗 */
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.35); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px; }
.modal-card { width: 100%; max-width: 480px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 32px; box-shadow: var(--shadow-lg); }
.modal-large { max-width: 700px; max-height: 80vh; overflow-y: auto; }
.modal-title { font-family: var(--font-serif); font-size: 20px; font-weight: 700; color: var(--heading); margin-bottom: 20px; }

.form-field { margin-bottom: 16px; }
.form-field label { display: block; font-size: 13px; font-weight: 500; color: var(--text-secondary); margin-bottom: 6px; }
.form-field input, .form-field textarea, .transfer-select { width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg); color: var(--text); font-size: 14px; font-family: var(--font-sans); outline: none; transition: border-color var(--transition); }
.form-field input:focus, .form-field textarea:focus, .transfer-select:focus { border-color: var(--accent-border); }
.form-field textarea { resize: vertical; }

.form-error { color: var(--danger); font-size: 13px; margin: 8px 0; }

.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
.btn-cancel, .btn-confirm { height: 38px; padding: 0 20px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 14px; cursor: pointer; transition: all var(--transition); }
.btn-cancel { background: var(--bg-card); color: var(--text-secondary); }
.btn-cancel:hover { border-color: var(--accent-border); }
.btn-confirm { background: var(--accent); color: #fff; border-color: var(--accent); }
.btn-confirm:hover { opacity: 0.88; }
.btn-confirm:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-confirm.btn-danger { background: #dc2626; border-color: #dc2626; }

.delete-warning { padding: 12px; background: #fef3c7; border-radius: var(--radius-sm); color: #92400e; }
.delete-warning p { margin: 4px 0; font-size: 14px; }

.transfer-info { font-size: 14px; color: var(--text-secondary); margin-bottom: 16px; }

.article-cover { width: 60px; height: 40px; object-fit: cover; border-radius: 4px; }
</style>
