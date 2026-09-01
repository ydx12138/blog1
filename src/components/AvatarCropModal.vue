<template>
  <Teleport to="body">
    <div v-if="visible" class="crop-overlay" @click.self="handleClose">
      <section class="crop-modal" role="dialog" aria-modal="true" aria-labelledby="avatar-crop-title">
        <header class="crop-header">
          <div>
            <h2 id="avatar-crop-title">设置头像</h2>
            <p>拖动图片调整位置，滚动鼠标滚轮缩放</p>
          </div>
          <button class="close-button" type="button" aria-label="关闭" title="关闭" @click="handleClose">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 6 12 12M18 6 6 18" /></svg>
          </button>
        </header>

        <div class="crop-body">
          <div
            ref="stageRef"
            class="crop-stage"
            :class="{ 'has-image': hasImage, dragging: dragging.active }"
          >
            <img
              v-if="hasImage"
              class="crop-image"
              :src="imageUrl"
              :style="imageStyle"
              alt="待裁剪头像"
              draggable="false"
            />
            <div v-else class="empty-state">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></svg>
              <span>请选择图片</span>
            </div>
            <div
              class="crop-viewport"
              @pointerdown="startDrag"
              @pointermove="moveDrag"
              @pointerup="endDrag"
              @pointercancel="endDrag"
              @wheel.prevent="scaleAtPointer"
            ></div>
            <div class="crop-mask" aria-hidden="true"></div>
          </div>
          <input ref="fileInput" class="file-input" type="file" accept="image/*" @change="selectFile" />
          <button class="select-button" type="button" @click="fileInput?.click()">选择图片</button>
        </div>

        <footer class="crop-footer">
          <button class="secondary-button" type="button" :disabled="uploading" @click="handleClose">取消</button>
          <button class="primary-button" type="button" :disabled="uploading" @click="confirmCrop">
            {{ uploading ? '上传中...' : '确认' }}
          </button>
        </footer>
      </section>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { uploadImage } from '../api/admin.js'
import { showError } from '../composables/useNotice.js'
import { canCloseCropModal, clampCropOffset, coverScale, cropSourceRect } from '../utils/avatarCrop.js'

const VIEWPORT_SIZE = 240
const STAGE_SIZE = 320
const OUTPUT_SIZE = 320
const VIEWPORT_INSET = (STAGE_SIZE - VIEWPORT_SIZE) / 2

const emit = defineEmits(['close', 'uploaded'])
const props = defineProps({
  visible: { type: Boolean, default: false },
  uploadHandler: { type: Function, default: uploadImage },
})

const fileInput = ref(null)
const stageRef = ref(null)
const imageUrl = ref('')
const imageSize = reactive({ width: 0, height: 0 })
const offset = reactive({ x: 0, y: 0 })
const scale = ref(1)
const minimumScale = ref(1)
const uploading = ref(false)
const dragging = reactive({ active: false, pointerId: null, startX: 0, startY: 0, offsetX: 0, offsetY: 0 })

const hasImage = computed(() => Boolean(imageUrl.value && imageSize.width && imageSize.height))
const imageStyle = computed(() => ({
  width: `${imageSize.width * scale.value}px`,
  height: `${imageSize.height * scale.value}px`,
  left: `${VIEWPORT_INSET + offset.x}px`,
  top: `${VIEWPORT_INSET + offset.y}px`,
}))

// 计算当前缩放比例下的图片渲染尺寸；参数为可选缩放比例；返回渲染宽高。
function renderedSize(nextScale = scale.value) {
  return { width: imageSize.width * nextScale, height: imageSize.height * nextScale }
}

// 根据当前图片尺寸限制偏移范围；参数为候选偏移和可选缩放比例；返回合法偏移。
function restrictOffset(nextOffset, nextScale = scale.value) {
  const rendered = renderedSize(nextScale)
  return clampCropOffset(nextOffset, rendered.width, rendered.height, VIEWPORT_SIZE)
}

