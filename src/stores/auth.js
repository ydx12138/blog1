import { computed, reactive } from 'vue'
import * as authApi from '../api/auth.js'

const USER_KEY = 'blog-user'
const TOKEN_KEY = 'blog-token'
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

export function isUsableToken(value) {
  return typeof value === 'string' && value.trim() !== '' && value !== 'undefined' && value !== 'null'
}

export function sessionFromLoginResponse(data) {
  return {
    user: { id: data.id, email: data.email, nickname: data.nickname },
    token: data.access_token,
  }
}

function readText(key) {
  try {
    return localStorage.getItem(key) || ''
  } catch {
    return ''
  }
}

const storedUser = readJson(USER_KEY)
const storedToken = readText(TOKEN_KEY)
if (storedUser && !isUsableToken(storedToken)) {
  removeItem(USER_KEY)
  removeItem(TOKEN_KEY)
}

const state = reactive({
  user: isUsableToken(storedToken) ? storedUser : null,
  adminUser: readJson(ADMIN_USER_KEY),
})

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

  async function login(email, password) {
    const data = await authApi.login(email, password)
    const session = sessionFromLoginResponse(data)
    if (!isUsableToken(session.token)) {
      throw new Error('登录响应缺少 access_token')
    }
    state.user = session.user
    writeJson(USER_KEY, session.user)
    writeText(TOKEN_KEY, session.token)
    return { success: true, message: '登录成功' }
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
  }

  async function adminLoginFn(username, password) {
    const data = await authApi.adminLogin(username, password)
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
    register,
    sendRegisterCode,
    sendPasswordResetCode,
    updatePasswordByCode,
    logout,
    adminLogin: adminLoginFn,
    adminLogout,
  }
}
