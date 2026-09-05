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
      <p class="apply__caption">欢迎互换友链，请在评论区或邮件告知你的站点信息。</p>
      <ul class="apply__meta">
        <li><strong>站点名称：</strong>{{ siteName }}</li>
        <li><strong>站点地址：</strong>{{ siteUrl }}</li>
        <li><strong>站点描述：</strong>{{ siteDesc }}</li>
        <li v-if="siteLogo"><strong>站点图标：</strong>{{ siteLogo }}</li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchLinks } from '../api/links.js'
import { siteSettings } from '../data/site.js'

const links = ref([])
const loading = ref(true)
const error = ref('')

const siteName = computed(() => siteSettings.siteTitle || '我的博客')
const siteUrl = computed(() => (typeof window !== 'undefined' ? window.location.origin : ''))
const siteDesc = computed(() => siteSettings.siteDescription || '一个记录学习与生活的小站。')
const siteLogo = computed(() => siteSettings.siteLogo || '')

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

onMounted(async () => {
  try {
    const res = await fetchLinks()
    links.value = Array.isArray(res) ? res : (res?.data || [])
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
  margin: 0 0 16px;
}
.apply__meta {
  list-style: none;
  margin: 0;
  padding: 0;
}
.apply__meta li {
  padding: 6px 0;
  font-size: 14px;
  color: var(--text-secondary);
  word-break: break-all;
}
.apply__meta strong {
  color: var(--text-primary);
  margin-right: 6px;
}
</style>