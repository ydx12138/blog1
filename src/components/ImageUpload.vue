<template>
  <div class="image-upload">
    <div class="upload-zone" @click="triggerInput" @dragover.prevent @drop.prevent="handleDrop">
      <input ref="fileInput" type="file" accept="image/*" @change="handleFile" hidden />
      <div v-if="!uploading && !preview" class="upload-placeholder">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        <p>点击或拖拽上传图片</p>
        <span class="hint">支持 JPG/PNG/GIF/WebP，最大10MB</span>
      </div>
      <div v-else-if="uploading" class="upload-placeholder"><p>上传中...</p></div>
      <div v-else class="preview-container">
        <img :src="preview" alt="预览" class="preview-img" />
        <div class="preview-actions">
          <button class="btn-copy" @click.stop="copyUrl">{{ copied ? '已复制' : '复制链接' }}</button>
          <button class="btn-remove" @click.stop="clear">重新上传</button>
        </div>
      </div>
    </div>
    <div class="url-input" v-if="preview">
      <label>图片URL</label>
      <input :value="url" readonly @focus="$event.target.select()" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { uploadImage } from '../api/admin.js'

const emit = defineEmits(['uploaded'])
const props = defineProps({ value: { type: String, default: '' } })

const fileInput = ref(null)
const preview = ref(props.value || '')
const url = ref(props.value || '')
const uploading = ref(false)
const copied = ref(false)

function triggerInput() { fileInput.value?.click() }
function handleDrop(e) { const file = e.dataTransfer.files[0]; if (file) upload(file) }
function handleFile(e) { const file = e.target.files[0]; if (file) upload(file) }

async function upload(file) {
  uploading.value = true
  try {
    const data = await uploadImage(file)
    url.value = data.url
    preview.value = data.url
    emit('uploaded', data.url)
  } catch (e) { alert(e.message) }
  uploading.value = false
}

function clear() { preview.value = ''; url.value = ''; emit('uploaded', '') }
async function copyUrl() {
  try { await navigator.clipboard.writeText(url.value); copied.value = true; setTimeout(() => copied.value = false, 2000) } catch { /* ignore */ }
}
</script>

<style scoped>
.upload-zone { border: 2px dashed var(--border); border-radius: var(--radius); padding: 32px; text-align: center; cursor: pointer; transition: border-color var(--transition); background: var(--bg); min-height: 120px; display: flex; align-items: center; justify-content: center; }
.upload-zone:hover { border-color: var(--accent-border); }
.upload-placeholder { color: var(--text-muted); }
.upload-placeholder p { margin-top: 8px; font-size: 14px; }
.hint { font-size: 12px; display: block; margin-top: 4px; }
.preview-container { position: relative; }
.preview-img { max-height: 200px; border-radius: var(--radius-sm); }
.preview-actions { display: flex; gap: 8px; margin-top: 8px; justify-content: center; }
.btn-copy, .btn-remove { padding: 6px 16px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg-card); color: var(--text-secondary); font-size: 12px; cursor: pointer; transition: all var(--transition); }
.btn-copy:hover, .btn-remove:hover { border-color: var(--accent-border); }
.url-input { margin-top: 12px; }
.url-input label { font-size: 12px; color: var(--text-secondary); display: block; margin-bottom: 4px; }
.url-input input { width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg); color: var(--text); font-size: 13px; outline: none; }
</style>
