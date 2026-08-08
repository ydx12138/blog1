<template>
  <section class="profile-page">
    <router-link class="back-link" to="/">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
      返回首页
    </router-link>

    <header class="profile-hero">
      <span class="profile-avatar" aria-hidden="true">{{ initial }}</span>
      <div class="profile-heading">
        <p class="profile-kicker">ACCOUNT</p>
        <h1>个人资料</h1>
        <p class="profile-name">{{ profile.nickname || profile.email }}</p>
      </div>
    </header>

    <p v-if="loading" class="profile-status">正在加载资料...</p>
    <p v-else-if="error" class="profile-status profile-error">资料加载失败，请稍后重试</p>

    <dl class="profile-list">
      <template v-for="row in rows" :key="row.label">
        <dt>{{ row.label }}</dt>
        <dd>{{ row.value }}</dd>
      </template>
    </dl>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

import { getCurrentUser } from '../api/auth.js'
import { useAuth } from '../stores/auth.js'
import { profileRows } from '../utils/profile.js'

const { user } = useAuth()
const profile = ref({ ...(user.value || {}) })
const loading = ref(true)
const error = ref(false)

const initial = computed(() => {
  const identity = profile.value.nickname || profile.value.email || '?'
  return identity.charAt(0).toUpperCase()
})
const rows = computed(() => profileRows(profile.value))

onMounted(async () => {
  try {
    profile.value = await getCurrentUser()
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.profile-page {
  width: min(100%, 560px);
  margin: 0 auto;
  padding: 48px 0 64px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 54px;
  color: var(--text-secondary);
  font-size: 14px;
}

.back-link:hover { color: var(--accent); }

.profile-hero {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 30px;
  border-bottom: 1px solid var(--border-light);
}

.profile-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  flex: 0 0 68px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  font-family: var(--font-serif);
  font-size: 26px;
  font-weight: 700;
}

.profile-heading { min-width: 0; }
.profile-kicker {
  margin-bottom: 3px;
  color: var(--accent);
  font-family: var(--font-mono);
  font-size: 11px;
}
.profile-heading h1 { font-size: 28px; }
.profile-name {
  margin-top: 4px;
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-status {
  margin-top: 18px;
  color: var(--text-muted);
  font-size: 13px;
}
.profile-error { color: var(--danger); }

.profile-list {
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  margin-top: 24px;
  border-top: 1px solid var(--border-light);
}

.profile-list dt,
.profile-list dd {
  min-width: 0;
  padding: 18px 0;
  border-bottom: 1px solid var(--border-light);
}

.profile-list dt {
  color: var(--text-muted);
  font-size: 13px;
}

.profile-list dd {
  overflow-wrap: anywhere;
  color: var(--heading);
  font-size: 14px;
  text-align: right;
}
</style>
