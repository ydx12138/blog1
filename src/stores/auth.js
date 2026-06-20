import { reactive, computed } from 'vue'
import * as authApi from '../api/auth.js'

const USER_KEY = 'blog-user'
const TOKEN_KEY = 'blog-token'
const ADMIN_TOKEN_KEY = 'blog-admin-token'
const ADMIN_USER_KEY = 'blog-admin-user'

function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveUser(user) {
  try { localStorage.setItem(USER_KEY, JSON.stringify(user)) } catch {}
}

function clearUser() {
  try { localStorage.removeItem(USER_KEY) } catch {}
}

function saveToken(token) {
  try { localStorage.setItem(TOKEN_KEY, token) } catch {}
}

function clearToken() {
  try { localStorage.removeItem(TOKEN_KEY) } catch {}
}

function saveAdminToken(token) {
  try { localStorage.setItem(ADMIN_TOKEN_KEY, token) } catch {}
}

function clearAdminToken() {
  try { localStorage.removeItem(ADMIN_TOKEN_KEY) } catch {}
}

function saveAdminUser(user) {
  try { localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user)) } catch {}
}

function loadAdminUser() {
  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function clearAdminUser() {
  try { localStorage.removeItem(ADMIN_USER_KEY) } catch {}
}

const state = reactive({
  user: loadUser(),
  adminUser: loadAdminUser(),
})

export function useAuth() {
  const isLoggedIn = computed(() => !!state.user)
  const isAdmin = computed(() => !!state.adminUser)
  const token = computed(() => {
    try { return localStorage.getItem(TOKEN_KEY) || '' } catch { return '' }
  })

  async function login(email, password) {
    const data = await authApi.login(email, password)
    const user = { id: data.id, email: data.email, nickname: data.nickname }
    state.user = user
    saveUser(user)
    saveToken(data.token)
    return { success: true, message: '登录成功' }
  }

  async function register(formData) {
    await authApi.register(formData)
    return { success: true, message: '注册成功' }
  }

  function logout() {
    state.user = null
    clearUser()
    clearToken()
  }

  // Admin
  async function adminLoginFn(username, password) {
    const data = await authApi.adminLogin(username, password)
    const user = { username: data.username, nickname: data.nickname }
    state.adminUser = user
    saveAdminUser(user)
    saveAdminToken(data.token)
    return { success: true, message: '登录成功' }
  }

  function adminLogout() {
    state.adminUser = null
    clearAdminUser()
    clearAdminToken()
  }

  return {
    user: computed(() => state.user),
    adminUser: computed(() => state.adminUser),
    isLoggedIn,
    isAdmin,
    token,
    login,
    register,
    logout,
    adminLogin: adminLoginFn,
    adminLogout,
  }
}