// 更新图片偏移并保证取景框不露出空白；参数为候选偏移和可选缩放比例；返回值：无。
function setOffset(nextOffset, nextScale = scale.value) {
  const restricted = restrictOffset(nextOffset, nextScale)
  offset.x = restricted.x
  offset.y = restricted.y
}

// 释放本地预览地址并清空图片尺寸；参数：无；返回值：无。
function releaseImageUrl() {
  if (imageUrl.value) URL.revokeObjectURL(imageUrl.value)
  imageUrl.value = ''
  imageSize.width = 0
  imageSize.height = 0
}

// 重置本次裁剪的文件、缩放和偏移状态；参数：无；返回值：无。
function resetCrop() {
  releaseImageUrl()
  scale.value = 1
  minimumScale.value = 1
  offset.x = 0
  offset.y = 0
  if (fileInput.value) fileInput.value.value = ''
}

// 读取用户选择的本地图片并初始化为覆盖取景框的状态；参数为文件输入事件；返回值：无。
function selectFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    showError('请选择图片文件')
    return
  }
  releaseImageUrl()
  const nextUrl = URL.createObjectURL(file)
  const image = new Image()
  image.onload = () => {
    imageSize.width = image.naturalWidth
    imageSize.height = image.naturalHeight
    minimumScale.value = coverScale(image.naturalWidth, image.naturalHeight, VIEWPORT_SIZE)
    scale.value = minimumScale.value
    const rendered = renderedSize()
    setOffset({ x: (VIEWPORT_SIZE - rendered.width) / 2, y: (VIEWPORT_SIZE - rendered.height) / 2 })
    imageUrl.value = nextUrl
  }
  image.onerror = () => {
    URL.revokeObjectURL(nextUrl)
    showError('图片读取失败，请重新选择')
  }
  image.src = nextUrl
}

// 开始记录图片拖动起点；参数为指针事件；返回值：无。
function startDrag(event) {
  if (!hasImage.value) return
  dragging.active = true
  dragging.pointerId = event.pointerId
  dragging.startX = event.clientX
  dragging.startY = event.clientY
  dragging.offsetX = offset.x
  dragging.offsetY = offset.y
  event.currentTarget.setPointerCapture(event.pointerId)
}

// 根据指针移动更新图片偏移；参数为指针事件；返回值：无。
function moveDrag(event) {
  if (!dragging.active || dragging.pointerId !== event.pointerId) return
  setOffset({
    x: dragging.offsetX + event.clientX - dragging.startX,
    y: dragging.offsetY + event.clientY - dragging.startY,
  })
}

// 结束图片拖动并释放指针捕获；参数为指针事件；返回值：无。
function endDrag(event) {
  if (dragging.pointerId !== event.pointerId) return
  if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
  dragging.active = false
  dragging.pointerId = null
}

// 围绕鼠标所在位置缩放图片；参数为滚轮事件；返回值：无。
function scaleAtPointer(event) {
  if (!hasImage.value || !stageRef.value) return
  const stage = stageRef.value.getBoundingClientRect()
  const point = {
    x: event.clientX - stage.left - VIEWPORT_INSET,
    y: event.clientY - stage.top - VIEWPORT_INSET,
  }
  const nextScale = Math.min(minimumScale.value * 5, Math.max(minimumScale.value, scale.value * (event.deltaY < 0 ? 1.1 : 0.9)))
  if (nextScale === scale.value) return
  const imagePoint = { x: (point.x - offset.x) / scale.value, y: (point.y - offset.y) / scale.value }
  scale.value = nextScale
  setOffset({ x: point.x - imagePoint.x * nextScale, y: point.y - imagePoint.y * nextScale }, nextScale)
}

// 将当前取景框内容导出为 PNG 文件；参数：无；返回裁剪后的图片文件 Promise。
function createCroppedFile() {
  const canvas = document.createElement('canvas')
  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE
  const context = canvas.getContext('2d')
  if (!context) throw new Error('头像裁剪失败')
  const source = cropSourceRect(offset, scale.value, VIEWPORT_SIZE)
  const image = new Image()
  image.src = imageUrl.value
  return new Promise((resolve, reject) => {
    image.onload = () => {
      context.drawImage(image, source.sx, source.sy, source.size, source.size, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('头像裁剪失败'))
          return
        }
        resolve(new File([blob], 'avatar.png', { type: 'image/png' }))
      }, 'image/png')
    }
    image.onerror = () => reject(new Error('头像裁剪失败'))
  })
}

