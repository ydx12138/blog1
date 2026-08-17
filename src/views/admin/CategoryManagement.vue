<template>
  <section class="category-management">
    <header class="page-header">
      <div>
        <h1 class="page-title">分类管理</h1>
        <p class="page-desc">拖动左侧手柄调整前台分类展示顺序</p>
      </div>
      <button class="btn-primary" @click="openCreate">新增分类</button>
    </header>

    <div class="filter-bar">
      <input v-model.trim="keyword" class="search-input" placeholder="搜索分类名称" @input="queueSearch" />
      <button v-if="keyword" class="btn-secondary" @click="resetSearch">清空</button>
    </div>
    <p v-if="keyword" class="search-hint">搜索结果不可拖拽排序，请清空搜索后调整顺序。</p>

    <div v-if="loading" class="empty-state">加载中...</div>
    <div v-else-if="!categories.length" class="empty-state">暂无分类</div>
    <div v-else class="table-scroll">
      <table class="data-table">
        <colgroup>
          <col style="width:44px" />
          <col style="width:70px" />
          <col style="width:220px" />
          <col style="width:auto" />
          <col style="width:80px" />
          <col style="width:90px" />
          <col style="width:165px" />
          <col style="width:165px" />
          <col style="width:180px" />
        </colgroup>
        <thead>
          <tr><th></th><th>ID</th><th>名称</th><th>描述</th><th>排序</th><th>文章数</th><th>创建时间</th><th>更新时间</th><th>操作</th></tr>
        </thead>
        <TransitionGroup tag="tbody" name="category-list">
          <tr
            v-for="(category, index) in categories"
            :key="category.id"
            :class="{
              dragging: draggingCategoryID === category.id,
              'insert-before': insertionCategoryID === category.id && insertionSide === 'before',
              'insert-after': insertionCategoryID === category.id && insertionSide === 'after',
              'drop-bounce': placedCategoryID === category.id,
            }"
            :data-category-id="category.id"
          >
            <td class="drag-cell">
              <span
                class="drag-handle"
                :class="{ disabled: keyword }"
                title="拖拽排序"
                @pointerdown.prevent="startPointerDrag(category.id, $event)"
              >&#8942;&#8942;</span>
            </td>
            <td>{{ category.id }}</td>
            <td class="cell-ellipsis" :title="category.name">{{ category.name }}</td>
            <td class="cell-ellipsis" :title="category.description || '-'">{{ category.description || '-' }}</td>
            <td>{{ category.sort }}</td>
            <td>{{ category.article_count }}</td>
            <td>{{ formatDate(category.created_at) }}</td>
            <td>{{ formatDate(category.updated_at) }}</td>
            <td class="actions">
              <button class="btn-sm" @click="openEdit(category)">修改</button>
              <button class="btn-sm btn-danger" @click="openDelete(category)">删除</button>
            </td>
          </tr>
        </TransitionGroup>
      </table>
    </div>

    <Teleport to="body">
      <div v-if="formVisible" class="modal-overlay" @click.self="formVisible = false">
        <section class="modal-card" role="dialog" aria-modal="true">
          <h2>{{ editingCategory ? '修改分类' : '新增分类' }}</h2>
          <label>分类名称<input v-model.trim="form.name" maxlength="50" placeholder="请输入分类名称" /></label>
          <label>分类描述<textarea v-model.trim="form.description" maxlength="255" rows="4" placeholder="可选"></textarea></label>
          <div class="modal-actions">
            <button class="btn-secondary" @click="formVisible = false">取消</button>
            <button class="btn-primary" :disabled="saving" @click="submitForm">保存</button>
          </div>
        </section>
      </div>

      <div v-if="deleteVisible" class="modal-overlay" @click.self="deleteVisible = false">
        <section class="modal-card delete-card" role="dialog" aria-modal="true">
          <h2>删除分类</h2>
          <p>“{{ deletingCategory?.name }}”下共有 {{ deletingCategory?.article_count }} 篇文章。</p>
          <template v-if="deletingCategory?.article_count">
            <div class="delete-mode">
              <label><input v-model="deleteMode" type="radio" value="force" /> 删除分类及其文章</label>
              <label><input v-model="deleteMode" type="radio" value="transfer" /> 迁移文章后删除分类</label>
            </div>
            <label v-if="deleteMode === 'force'">请输入“确认删除”<input v-model.trim="confirmText" placeholder="确认删除" /></label>
            <label v-else>迁移到<select v-model.number="targetCategoryID"><option :value="0">请选择目标分类</option><option v-for="item in transferTargets" :key="item.id" :value="item.id">{{ item.name }}</option></select></label>
          </template>
          <div class="modal-actions">
            <button class="btn-secondary" @click="deleteVisible = false">取消</button>
            <button class="btn-danger-fill" :disabled="!canDelete || saving" @click="submitDelete">确认删除</button>
          </div>
        </section>
      </div>
    </Teleport>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  getAdminCategoryArticleCount,
  updateAdminCategory,
  updateAdminCategorySort,
} from '../../api/admin.js'
import { showError } from '../../composables/useNotice.js'

