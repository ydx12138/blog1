<template>
  <div class="article-editor-page">
    <!-- 顶部栏 -->
    <header class="editor-topbar">
      <router-link to="/admin/articles" class="back-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        返回
      </router-link>
      <h1 class="topbar-title">{{ isNew ? '新建文章' : '编辑文章' }}</h1>
      <div class="topbar-actions">
        <button class="btn-draft" @click="saveDraft" :disabled="saving">保存草稿</button>
        <button class="btn-publish" @click="publish" :disabled="saving">{{ saving ? '保存中...' : '发布' }}</button>
      </div>
    </header>

    <div class="loading-msg" v-if="loading">加载中...</div>

    <!-- 表单 -->
    <form class="editor-form" v-else @submit.prevent>
      <!-- 1. 编辑器类型 -->
      <div class="field">
        <label class="field-label">编辑器类型</label>
        <div class="editor-type-switch">
          <button type="button" :class="{ active: form.content_type === 1 }" @click="switchEditor(1)">wangEditor 富文本</button>
          <button type="button" :class="{ active: form.content_type === 2 }" @click="switchEditor(2)">Markdown</button>
        </div>
      </div>

      <!-- 2. 标题 -->
      <div class="field">
        <label class="field-label">标题</label>
        <input v-model="form.title" type="text" class="field-input" placeholder="输入文章标题" required />
      </div>

      <!-- 3. 内容 -->
      <div class="field">
        <label class="field-label">内容</label>
        <div v-if="form.content_type === 1" class="richtext-editor">
          <Toolbar :editor="richEditor" :defaultConfig="richToolbarConfig" mode="default" />
          <Editor v-model="form.content" :defaultConfig="richEditorConfig" mode="default" @onCreated="onRichCreated" />
        </div>
        <div v-else class="markdown-editor">
          <MdEditor v-model="form.content" language="zh-CN" />
        </div>
      </div>

      <!-- 4. 标签 -->
      <div class="field">
        <label class="field-label">标签</label>
        <div class="tag-selector">
          <!-- 可选标签（单行） -->
          <div class="tag-options-row" v-if="allTags.length">
            <span class="tag-options-label">可选：</span>
            <span class="tag-chips-row">
              <button
                v-for="t in allTags"
                :key="t"
                type="button"
                class="tag-chip"
                @click="pickTag(t)"
              >{{ t }}</button>
            </span>
            <button type="button" class="tag-more-btn" @click="showTagPopup = true">更多</button>
          </div>

          <!-- 已选标签 -->
          <div class="selected-tags" v-if="selectedTags.length">
            <span v-for="(t, i) in selectedTags" :key="i" class="tag-selected">
              {{ t }}
              <button type="button" class="tag-remove" @click="removeTag(i)">&times;</button>
            </span>
          </div>

          <!-- 输入框 -->
          <input
            v-model="tagInput"
            type="text"
            class="field-input"
            placeholder="点击上方标签或手动输入，回车添加"
            @keydown.enter.prevent="addCustomTag"
          />
        </div>
      </div>

      <!-- 标签弹窗 -->
      <Teleport to="body">
        <div class="tag-popup-overlay" v-if="showTagPopup" @click.self="showTagPopup = false">
          <div class="tag-popup">
            <div class="tag-popup-header">
              <h3>全部标签</h3>
              <button class="tag-popup-close" @click="showTagPopup = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="tag-popup-body">
              <button
                v-for="t in allTags"
                :key="t"
                type="button"
                class="tag-chip tag-chip-lg"
                @click="pickTag(t); showTagPopup = false"
              >{{ t }}</button>
            </div>
          </div>
        </div>
      </Teleport>

      <!-- 5. 封面 -->
      <div class="field">
        <label class="field-label">封面图片</label>
        <ImageUpload :value="form.cover" @uploaded="form.cover = $event" />
      </div>

      <!-- 6. 摘要 -->
      <div class="field">
        <label class="field-label">摘要</label>
        <textarea v-model="form.summary" class="field-textarea" rows="3" placeholder="文章摘要（可选）"></textarea>
      </div>

      <!-- 7. 分类 -->
      <div class="field">
        <label class="field-label">分类</label>
        <select v-model="form.category_id" class="field-select">
          <option :value="0">选择分类</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
        </select>
      </div>
    </form>

    <!-- 底部操作 -->
    <footer class="editor-footer">
      <button class="btn-draft" @click="saveDraft" :disabled="saving">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        保存草稿
      </button>
      <button class="btn-publish" @click="publish" :disabled="saving">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        {{ saving ? '保存中...' : '直接发布' }}
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, shallowRef, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createArticle, updateArticle, getAdminArticle } from '../../api/admin.js'
import { fetchTags } from '../../api/articles.js'
import { getCategories } from '../../api/categories.js'
import { useAuth } from '../../stores/auth.js'
import ImageUpload from '../../components/ImageUpload.vue'

