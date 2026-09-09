<template>
  <div class="links-page">
    <header class="hero">
      <h1 class="hero__title">友情链接</h1>
      <p class="hero__caption">博客圈的伙伴们，一起交流，一起成长</p>
    </header>

    <div v-if="loading" class="state">加载中...</div>
    <div v-else-if="error" class="state state--error">友情链接加载失败：{{ error }}</div>
    <div v-else-if="!links.length" class="state">暂无友情链接</div>

    <ul v-else class="links-grid">
      <li v-for="link in links" :key="link.id" class="link-card">
        <a
          :href="normalizeUrl(link.url)"
          target="_blank"
          rel="noopener noreferrer"
          class="link-card__inner"
          @click.stop="openLink(link.url)"
        >
          <div class="link-card__avatar">
            <img v-if="link.logo" :src="link.logo" :alt="link.name" @error="onAvatarError" />
            <span v-else class="link-card__initial">{{ initial(link.name) }}</span>
          </div>
          <div class="link-card__body">
            <h3 class="link-card__name">{{ link.name }}</h3>
            <p class="link-card__desc">{{ link.description || '这位博主很懒，还没有填写简介。' }}</p>
          </div>
        </a>
      </li>
    </ul>

    <section class="apply">
      <h2 class="apply__title">申请友链</h2>
      <p class="apply__caption">欢迎互换友链，提交后默认通过并展示在列表中。</p>

      <div v-if="!isLoggedIn" class="apply-login">
        <p class="apply-login__hint">登录后即可提交你的站点信息。</p>
        <button class="apply-btn" type="button" @click="requestLogin">登录后申请</button>
      </div>

      <form v-else class="apply-form" @submit.prevent="submitApply">
        <div class="apply-row">
          <label for="apply-name">站点名称 <em>*</em></label>
          <input id="apply-name" v-model.trim="form.name" maxlength="50" placeholder="你的博客名称" />
        </div>
        <div class="apply-row">
          <label for="apply-url">站点链接 <em>*</em></label>
          <input id="apply-url" v-model.trim="form.url" maxlength="255" placeholder="https://example.com" />
        </div>
        <div class="apply-row">
          <label for="apply-logo">头像 URL（选填）</label>
          <input id="apply-logo" v-model.trim="form.logo" maxlength="255" placeholder="https://..." />
        </div>
        <div class="apply-row">
          <label for="apply-desc">站点描述（选填）</label>
          <textarea id="apply-desc" v-model.trim="form.description" maxlength="255" rows="3" placeholder="一句话介绍你的博客"></textarea>
        </div>

        <p v-if="formError" class="apply-error">{{ formError }}</p>
        <p v-if="formSuccess" class="apply-success">{{ formSuccess }}</p>

        <button class="apply-btn" type="submit" :disabled="submitting">
          {{ submitting ? '提交中...' : '提交申请' }}
        </button>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { fetchLinks, applyFriendLink } from '../api/links.js'
import { useAuth } from '../stores/auth.js'

const { isLoggedIn } = useAuth()

const links = ref([])
const loading = ref(true)
const error = ref('')

const form = reactive({ name: '', url: '', logo: '', description: '' })
const submitting = ref(false)
const formError = ref('')
const formSuccess = ref('')

function initial(name) {
  if (!name) return '?'
  return name.trim().charAt(0).toUpperCase()
}

function onAvatarError(e) {
  e.target.style.display = 'none'
}

// 规范化友链 URL：缺协议时补 https://，避免被浏览器当成站内相对路径。
function normalizeUrl(raw) {
  const url = String(raw || '').trim()
  if (!url) return '#'
  if (/^(https?:)?\/\//i.test(url)) return url
  if (/^(mailto:|javascript:)/i.test(url)) return url
  return `https://${url}`
}

function openLink(raw) {
  const url = normalizeUrl(raw)
  if (url === '#') return
  // 用 window.open 显式开新窗口，绕过部分浏览器/扩展对 target=_blank 的拦截
  window.open(url, '_blank', 'noopener,noreferrer')
}

function requestLogin() {
  window.dispatchEvent(new Event('show-auth-modal'))
}

async function loadLinks() {
  const res = await fetchLinks()
  links.value = Array.isArray(res) ? res : (res?.data || [])
}

async function submitApply() {
  formError.value = ''
  formSuccess.value = ''
  if (!form.name) { formError.value = '请填写站点名称'; return }
  if (!form.url) { formError.value = '请填写站点链接'; return }
  submitting.value = true
  try {
    await applyFriendLink({ name: form.name, url: form.url, logo: form.logo, description: form.description })
    formSuccess.value = '申请成功，已展示在友链列表中'
    form.name = ''
    form.url = ''
    form.logo = ''
    form.description = ''
    await loadLinks()
  } catch (e) {
    formError.value = e.message || '申请失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  try {
    await loadLinks()
  } catch (e) {
    error.value = e.message || '请确认后端服务已启动'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.links-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 24px 80px;
}

.hero {
  text-align: center;
  margin-bottom: 40px;
}
.hero__title {
  font-family: var(--font-serif);
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--text-primary);
}
.hero__caption {
  color: var(--text-secondary);
  font-size: 15px;
  margin: 0;
}

.state {
  text-align: center;
  padding: 60px 0;
  color: var(--text-secondary);
}
.state--error {
  color: var(--color-danger);
}

.links-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.link-card {
  background: var(--surface-card);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}
.link-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  border-color: var(--brand-primary);
}

.link-card__inner {
  display: flex;
  gap: 14px;
  padding: 18px 20px;
  text-decoration: none;
  color: inherit;
}

.link-card__avatar {
  flex: 0 0 48px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--brand-primary-soft);
  color: var(--brand-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 20px;
  overflow: hidden;
}
.link-card__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.link-card__initial {
  text-transform: uppercase;
}

.link-card__body {
  flex: 1;
  min-width: 0;
}

.link-card__name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 6px;
  color: var(--text-primary);
}

.link-card__desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.apply {
  margin-top: 60px;
  padding: 28px;
  background: var(--surface-card);
  border: 1px dashed var(--border-subtle);
  border-radius: 12px;
}
.apply__title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px;
  color: var(--text-primary);
}
.apply__caption {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0 0 20px;
}

.apply-login {
  text-align: center;
  padding: 8px 0;
}
.apply-login__hint {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0 0 14px;
}

.apply-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-width: 560px;
}
.apply-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.apply-row label {
  font-size: 13px;
  color: var(--text-secondary);
}
.apply-row em {
  color: var(--color-danger);
  font-style: normal;
}
.apply-row input,
.apply-row textarea {
  padding: 10px 12px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: transparent;
  color: var(--text-primary);
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
}
.apply-row textarea {
  resize: vertical;
}
.apply-row input:focus,
.apply-row textarea:focus {
  outline: none;
  border-color: var(--brand-primary);
}

.apply-btn {
  align-self: flex-start;
  padding: 10px 22px;
  border: none;
  border-radius: 8px;
  background: var(--brand-primary);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.apply-btn:hover {
  opacity: 0.88;
}
.apply-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.apply-error {
  color: var(--color-danger);
  font-size: 13px;
  margin: 0;
}
.apply-success {
  color: var(--color-success, #16a34a);
  font-size: 13px;
  margin: 0;
}
</style>