/**
 * 认证状态管理 — 对应 users 表
 * users 表: id, username, password, email, avatar, bio, created_at, updated_at
 *
 * 存储到 localStorage 的 user 对象不含 password 字段
 */
import { reactive, computed } from 'vue'
import {
  findUserByUsername,
  createUser,
  isUsernameTaken,
} from '../data/users.js'

const STORAGE_KEY = 'blog-user'

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveUser(user) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } catch {
    // ignore
  }
}

function clearUser() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

const state = reactive({
  user: loadUser(), // { id, username, email, avatar, bio }
})

export function useAuth() {
  const isLoggedIn = computed(() => !!state.user)

  /**
   * 登录
   * @param {string} username
   * @param {string} password
   * @returns {{ success: boolean, message: string }}
   */
  function login(username, password) {
    const found = findUserByUsername(username)
    if (!found) {
      return { success: false, message: '用户名或密码错误' }
    }
    if (found.password !== password) {
      return { success: false, message: '用户名或密码错误' }
    }

    const { password: _, ...user } = found
    state.user = user
    saveUser(user)
    return { success: true, message: '登录成功' }
  }

  /**
   * 注册
   * @param {string} username
   * @param {string} email
   * @param {string} password
   * @returns {{ success: boolean, message: string }}
   */
  function register(username, email, password) {
    if (isUsernameTaken(username)) {
      return { success: false, message: '用户名已存在' }
    }

    const user = createUser({ username, email, password })
    state.user = user
    saveUser(user)
    return { success: true, message: '注册成功，已自动登录' }
  }

  /** 退出登录 */
  function logout() {
    state.user = null
    clearUser()
  }

  return {
    user: computed(() => state.user),
    isLoggedIn,
    login,
    register,
    logout,
  }
}
