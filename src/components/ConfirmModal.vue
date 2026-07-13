<template>
  <Teleport to="body">
    <div class="confirm-overlay" v-if="visible" @click.self="onCancel">
      <div class="confirm-card">
        <p class="confirm-msg">{{ message }}</p>
        <div class="confirm-actions">
          <button class="btn-cancel" @click="onCancel">取消</button>
          <button class="btn-confirm" @click="onOk">确定</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({ visible: Boolean, message: String })
const emit = defineEmits(['ok', 'cancel'])
function onOk() { emit('ok') }
function onCancel() { emit('cancel') }
</script>

<style scoped>
.confirm-overlay {
  position: fixed; inset: 0; z-index: 3000;
  background: rgba(0,0,0,0.35);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  animation: fadeIn 0.15s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.confirm-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: 32px 36px 24px;
  max-width: 360px; width: 90vw;
  text-align: center;
  animation: popIn 0.2s ease;
}
@keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
.confirm-msg { font-size: 15px; color: var(--text); margin-bottom: 24px; line-height: 1.6; }
.confirm-actions { display: flex; gap: 10px; justify-content: center; }
.btn-cancel, .btn-confirm {
  padding: 8px 28px; border-radius: var(--radius-sm);
  font-size: 13px; font-family: var(--font-sans); cursor: pointer; transition: all var(--transition);
}
.btn-cancel { border: 1px solid var(--border); background: var(--bg); color: var(--text-secondary); }
.btn-cancel:hover { border-color: var(--accent-border); color: var(--accent); }
.btn-confirm { border: none; background: var(--danger); color: #fff; }
.btn-confirm:hover { opacity: 0.88; }
</style>
