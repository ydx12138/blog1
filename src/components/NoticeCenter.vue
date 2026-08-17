<template>
  <Teleport to="body">
    <div class="notice-stack" aria-live="polite" aria-atomic="true">
      <TransitionGroup name="notice">
        <section
          v-for="notice in notices"
          :key="notice.id"
          class="notice notice-error"
          role="alert"
          @mouseenter="pauseNotice(notice.id)"
          @mouseleave="resumeNotice(notice.id)"
        >
          <span class="notice-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <circle cx="12" cy="12" r="9" /><path d="M12 8v5" /><path d="M12 16.5h.01" />
            </svg>
          </span>
          <p class="notice-message">{{ notice.message }}</p>
          <button class="notice-close" type="button" aria-label="关闭提示" @click="removeNotice(notice.id)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </section>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { notices, pauseNotice, removeNotice, resumeNotice } from '../composables/useNotice.js'
</script>

<style scoped>
.notice-stack {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 4000;
  display: grid;
  gap: 10px;
  width: min(380px, calc(100vw - 32px));
  pointer-events: none;
}

.notice {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: start;
  gap: 12px;
  padding: 14px 12px 14px 14px;
  border: 1px solid color-mix(in srgb, var(--danger) 45%, var(--border));
  border-left: 4px solid var(--danger);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  box-shadow: var(--shadow-lg);
  pointer-events: auto;
}

.notice-icon { color: var(--danger); display: inline-flex; padding-top: 1px; }
.notice-message { margin: 0; color: var(--text); font-size: 14px; line-height: 1.5; overflow-wrap: anywhere; }
.notice-close { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; margin: -5px -4px -5px 0; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--text-muted); cursor: pointer; }
.notice-close:hover { color: var(--danger); background: var(--danger-light); }
.notice-enter-active, .notice-leave-active { transition: opacity 0.18s ease, transform 0.18s ease; }
.notice-enter-from, .notice-leave-to { opacity: 0; transform: translateX(18px); }

@media (max-width: 640px) {
  .notice-stack { right: 16px; bottom: 16px; width: calc(100vw - 32px); }
}
</style>