import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const route = useRoute()
const router = useRouter()
const { isAdmin } = useAuth()

// 未登录跳转
if (!isAdmin.value) { router.replace('/admin/login') }

const articleId = computed(() => route.params.id)
const isNew = computed(() => articleId.value === 'new' || !articleId.value)

const form = ref({
  title: '', summary: '', content: '',
  content_type: 1, cover: '', category_id: 0,
  tags: '', status: 1,
})
const categories = ref([])
const allTags = ref([])
const tagInput = ref('')
const showTagPopup = ref(false)
const loading = ref(false)
const saving = ref(false)

// 当前已选标签
const selectedTags = computed(() => {
  if (!form.value.tags) return []
  return form.value.tags.split(',').map(t => t.trim()).filter(Boolean)
})

// 点击可选标签 → 写入输入框
function pickTag(tag) {
  const cur = tagInput.value.trim()
  tagInput.value = cur ? cur + ', ' + tag : tag
}

function removeTag(idx) {
  const cur = selectedTags.value.filter((_, i) => i !== idx)
  form.value.tags = cur.join(', ')
}

function addCustomTag() {
  const val = tagInput.value.trim()
  if (!val) return
  // 把输入框内容按逗号拆分，逐个加入已选
  const parts = val.split(/[,，]/).map(t => t.trim()).filter(Boolean)
  const cur = new Set(selectedTags.value)
  parts.forEach(t => cur.add(t))
  form.value.tags = [...cur].join(', ')
  tagInput.value = ''
}

// wangEditor
const richEditor = shallowRef(null)
const richToolbarConfig = { excludeKeys: ['group-video'] }
const richEditorConfig = { placeholder: '请输入内容...', MENU_CONF: {} }

function onRichCreated(editor) { richEditor.value = editor }

function switchEditor(type) {
  if (richEditor.value) { richEditor.value.destroy(); richEditor.value = null }
  form.value.content_type = type
  form.value.content = ''
}

onBeforeUnmount(() => {
  if (richEditor.value) { richEditor.value.destroy(); richEditor.value = null }
})

async function loadArticle() {
  if (isNew.value) return
  loading.value = true
  try {
    const a = await getAdminArticle(articleId.value)
    form.value = {
      title: a.title, summary: a.summary || '', content: a.content || '',
      content_type: a.content_type || 1, cover: a.cover || '',
      category_id: a.category_id || a.CategoryID || 0,
      tags: a.tags || '', status: a.status || 1,
    }
  } catch (e) { alert('加载文章失败：' + e.message) }
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
  try {
    categories.value = await getCategories()
    // 新建文章默认选"杂谈"分类
    if (isNew.value) {
      const defaultCat = categories.value.find(c => c.name === '杂谈')
      if (defaultCat) form.value.category_id = defaultCat.id
    }
  } catch (e) { console.error(e) }
  try { allTags.value = await fetchTags() } catch (e) { console.error(e) }
  loadArticle()
})
</script>

<style scoped>
.article-editor-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

/* 顶部栏 */
.editor-topbar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
  height: 56px;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-card);
  position: sticky;
  top: 0;
  z-index: 50;
}
.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; color: var(--text-secondary);
  text-decoration: none; transition: color var(--transition);
  white-space: nowrap;
}
.back-btn:hover { color: var(--accent); }
.topbar-title {
  flex: 1;
  font-family: var(--font-serif);
  font-size: 17px; font-weight: 600;
  color: var(--heading);
}
.topbar-actions { display: flex; gap: 8px; }

/* 按钮 */
.btn-draft, .btn-publish {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 18px; border: none; border-radius: var(--radius-sm);
  font-size: 13px; font-weight: 500; font-family: var(--font-sans);
  cursor: pointer; transition: all var(--transition);
  white-space: nowrap;
}
.btn-draft {
  background: var(--bg);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}
.btn-draft:hover:not(:disabled) { border-color: var(--accent-border); color: var(--accent); }
.btn-publish {
  background: var(--accent);
  color: #fff;
}
.btn-publish:hover:not(:disabled) { opacity: 0.9; }
.btn-draft:disabled, .btn-publish:disabled { opacity: 0.5; cursor: not-allowed; }

.loading-msg { text-align: center; padding: 80px 0; color: var(--text-muted); font-size: 14px; }