const categories = ref([])
const keyword = ref('')
const loading = ref(false)
const saving = ref(false)
const draggingCategoryID = ref(0)
const dragStartOrder = ref([])
const dragStartCategories = ref([])
const insertionCategoryID = ref(0)
const insertionSide = ref('')
const placedCategoryID = ref(0)
const formVisible = ref(false)
const deleteVisible = ref(false)
const editingCategory = ref(null)
const deletingCategory = ref(null)
const deleteTargets = ref([])
const deleteMode = ref('force')
const confirmText = ref('')
const targetCategoryID = ref(0)
const form = reactive({ name: '', description: '' })
let searchTimer = null
let dragGhost = null
let dragOffsetX = 0
let dragOffsetY = 0

const transferTargets = computed(() => deleteTargets.value.filter(item => item.id !== deletingCategory.value?.id))
const canDelete = computed(() => {
  if (!deletingCategory.value) return false
  if (!deletingCategory.value.article_count) return true
  return deleteMode.value === 'force'
    ? confirmText.value === '确认删除'
    : targetCategoryID.value > 0
})

// loadCategories 获取当前关键词对应的分类列表；无参数；返回分类列表加载结果。
async function loadCategories() {
  loading.value = true
  try {
    categories.value = await getAdminCategories(keyword.value)
  } catch (error) {
    showError(error.message || '分类加载失败')
  } finally {
    loading.value = false
  }
}

// queueSearch 延迟提交分类名称搜索；无参数；返回空值。
function queueSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(loadCategories, 300)
}

// resetSearch 清空关键词并加载完整分类列表；无参数；返回空值。
function resetSearch() {
  keyword.value = ''
  loadCategories()
}

// startPointerDrag 开始由左侧手柄触发的指针拖拽；参数 categoryID 为分类 ID，event 为指针事件；返回空值。
function startPointerDrag(categoryID, event) {
  if (keyword.value) return
  const sourceRow = event.currentTarget.closest('tr')
  const sourceRect = sourceRow.getBoundingClientRect()
  draggingCategoryID.value = categoryID
  dragStartOrder.value = categories.value.map(item => item.id)
  dragStartCategories.value = [...categories.value]
  dragOffsetX = event.clientX - sourceRect.left
  dragOffsetY = event.clientY - sourceRect.top
  dragGhost = sourceRow.closest('table').cloneNode(false)
  const ghostColgroup = sourceRow.closest('table').querySelector('colgroup')?.cloneNode(true)
  const ghostBody = document.createElement('tbody')
  ghostBody.appendChild(sourceRow.cloneNode(true))
  if (ghostColgroup) dragGhost.appendChild(ghostColgroup)
  dragGhost.appendChild(ghostBody)
  dragGhost.style.position = 'fixed'
  dragGhost.style.left = `${sourceRect.left}px`
  dragGhost.style.top = `${sourceRect.top}px`
  dragGhost.style.width = `${sourceRect.width}px`
  dragGhost.style.minWidth = `${sourceRect.width}px`
  dragGhost.style.tableLayout = 'fixed'
  dragGhost.style.borderCollapse = 'collapse'
  dragGhost.style.zIndex = '5000'
  dragGhost.style.pointerEvents = 'none'
  dragGhost.style.background = 'var(--bg-card)'
  dragGhost.style.opacity = '1'
  dragGhost.style.transform = 'scale(1.05)'
  dragGhost.style.boxShadow = '0 0 20px rgba(15, 23, 42, .24)'
  document.body.appendChild(dragGhost)
  document.addEventListener('pointermove', handlePointerMove)
  document.addEventListener('pointerup', endDrag)
  document.addEventListener('pointercancel', endDrag)
}

// handlePointerMove 移动拖拽预览并根据指针位置调整分类顺序；参数 event 为指针事件；返回空值。
function handlePointerMove(event) {
  if (!draggingCategoryID.value) return
  event.preventDefault()
  if (dragGhost) {
    dragGhost.style.left = `${event.clientX - dragOffsetX}px`
    dragGhost.style.top = `${event.clientY - dragOffsetY}px`
  }
  const targetRow = document.elementFromPoint(event.clientX, event.clientY)?.closest('tr[data-category-id]')
  if (!targetRow) return
  const targetCategoryID = Number(targetRow.dataset.categoryId)
  const targetIndex = categories.value.findIndex(item => item.id === targetCategoryID)
  if (targetIndex >= 0) moveCategory(targetIndex, event, targetRow)
}