// 导出裁剪图片并调用已有上传接口，成功后通知父组件回填 URL；参数：无；返回上传 Promise。
async function confirmCrop() {
  if (!hasImage.value) {
    showError('请先选择图片')
    return
  }
  uploading.value = true
  try {
    const file = await createCroppedFile()
    const data = await props.uploadHandler(file)
    emit('uploaded', data.url)
    handleClose(true)
  } catch (error) {
    showError(error.message || '头像上传失败')
  } finally {
    uploading.value = false
  }
}

// 关闭裁剪窗口并清理本地预览状态；参数为是否由上传成功触发；返回值：无。
function handleClose(afterUpload = false) {
  if (!canCloseCropModal(uploading.value, afterUpload)) return
  resetCrop()
  emit('close')
}

onBeforeUnmount(resetCrop)
</script>

<style scoped>
.crop-overlay { position: fixed; inset: 0; z-index: 4100; display: grid; place-items: center; padding: 20px; background: rgba(12, 18, 24, .5); backdrop-filter: blur(3px); }
.crop-modal { width: min(100%, 500px); border: 1px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-card); box-shadow: var(--shadow-lg); }
.crop-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; padding: 24px 24px 18px; border-bottom: 1px solid var(--border-light); }
.crop-header h2 { margin: 0; color: var(--heading); font-family: var(--font-serif); font-size: 20px; }
.crop-header p { margin: 6px 0 0; color: var(--text-muted); font-size: 13px; line-height: 1.5; }
.close-button { display: inline-grid; width: 30px; height: 30px; place-items: center; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--text-muted); cursor: pointer; }
.close-button:hover { background: var(--tag-bg); color: var(--text); }
.crop-body { display: grid; justify-items: center; gap: 16px; padding: 24px; }
.crop-stage { position: relative; width: 320px; height: 320px; max-width: 100%; overflow: hidden; border-radius: var(--radius-sm); background: var(--bg); user-select: none; }
.crop-image { position: absolute; max-width: none; pointer-events: none; }
.crop-stage.has-image { background: #15191f; }
.crop-stage.dragging .crop-image { cursor: grabbing; }
.empty-state { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; gap: 8px; color: var(--text-muted); font-size: 13px; }
.crop-viewport { position: absolute; z-index: 2; top: 40px; left: 40px; width: 240px; height: 240px; border: 2px solid rgba(255, 255, 255, .92); border-radius: 50%; box-sizing: border-box; box-shadow: 0 0 0 1px rgba(0, 0, 0, .25); cursor: grab; touch-action: none; }
.crop-mask { position: absolute; inset: 0; z-index: 1; pointer-events: none; background: radial-gradient(circle 120px at center, transparent 119px, rgba(0, 0, 0, .58) 121px); }
.file-input { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
.select-button, .secondary-button, .primary-button { min-width: 88px; height: 36px; border-radius: var(--radius-sm); cursor: pointer; font: inherit; font-size: 13px; }
.select-button, .secondary-button { border: 1px solid var(--border); background: var(--bg-card); color: var(--text-secondary); }
.select-button:hover, .secondary-button:hover { border-color: var(--accent-border); color: var(--accent); }
.crop-footer { display: flex; justify-content: flex-end; gap: 10px; padding: 18px 24px 24px; border-top: 1px solid var(--border-light); }
.primary-button { border: 1px solid var(--accent); background: var(--accent); color: #fff; }
.primary-button:hover:not(:disabled) { opacity: .9; }
.primary-button:disabled, .secondary-button:disabled { opacity: .55; cursor: not-allowed; }
@media (max-width: 420px) { .crop-overlay { padding: 12px; } .crop-header, .crop-body, .crop-footer { padding-left: 16px; padding-right: 16px; } .crop-stage { transform: scale(.86); margin-block: -22px; } }
</style>
