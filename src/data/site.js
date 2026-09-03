import { reactive } from 'vue'
import { getSiteSettings } from '../api/site.js'

export const site = reactive({
  title: '懂你',
  description: '一名Go工程师，热爱开源与写作。',
  author: {
    name: 'ydx',
    avatar: '',
    bio: 'Go开发者，热爱开源与写作。',
    location: '中国',
    github: 'https://github.com/ydx12138',
    email: '2675723732@qq.com',
    about: '',
  },
  nav: [
    { label: '首页', path: '/' },
    { label: '分类', path: '/categories' },
    { label: '我的', path: '/about' },
  ],
  socialLinks: [
    { name: 'GitHub', url: 'https://github.com/ydx12138', icon: 'github' },
    { name: 'RSS', url: '/feed.xml', icon: 'rss' },
  ],
})

// siteSettings 提供系统配置页面的前端预览状态；接口接入后由服务端配置覆盖。
export const siteSettings = reactive({
  registerEnabled: true,
  categoriesEnabled: true,
  profileEnabled: true,
  commentsEnabled: true,
  userTokenExpireMinutes: 15,
  adminTokenExpireMinutes: 10080,
})

let settingsPromise = null

function applySiteSettings(data = {}) {
  siteSettings.registerEnabled = data.register_enabled !== false
  siteSettings.categoriesEnabled = data.categories_enabled !== false
  siteSettings.profileEnabled = data.profile_enabled !== false
  siteSettings.commentsEnabled = data.comments_enabled !== false
  if (typeof data.site_title === 'string' && data.site_title.trim()) site.title = data.site_title.trim()
  if (typeof data.profile_github === 'string') site.author.github = data.profile_github
  if (typeof data.profile_email === 'string') site.author.email = data.profile_email
  if (typeof data.profile_avatar === 'string') site.author.avatar = data.profile_avatar.trim()
  if (typeof data.profile_about === 'string') site.author.about = data.profile_about
  if (Number.isInteger(data.user_token_expire_minutes)) siteSettings.userTokenExpireMinutes = data.user_token_expire_minutes
  if (Number.isInteger(data.admin_token_expire_minutes)) siteSettings.adminTokenExpireMinutes = data.admin_token_expire_minutes
}

export function loadSiteSettings() {
  if (!settingsPromise) {
    settingsPromise = getSiteSettings()
      .then((data) => { applySiteSettings(data); return data })
      .catch((error) => { settingsPromise = null; throw error })
  }
  return settingsPromise
}

export function applySiteSettingsData(data) {
  applySiteSettings(data)
}

// buildSiteSettingsPayload 将页面状态转换为系统设置接口请求体；参数为页面配置值；返回接口所需的下划线字段对象。
export function buildSiteSettingsPayload(settings) {
  return {
    register_enabled: settings.registerEnabled,
    categories_enabled: settings.categoriesEnabled,
    profile_enabled: settings.profileEnabled,
    comments_enabled: settings.commentsEnabled,
    site_title: settings.siteTitle,
    profile_github: settings.profileGithub,
    profile_email: settings.profileEmail,
    profile_avatar: settings.profileAvatar,
    profile_about: settings.profileAbout,
    user_token_expire_minutes: settings.userTokenExpireMinutes,
    admin_token_expire_minutes: settings.adminTokenExpireMinutes,
  }
}
