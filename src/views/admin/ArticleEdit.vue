<template>
  <div class="article-edit">
    <div class="page-header">
      <h1 class="page-title">{{ isNew ? '新建文章' : '编辑文章' }}</h1>
      <div class="header-actions">
        <button class="btn-save" @click="saveDraft" :disabled="saving">保存草稿</button>
        <button class="btn-publish" @click="publish" :disabled="saving">{{ saving ? '保存中...' : '发布' }}</button>
      </div>
    </div>

    <div class="loading" v-if="loading">加载中...</div>
    <form class="edit-form" v-else @submit.prevent>
      <div class="form-row">
        <div class="form-group flex-1">
          <label>标题</label>
          <input v-model="form.title" type="text" placeholder="文章标题" required />
        </div>
        <div class="form-group w-200">
          <label>分类</label>
          <select v-model="form.category_id">
            <option :value="0">选择分类</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group flex-1">
          <label>摘要</label>
          <textarea v-model="form.summary" rows="2" placeholder="文章摘要（可选）"></textarea>
        </div>
        <div class="form-group w-200">
          <label>封面图片</label>
          <ImageUpload :value="form.cover" @uploaded="form.cover = $event" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-group w-150">
          <label>标签</label>
          <input v-model="form.tags" type="text" placeholder="逗号分隔" />
        </div>
        <div class="form-group w-150">
          <label>编辑器类型</label>
          <select v-model="form.content_type">
            <option :value="1">wangEditor 富文本</option>
            <option :value="2">md-editor-v3 Markdown</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>内容</label>
        <!-- wangEditor 富文本编辑器 -->
        <div v-if="form.content_type === 1" class="richtext-editor">
          <Toolbar :editor="richEditor" :defaultConfig="richToolbarConfig" mode="default" />
          <Editor v-model="form.content" :defaultConfig="richEditorConfig" mode="default" @onCreated="onRichCreated" />
        </div>
        <!-- md-editor-v3 Markdown编辑器 -->
        <div v-else class="markdown-editor">
          <MdEditor v-model="form.content" language="zh-CN" />
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, shallowRef, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createArticle, updateArticle, getAdminArticle } from '../../api/admin.js'
import { getCategories } from '../../api/categories.js'
import ImageUpload from '../../components/ImageUpload.vue'

// wangEditor
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

// md-editor-v3
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const route = useRoute()
const router = useRouter()
const articleId = computed(() => route.params.id)
const isNew = computed(() => articleId.value === 'new' || !articleId.value)

const form = ref({ title: '', summary: '', content: '', content_type: 1, cover: '', category_id: 0, tags: '', status: 1 })
const categories = ref([])
const loading = ref(false)
const saving = ref(false)

// wangEditor
const richEditor = shallowRef(null)
const richToolbarConfig = {
  excludeKeys: ['group-video'],
}
const richEditorConfig = {
  placeholder: '请输入内容...',
  MENU_CONF: {},
}

function onRichCreated(editor) {
  richEditor.value = editor
}

onBeforeUnmount(() => {
  if (richEditor.value) {
    richEditor.value.destroy()
    richEditor.value = null
  }
})

async function loadArticle() {
  if (isNew.value) return
  loading.value = true
  try {
    const a = await getAdminArticle(articleId.value)
    form.value = {
      title: a.title, summary: a.summary, content: a.content || '',
      content_type: a.content_type || 1, cover: a.cover || '',
      category_id: a.category_id || a.CategoryID || 0, tags: a.tags || '', status: a.status || 1,
    }
  } catch (e) { console.error(e) }
  loading.value = false
}

async function saveDraft() { await save(1) }
async function publish() { await save(2) }

async function save(status) {
  if (!form.value.title) { alert('请输入标题'); return }
  saving.value = true
  try {
    const data = { ...form.value, status }
    if (isNew.value) {
      await createArticle(data)
    } else {
      await updateArticle(articleId.value, data)
    }
    router.push('/admin/articles')
  } catch (e) { alert(e.message) }
  saving.value = false
}

onMounted(async () => {
  try { categories.value = await getCategories() } catch (e) { console.error(e) }
  loadArticle()
})
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-title { font-family: var(--font-serif); font-size: 28px; font-weight: 700; color: var(--heading); }
.header-actions { display: flex; gap: 10px; }
.btn-save, .btn-publish { padding: 10px 24px; border: none; border-radius: var(--radius-sm); font-size: 14px; font-weight: 500; cursor: pointer; transition: all var(--transition); }
.btn-save { background: var(--bg-card); color: var(--text-secondary); border: 1px solid var(--border); }
.btn-save:hover { border-color: var(--accent-border); color: var(--accent); }
.btn-publish { background: var(--accent); color: #fff; }
.btn-publish:hover { opacity: 0.9; }
.btn-save:disabled, .btn-publish:disabled { opacity: 0.5; cursor: not-allowed; }
.edit-form { display: flex; flex-direction: column; gap: 20px; }
.form-row { display: flex; gap: 16px; flex-wrap: wrap; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
.form-group input, .form-group select, .form-group textarea {
  padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm);
  background: var(--bg); color: var(--text); font-size: 14px; font-family: var(--font-sans); outline: none;
  transition: border-color var(--transition); resize: vertical;
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--accent-border); box-shadow: 0 0 0 3px var(--accent-light); }
.flex-1 { flex: 1; min-width: 200px; }
.w-200 { width: 220px; }
.w-150 { width: 150px; }
.richtext-editor { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
.richtext-editor :deep(.w-e-toolbar) { border-bottom: 1px solid var(--border); }
.richtext-editor :deep(.w-e-text-container) { min-height: 400px; background: var(--bg); }
.markdown-editor { min-height: 400px; }
.loading { text-align: center; padding: 64px 0; color: var(--text-muted); }
@media (max-width: 768px) {
  .w-200, .w-150 { width: 100%; }
}
</style>
