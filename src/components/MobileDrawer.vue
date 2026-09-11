<template>
  <Teleport to="body">
    <dialog ref="dialogRef" class="mobile-drawer" :aria-label="title" @cancel.prevent="close" @click="onBackdropClick" @close="close">
      <section class="mobile-drawer__panel">
        <header class="mobile-drawer__header">
          <strong>{{ title }}</strong>
          <button type="button" aria-label="关闭导航菜单" autofocus @click="close">×</button>
        </header>
        <div class="mobile-drawer__content"><slot /></div>
        <footer class="mobile-drawer__footer"><slot name="footer" /></footer>
      </section>
    </dialog>
  </Teleport>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { responsiveTokens } from '../utils/responsive.js'

const props = defineProps({ open: Boolean, title: { type: String, required: true } })
const emit = defineEmits(['update:open'])
const route = useRoute()
const dialogRef = ref(null)
let desktopMedia
let savedOverflow

function close() { emit('update:open', false) }
function restoreScroll() {
  if (savedOverflow !== undefined) {
    document.body.style.overflow = savedOverflow
    savedOverflow = undefined
  }
}
function syncDialog() {
  if (props.open && !desktopMedia?.matches) {
    if (!dialogRef.value.open) {
      savedOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      dialogRef.value.showModal()
    }
  } else {
    dialogRef.value?.close()
    restoreScroll()
    if (props.open) close()
  }
}
function onBackdropClick(event) {
  if (event.target !== dialogRef.value) return
  const bounds = dialogRef.value.getBoundingClientRect()
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) close()
}
function onMediaChange() { if (desktopMedia.matches) close() }

watch(() => props.open, syncDialog, { flush: 'post' })
watch(() => route.fullPath, close)
onMounted(() => {
  desktopMedia = window.matchMedia(`(min-width: ${responsiveTokens.tabletMax + 1}px)`)
  desktopMedia.addEventListener('change', onMediaChange)
  syncDialog()
})
onBeforeUnmount(() => {
  desktopMedia?.removeEventListener('change', onMediaChange)
  dialogRef.value?.close()
  restoreScroll()
})
</script>

<style scoped>
.mobile-drawer { position: fixed; inset: 0 0 0 auto; width: min(260px, calc(100% - 64px)); max-width: none; height: 100%; height: 100dvh; max-height: none; margin: 0; padding: 0; border: 0; background: var(--bg-card); color: var(--text); box-shadow: var(--shadow-lg); }
.mobile-drawer::backdrop { background: rgb(0 0 0 / 0); animation: mobile-drawer-backdrop-in 800ms linear forwards; }
.mobile-drawer__panel { display: flex; flex-direction: column; min-height: 100%; padding: max(16px, env(safe-area-inset-top)) 20px max(20px, env(safe-area-inset-bottom)); animation: mobile-drawer-slide-in 800ms linear both; }
.mobile-drawer__header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-bottom: 20px; color: var(--heading); }
.mobile-drawer__header strong { font: 600 20px var(--font-serif); overflow-wrap: anywhere; }
.mobile-drawer__header button { flex-shrink: 0; width: 44px; height: 44px; border: 1px solid var(--border); border-radius: var(--radius); background: transparent; color: var(--text); font-size: 26px; cursor: pointer; }
.mobile-drawer__content { flex: 1; }
.mobile-drawer__footer { display: grid; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border); }
@keyframes mobile-drawer-slide-in { from { transform: translateX(100%); } to { transform: translateX(0); } }
@keyframes mobile-drawer-backdrop-in { from { background: rgb(0 0 0 / 0); } to { background: rgb(0 0 0 / .4); } }
@media (prefers-reduced-motion: reduce) {
  .mobile-drawer::backdrop, .mobile-drawer__panel { animation-duration: 1ms; }
}
</style>