/* 表单 */
.editor-form {
  flex: 1;
  width: 100%;
  padding: 32px 40px 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.field { display: flex; flex-direction: column; gap: 6px; }
.field-label {
  font-size: 13px; font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
}

.field-input, .field-select, .field-textarea {
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text);
  font-size: 14px; font-family: var(--font-sans);
  outline: none;
  transition: border-color var(--transition);
}
.field-input:focus, .field-select:focus, .field-textarea:focus {
  border-color: var(--accent-border);
  box-shadow: 0 0 0 3px var(--accent-light);
}
.field-textarea { resize: vertical; min-height: 60px; }
.field-select { cursor: pointer; max-width: 240px; }

/* 标签选择器 */
.tag-selector { display: flex; flex-direction: column; gap: 10px; }

/* 可选标签行 */
.tag-options-row {
  display: flex; align-items: center; gap: 8px;
}
.tag-options-label { font-size: 12px; color: var(--text-muted); white-space: nowrap; flex-shrink: 0; }
.tag-chips-row {
  flex: 1; overflow: hidden; white-space: nowrap;
  display: flex; gap: 6px;
  mask-image: linear-gradient(to right, black 85%, transparent 98%);
  -webkit-mask-image: linear-gradient(to right, black 85%, transparent 98%);
}
.tag-chip {
  display: inline-block; padding: 3px 10px;
  border: 1px solid var(--border); border-radius: 100px;
  background: var(--bg-card); color: var(--text-secondary);
  font-size: 12px; font-family: var(--font-mono); cursor: pointer;
  transition: all var(--transition);
  white-space: nowrap; flex-shrink: 0;
}
.tag-chip:hover { border-color: var(--accent-border); color: var(--accent); background: var(--accent-light); }
.tag-more-btn {
  padding: 3px 14px; border: 1px solid var(--accent-border); border-radius: 100px;
  background: transparent; color: var(--accent);
  font-size: 12px; cursor: pointer; white-space: nowrap; flex-shrink: 0;
  transition: all var(--transition);
}
.tag-more-btn:hover { background: var(--accent-light); }

/* 已选标签 */
.selected-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.tag-selected {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px;
  border-radius: 100px;
  background: var(--accent); color: #fff;
  font-size: 12px; font-family: var(--font-mono);
}
.tag-remove {
  display: inline-flex; align-items: center; justify-content: center;
  width: 16px; height: 16px; border: none; border-radius: 50%;
  background: rgba(255,255,255,0.25); color: #fff;
  font-size: 12px; line-height: 1; cursor: pointer;
  transition: background var(--transition);
}
.tag-remove:hover { background: rgba(255,255,255,0.45); }

/* 标签弹窗 */
.tag-popup-overlay {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(0,0,0,0.35);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
}
.tag-popup {
  width: 800px; max-width: 90vw; max-height: 400px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex; flex-direction: column;
  animation: slideUp 0.2s ease;
}
@keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
.tag-popup-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid var(--border-light);
  flex-shrink: 0;
}
.tag-popup-header h3 { font-size: 16px; font-weight: 600; color: var(--heading); margin: 0; }
.tag-popup-close {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border: none; border-radius: var(--radius-sm);
  background: transparent; color: var(--text-muted); cursor: pointer;
  transition: all var(--transition);
}
.tag-popup-close:hover { background: var(--tag-bg); color: var(--text); }
.tag-popup-body {
  flex: 1; overflow-y: auto;
  padding: 20px; display: flex; flex-wrap: wrap; align-content: flex-start;
  gap: 8px;
}
.tag-chip-lg {
  padding: 6px 16px; font-size: 14px;
}

/* 编辑器类型切换 */
.editor-type-switch {
  display: flex; gap: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  width: fit-content;
}
.editor-type-switch button {
  padding: 8px 18px;
  border: none; background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 13px; font-family: var(--font-sans);
  cursor: pointer; transition: all var(--transition);
}
.editor-type-switch button + button { border-left: 1px solid var(--border); }
.editor-type-switch button.active {
  background: var(--accent);
  color: #fff;
}

/* 编辑器 */
.richtext-editor {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.richtext-editor :deep(.w-e-toolbar) { border-bottom: 1px solid var(--border); }
.richtext-editor :deep(.w-e-text-container) { min-height: 550px; background: var(--bg); }
.markdown-editor { min-height: 550px; }

/* 底部栏 */
.editor-footer {
  display: flex; justify-content: center; gap: 16px;
  padding: 20px 24px 40px;
  border-top: 1px solid var(--border-light);
  background: var(--bg);
}
.editor-footer .btn-draft,
.editor-footer .btn-publish {
  padding: 12px 40px;
  font-size: 15px;
}

@media (max-width: 768px) {
  .editor-topbar { padding: 0 12px; gap: 8px; }
  .topbar-title { font-size: 15px; }
  .editor-form { padding: 20px 12px; gap: 18px; }
  .editor-footer { flex-direction: column; align-items: center; }
  .btn-draft, .btn-publish { width: 100%; max-width: 360px; justify-content: center; }
}
</style>