// moveCategory 根据指针所在行的上半区或下半区即时重排分类；参数 targetIndex 为目标行下标，event 为指针事件，targetRow 为目标行；返回空值。
function moveCategory(targetIndex, event, targetRow) {
  if (keyword.value || !draggingCategoryID.value) return
  const sourceIndex = categories.value.findIndex(item => item.id === draggingCategoryID.value)
  if (sourceIndex < 0) return

  const targetRect = targetRow.getBoundingClientRect()
  const side = event.clientY > targetRect.top + targetRect.height / 2 ? 'after' : 'before'
  insertionCategoryID.value = categories.value[targetIndex].id
  insertionSide.value = side
  let insertIndex = targetIndex + (side === 'after' ? 1 : 0)
  if (sourceIndex < insertIndex) insertIndex -= 1
  if (sourceIndex === insertIndex) return

  const [moved] = categories.value.splice(sourceIndex, 1)
  categories.value.splice(insertIndex, 0, moved)
}

// endDrag 结束指针拖拽、清理监听并持久化最终排序；无参数；返回排序保存结果。
async function endDrag() {
  if (!draggingCategoryID.value) return
  const currentOrder = categories.value.map(item => item.id)
  const droppedCategoryID = draggingCategoryID.value
  const hasChanged = dragStartOrder.value.length > 0
    && currentOrder.some((id, index) => id !== dragStartOrder.value[index])
  draggingCategoryID.value = 0
  dragStartOrder.value = []
  insertionCategoryID.value = 0
  insertionSide.value = ''
  document.removeEventListener('pointermove', handlePointerMove)
  document.removeEventListener('pointerup', endDrag)
  document.removeEventListener('pointercancel', endDrag)
  if (dragGhost) {
    dragGhost.remove()
    dragGhost = null
  }
  const previous = [...dragStartCategories.value]
  dragStartCategories.value = []
  if (!hasChanged) return

  placedCategoryID.value = droppedCategoryID
  setTimeout(() => {
    placedCategoryID.value = 0
  }, 360)

  try {
    await updateAdminCategorySort(currentOrder)
    await loadCategories()
  } catch (error) {
    categories.value = previous
    showError(error.message || '排序保存失败')
  }
}

// openCreate 打开新增分类表单；无参数；返回空值。
function openCreate() {
  editingCategory.value = null
  form.name = ''
  form.description = ''
  formVisible.value = true
}

// openEdit 打开指定分类的编辑表单；参数 category 为分类记录；返回空值。
function openEdit(category) {
  editingCategory.value = category
  form.name = category.name
  form.description = category.description || ''
  formVisible.value = true
}

// submitForm 保存新增或修改分类；无参数；返回保存请求结果。
async function submitForm() {
  if (!form.name) {
    showError('请输入分类名称')
    return
  }
  saving.value = true
  try {
    if (editingCategory.value) await updateAdminCategory(editingCategory.value.id, form)
    else await createAdminCategory(form)
    formVisible.value = false
    await loadCategories()
  } catch (error) {
    showError(error.message || '分类保存失败')
  } finally {
    saving.value = false
  }
}

// openDelete 查询文章数量并打开删除方式弹窗；参数 category 为待删除分类；返回查询结果。
async function openDelete(category) {
  try {
    const [countData, allCategories] = await Promise.all([
      getAdminCategoryArticleCount(category.id),
      getAdminCategories(),
    ])
    deletingCategory.value = { ...category, article_count: countData.count || 0 }
    deleteTargets.value = allCategories
    deleteMode.value = 'force'
    confirmText.value = ''
    targetCategoryID.value = 0
    deleteVisible.value = true
  } catch (error) {
    showError(error.message || '文章数量获取失败')
  }
}

// submitDelete 根据当前模式删除或迁移后删除分类；无参数；返回删除请求结果。
async function submitDelete() {
  if (!canDelete.value || !deletingCategory.value) return
  const data = deletingCategory.value.article_count
    ? deleteMode.value === 'force'
      ? { force: true, confirm_text: confirmText.value }
      : { target_category_id: targetCategoryID.value }
    : {}
  saving.value = true
  try {
    await deleteAdminCategory(deletingCategory.value.id, data)
    deleteVisible.value = false
    await loadCategories()
  } catch (error) {
    showError(error.message || '分类删除失败')
  } finally {
    saving.value = false
  }
}

