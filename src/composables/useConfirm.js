import { ref } from 'vue'

const visible = ref(false)
const message = ref('')
let resolvePromise = null

function showConfirm(msg) {
  message.value = msg
  visible.value = true
  return new Promise((resolve) => {
    resolvePromise = resolve
  })
}

function handleOk() {
  visible.value = false
  if (resolvePromise) resolvePromise(true)
}

function handleCancel() {
  visible.value = false
  if (resolvePromise) resolvePromise(false)
}

export function useConfirm() {
  return { visible, message, showConfirm, handleOk, handleCancel }
}
