import { computed, reactive } from 'vue'
import * as authApi from '../api/auth.js'

const USER_KEY = 'blog-user'
const TOKEN_KEY = 'blog-token'
const REFRESH_TOKEN_KEY = 'blog-refresh-token'
const ADMIN_TOKEN_KEY = 'blog-admin-token'
const ADMIN_USER_KEY = 'blog-admin-user'

function readJson(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

function writeText(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch {}
}

function removeItem(key) {
  try {
    localStorage.removeItem(key)
  } catch {}
}

const state = reactive({
  user: readJson(USER_KEY),
  adminUser: readJson(ADMIN_USER_KEY),
})

if (typeof window !== 'undefined') {
  window.addEventListener('blog:session-replaced', () => {
    state.user = null
  })
}

export function useAuth() {
  const isLoggedIn = computed(() => !!state.user)
  const isAdmin = computed(() => !!state.adminUser)
  const token = computed(() => {
    try {
      return localStorage.getItem(TOKEN_KEY) || ''
    } catch {
      return ''
    }
  })

  async function login(email, password, captchaId, captchaCode) {
    const data = await authApi.login(email, password, captchaId, captchaCode)
    const user = { id: data.id, email: data.email, nickname: data.nickname, avatar: data.avatar }
    state.user = user
    writeJson(USER_KEY, user)
    writeText(TOKEN_KEY, data.access_token)
    if (data.refresh_token) {
      writeText(REFRESH_TOKEN_KEY, data.refresh_token)
    }
    return { success: true, message: '登录成功' }
  }

  async function refreshUser() {
    const profile = await authApi.getCurrentUser()
    const nextUser = {
      ...(state.user || {}),
      id: profile.id,
      email: profile.email,
      nickname: profile.nickname,
      avatar: profile.avatar,
    }
    state.user = nextUser
    writeJson(USER_KEY, nextUser)
    return nextUser
  }

  // setUserAvatar 同步当前用户头像到响应式状态和本地缓存；参数为头像 URL；无返回值。
  function setUserAvatar(avatar) {
    if (!state.user) return
    state.user = { ...state.user, avatar }
    writeJson(USER_KEY, state.user)
  }

  async function register(formData) {
    await authApi.register(formData)
    return { success: true, message: '注册成功' }
  }

  async function sendRegisterCode(email) {
    await authApi.sendRegisterCode(email)
    return { success: true, message: '验证码已发送' }
  }

  async function sendPasswordResetCode(email) {
    await authApi.sendPasswordResetCode(email)
    return { success: true, message: '验证码已发送' }
  }

  async function updatePasswordByCode(formData) {
    await authApi.updatePasswordByCode(formData)
    return { success: true, message: '密码已重置' }
  }

  function logout() {
    state.user = null
    removeItem(USER_KEY)
    removeItem(TOKEN_KEY)
    removeItem(REFRESH_TOKEN_KEY)
  }

  async function adminLoginFn(username, password, captchaId, captchaCode) {
    const data = await authApi.adminLogin(username, password, captchaId, captchaCode)
    const user = { username: data.username, nickname: data.nickname }
    state.adminUser = user
    writeJson(ADMIN_USER_KEY, user)
    writeText(ADMIN_TOKEN_KEY, data.token)
    return { success: true, message: '登录成功' }
  }

  function adminLogout() {
    state.adminUser = null
    removeItem(ADMIN_USER_KEY)
    removeItem(ADMIN_TOKEN_KEY)
  }

  return {
    user: computed(() => state.user),
    adminUser: computed(() => state.adminUser),
    isLoggedIn,
    isAdmin,
    token,
    login,
    getCaptcha: authApi.getCaptcha,
    refreshUser,
    setUserAvatar,
    register,
    sendRegisterCode,
    sendPasswordResetCode,
    updatePasswordByCode,
    logout,
    adminLogin: adminLoginFn,
    adminLogout,
  }
}
