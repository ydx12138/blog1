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
      <button class="avatar-editor" type="button" title="更换头像" aria-label="更换头像" @click="avatarCropVisible = true">
        <img v-if="profile.avatar" class="profile-avatar" :src="profile.avatar" :alt="profile.nickname || profile.email" />
        <span v-else class="profile-avatar" aria-hidden="true">{{ initial }}</span>
        <span class="avatar-edit-hint" aria-hidden="true">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7.7 6H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-2.7z"/><circle cx="12" cy="13" r="3"/></svg>
        </span>
      </button>
      <div class="profile-heading">
        <p class="profile-kicker">ACCOUNT</p>
        <h1>个人资料</h1>
        <p class="profile-name">{{ profile.nickname || profile.email }}</p>
      </div>
    </header>

    <p v-if="loading" class="profile-status">正在加载资料...</p>
    <div v-else-if="error" class="profile-status profile-error">
      <span>资料加载失败，请稍后重试</span>
      <button type="button" :disabled="loading" @click="loadProfile">重新加载</button>
    </div>

    <dl class="profile-list">
      <template v-for="row in rows" :key="row.label">
        <dt>{{ row.label }}</dt>
        <dd>{{ row.value }}</dd>
      </template>
    </dl>
    <AvatarCropModal
      :visible="avatarCropVisible"
      :upload-handler="uploadAndSaveAvatar"
      @close="avatarCropVisible = false"
      @uploaded="handleAvatarUploaded"
    />
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

import { getCurrentUser, updateUserAvatar, uploadUserAvatar } from '../api/auth.js'
import AvatarCropModal from '../components/AvatarCropModal.vue'
import { useAuth } from '../stores/auth.js'
import { profileRows } from '../utils/profile.js'

const { user, setUserAvatar } = useAuth()
const profile = ref({ ...(user.value || {}) })
const loading = ref(true)
const error = ref(false)
const avatarCropVisible = ref(false)

const initial = computed(() => {
  const identity = profile.value.nickname || profile.value.email || '?'
  return identity.charAt(0).toUpperCase()
})
const rows = computed(() => profileRows(profile.value))

// loadProfile 重新请求当前登录用户资料；无参数；返回资料请求 Promise，并同步页面加载与错误状态。
async function loadProfile() {
  loading.value = true
  error.value = false
  try {
    profile.value = await getCurrentUser()
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

// uploadAndSaveAvatar 上传裁剪图片并保存头像配置；参数为裁剪文件；返回包含头像 URL 的上传结果。
async function uploadAndSaveAvatar(file) {
  const data = await uploadUserAvatar(file)
  await updateUserAvatar(data.url)
  setUserAvatar(data.url)
  return data
}

// handleAvatarUploaded 更新个人资料页头像；参数为已保存的头像 URL；无返回值。
function handleAvatarUploaded(avatar) {
  profile.value = { ...profile.value, avatar }
}

onMounted(loadProfile)
</script>

<style scoped>
.profile-page {
  width: min(100%, 560px);
  margin: 0 auto;
  padding: var(--page-top) 0 var(--space-16);
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

.avatar-editor { position: relative; display: inline-grid; width: 68px; height: 68px; flex: 0 0 68px; place-items: center; overflow: hidden; padding: 0; border: 0; border-radius: 50%; background: transparent; cursor: pointer; }
.avatar-editor:focus-visible { outline: 2px solid var(--accent); outline-offset: 4px; }
.avatar-edit-hint { position: absolute; inset: 0; display: grid; place-items: center; border-radius: inherit; background: rgba(20, 24, 28, .58); color: #fff; opacity: 0; transform: scale(.92); transition: opacity .18s ease, transform .18s ease; }
.avatar-editor:hover .avatar-edit-hint, .avatar-editor:focus-visible .avatar-edit-hint { opacity: 1; transform: scale(1); }
.profile-avatar { object-fit: cover; }

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
.profile-error { display: flex; align-items: center; gap: 10px; color: var(--danger); }
.profile-error button { padding: 0; border: 0; border-bottom: 1px solid currentColor; background: transparent; color: var(--accent); cursor: pointer; font: inherit; }
.profile-error button:hover { color: var(--accent-hover); }
.profile-error button:disabled { cursor: wait; opacity: .55; }

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
