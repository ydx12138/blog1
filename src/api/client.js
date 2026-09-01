import { showError } from '../composables/useNotice.js'

const BASE_URL = ''
const SESSION_REPLACED_CODE = 1008
const USER_BANNED_CODE = 1010
const FORCED_LOGOUT_CODES = new Set([SESSION_REPLACED_CODE, USER_BANNED_CODE])
const ACCESS_TOKEN_ERROR_CODES = new Set([1002, 1006])
let refreshPromise = null

function getToken() {
  try { return localStorage.getItem('blog-token') || '' } catch { return '' }
}
function getAdminToken() {
  try { return localStorage.getItem('blog-admin-token') || '' } catch { return '' }
}

// 读取 PC 用户刷新令牌；无参数；返回本地缓存的 Refresh Token，读取失败时返回空字符串。
function getRefreshToken() {
  try { return localStorage.getItem('blog-refresh-token') || '' } catch { return '' }
}

// 保存新签发的访问令牌；参数为 Access Token；无返回值。
function saveAccessToken(token) {
  try { localStorage.setItem('blog-token', token) } catch {}
}

// 清理被其他 PC 登录替换后的用户登录缓存，并通知认证状态仓库同步退出。
// 参数：无；返回值：无。
function clearUserSession() {
  try {
    localStorage.removeItem('blog-token')
    localStorage.removeItem('blog-refresh-token')
    localStorage.removeItem('blog-user')
  } catch {}
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('blog:session-replaced'))
  }
}

// handleForcedLogout 处理单点登录顶替和账号封禁；参数为业务码与提示文字；返回是否已处理。
function handleForcedLogout(code, message) {
  if (!FORCED_LOGOUT_CODES.has(code)) return false
  clearUserSession()
  showError(message || (code === USER_BANNED_CODE ? '账号已被封禁' : '账号已在其他地方登录'))
  return true
}

// 刷新 PC 用户访问令牌；无参数；返回新 Access Token，并让并发过期请求复用同一次刷新操作。
async function refreshAccessToken() {
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken()
    if (!refreshToken) throw new Error('登录状态已过期')

    const res = await fetch(BASE_URL + '/api/token/refresh', {
      method: 'POST',
      headers: { Authorization: refreshToken },
    })
    const json = await res.json()
    if (json.code !== 0 || !json.data?.access_token) {
      handleForcedLogout(json.code, json.message)
      const error = new Error(json.message || '登录状态已过期')
      error.code = json.code
      throw error
    }

    saveAccessToken(json.data.access_token)
    return json.data.access_token
  })()

  try {
    return await refreshPromise
  } finally {
    refreshPromise = null
  }
}

export async function request(method, path, data, isAdmin = false, allowRefresh = true) {
  const url = BASE_URL + path
  const hasBody = data && (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE')
  const headers = {}
  if (hasBody) {
    headers['Content-Type'] = 'application/json'
  }
  const token = isAdmin ? getAdminToken() : getToken()
  if (token) {
    headers['Authorization'] = token
  }

  const options = { method, headers }
  if (hasBody) {
    options.body = JSON.stringify(data)
  }

  const res = await fetch(url, options)
  const json = await res.json()

  if (json.code !== 0) {
    if (!isAdmin) handleForcedLogout(json.code, json.message)
    if (!isAdmin && allowRefresh && ACCESS_TOKEN_ERROR_CODES.has(json.code) && getRefreshToken()) {
      try {
        await refreshAccessToken()
        return request(method, path, data, false, false)
      } catch (error) {
        clearUserSession()
        throw error
      }
    }
    const error = new Error(json.message || '请求失败')
    error.code = json.code
    throw error
  }
  return json.data
}

// 上传文件专用
export async function uploadRequest(path, formData, isAdmin = true, allowRefresh = true) {
  const url = BASE_URL + path
  const token = isAdmin ? getAdminToken() : getToken()
  const headers = {}
  if (token) {
    headers['Authorization'] = token
  }
  const res = await fetch(url, { method: 'POST', headers, body: formData })
  const json = await res.json()
  if (json.code !== 0) {
    if (!isAdmin) handleForcedLogout(json.code, json.message)
    if (!isAdmin && allowRefresh && ACCESS_TOKEN_ERROR_CODES.has(json.code) && getRefreshToken()) {
      try {
        await refreshAccessToken()
        return uploadRequest(path, formData, false, false)
      } catch (error) {
        clearUserSession()
        throw error
      }
    }
    const error = new Error(json.message || '上传失败')
    error.code = json.code
    throw error
  }
  return json.data
}