// formatDate 格式化分类时间字段；参数 value 为时间值；返回展示用日期文本。
function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('zh-CN')
}

onMounted(loadCategories)
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 20px; }
.page-title { margin: 0; color: var(--heading); font-family: var(--font-serif); font-size: 28px; font-weight: 700; }
.page-desc, .search-hint { margin: 6px 0 0; color: var(--text-muted); font-size: 13px; }
.filter-bar { display: flex; gap: 10px; margin-bottom: 10px; }
.search-input { flex: 1; max-width: 420px; height: 38px; padding: 0 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg); color: var(--text); font: inherit; outline: none; }
.search-input:focus { border-color: var(--accent-border); }
.table-scroll { overflow-x: auto; margin-top: 18px; }
.data-table { width: 100%; min-width: 1050px; border-collapse: collapse; table-layout: fixed; }
.data-table th, .data-table td { padding: 12px 14px; border-bottom: 1px solid var(--border-light); text-align: left; font-size: 14px; }
.data-table th { color: var(--text-secondary); font-size: 12px; font-weight: 600; }
.data-table td:not(.actions) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.drag-cell { width: 44px; padding-right: 4px !important; padding-left: 4px !important; overflow: visible !important; text-align: center !important; }
.drag-handle { display: inline-flex; align-items: center; justify-content: center; width: 22px; color: var(--text-muted); cursor: grab; font-size: 18px; letter-spacing: 0; opacity: 1; overflow: visible; touch-action: none; user-select: none; transition: color .16s ease; }
.drag-handle:hover { color: var(--accent); }
.drag-handle.disabled { cursor: not-allowed; opacity: .35; }
.dragging { visibility: hidden; background: transparent; }
.category-list-move { transition: transform .18s ease; }
.insert-before td { border-top: 2px dashed #2563eb !important; }
.insert-after td { border-bottom: 2px dashed #2563eb !important; }
.drop-bounce { animation: category-drop-bounce .36s cubic-bezier(.34, 1.56, .64, 1); }
@keyframes category-drop-bounce { 0% { transform: scale(1); } 55% { transform: scale(1.02); } 100% { transform: scale(1); } }
.cell-ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.actions { display: flex; gap: 6px; }
.btn-primary, .btn-secondary, .btn-sm, .btn-danger-fill { border-radius: var(--radius-sm); font-family: var(--font-sans); cursor: pointer; transition: all var(--transition); }
.btn-primary { border: 1px solid var(--accent); background: var(--accent); color: #fff; padding: 8px 14px; font-size: 13px; }
.btn-secondary { border: 1px solid var(--border); background: var(--bg); color: var(--text-secondary); padding: 8px 14px; font-size: 13px; }
.btn-sm { border: 1px solid var(--border); background: var(--bg-card); color: var(--text-secondary); padding: 4px 9px; font-size: 12px; }
.btn-sm:hover, .btn-secondary:hover { border-color: var(--accent-border); color: var(--accent); }
.btn-danger { color: var(--danger); }
.btn-danger-fill { border: 1px solid var(--danger); background: var(--danger); color: #fff; padding: 8px 14px; font-size: 13px; }
button:disabled { cursor: not-allowed; opacity: .5; }
.empty-state { display: grid; min-height: 220px; place-items: center; color: var(--text-muted); }
.modal-overlay { position: fixed; inset: 0; z-index: 3000; display: grid; place-items: center; padding: 20px; background: rgba(0, 0, 0, .35); backdrop-filter: blur(3px); }
.modal-card { width: min(460px, 100%); padding: 24px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--bg-card); box-shadow: var(--shadow-lg); }
.modal-card h2 { margin: 0 0 20px; color: var(--heading); font-size: 18px; }
.modal-card p { margin: 0 0 16px; color: var(--text-secondary); font-size: 14px; line-height: 1.6; }
.modal-card label { display: flex; flex-direction: column; gap: 7px; margin-top: 14px; color: var(--text-secondary); font-size: 13px; }
.modal-card input, .modal-card textarea, .modal-card select { box-sizing: border-box; width: 100%; padding: 9px 10px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg); color: var(--text); font: inherit; outline: none; }
.modal-card input:focus, .modal-card textarea:focus, .modal-card select:focus { border-color: var(--accent-border); }
.delete-mode { display: grid; gap: 10px; margin: 14px 0 4px; }
.delete-mode label { display: flex; flex-direction: row; align-items: center; margin: 0; }
.delete-mode input { width: auto; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px; }
@media (max-width: 768px) { .page-header { align-items: stretch; flex-direction: column; } .btn-primary { align-self: flex-start; } }
</style>
