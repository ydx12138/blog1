const BASE_URL = ''

function getToken() {
  try { return localStorage.getItem('blog-token') || '' } catch { return '' }
}
function getAdminToken() {
  try { return localStorage.getItem('blog-admin-token') || '' } catch { return '' }
}

export async function request(method, path, data, isAdmin = false) {
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
    throw new Error(json.message || '请求失败')
  }
  return json.data
}

// 上传文件专用
export async function uploadRequest(path, formData) {
  const url = BASE_URL + path
  const token = getAdminToken()
  const headers = {}
  if (token) {
    headers['Authorization'] = token
  }
  const res = await fetch(url, { method: 'POST', headers, body: formData })
  const json = await res.json()
  if (json.code !== 0) {
    throw new Error(json.message || '上传失败')
  }
  return json.data
}
