import assert from 'node:assert/strict'
import test from 'node:test'

import { request, uploadRequest } from './client.js'
import { notices, removeNotice } from '../composables/useNotice.js'

// createStorage 构造测试用本地存储；参数为初始键值；返回兼容 localStorage 的内存对象。
function createStorage(values = {}) {
  const entries = new Map(Object.entries(values))
  return {
    getItem(key) { return entries.get(key) || null },
    setItem(key, value) { entries.set(key, String(value)) },
    removeItem(key) { entries.delete(key) },
  }
}

// jsonResponse 构造测试用 JSON 响应；参数为响应数据；返回兼容 fetch Response 的对象。
function jsonResponse(data) {
  return { json: async () => data }
}

test('request refreshes an expired access token and retries once', async (context) => {
  const storage = createStorage({
    'blog-token': 'expired-access',
    'blog-refresh-token': 'valid-refresh',
    'blog-user': '{"id":1}',
  })
  const calls = []
  const responses = [
    jsonResponse({ code: 1006, message: 'access_token过期', data: null }),
    jsonResponse({ code: 0, message: '成功', data: { access_token: 'new-access' } }),
    jsonResponse({ code: 0, message: '成功', data: { id: 1, email: 'user@example.com' } }),
  ]
  context.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options })
    return responses.shift()
  })
  globalThis.localStorage = storage

  const profile = await request('GET', '/api/users/me')

  assert.equal(profile.email, 'user@example.com')
  assert.equal(storage.getItem('blog-token'), 'new-access')
  assert.deepEqual(calls.map((call) => call.url), [
    '/api/users/me',
    '/api/token/refresh',
    '/api/users/me',
  ])
  assert.equal(calls[1].options.headers.Authorization, 'valid-refresh')
  assert.equal(calls[2].options.headers.Authorization, 'new-access')
})

test('request clears user session when refreshing the token fails', async (context) => {
  const storage = createStorage({
    'blog-token': 'expired-access',
    'blog-refresh-token': 'expired-refresh',
    'blog-user': '{"id":1}',
  })
  const events = []
  const responses = [
    jsonResponse({ code: 1006, message: 'access_token过期', data: null }),
    jsonResponse({ code: 1007, message: 'refresh_token过期', data: null }),
  ]
  context.mock.method(globalThis, 'fetch', async () => responses.shift())
  globalThis.localStorage = storage
  globalThis.window = { dispatchEvent(event) { events.push(event.type) } }
  globalThis.CustomEvent = class CustomEvent { constructor(type) { this.type = type } }

  await assert.rejects(() => request('GET', '/api/users/me'))

  assert.equal(storage.getItem('blog-token'), null)
  assert.equal(storage.getItem('blog-refresh-token'), null)
  assert.equal(storage.getItem('blog-user'), null)
  assert.deepEqual(events, ['blog:session-replaced'])
})

test('concurrent expired requests share one token refresh', async (context) => {
  const storage = createStorage({
    'blog-token': 'expired-access',
    'blog-refresh-token': 'valid-refresh',
    'blog-user': '{"id":1}',
  })
  let profileRequests = 0
  let refreshRequests = 0
  let releaseRefresh
  const pendingRefresh = new Promise((resolve) => { releaseRefresh = resolve })
  context.mock.method(globalThis, 'fetch', async (url) => {
    if (url === '/api/token/refresh') {
      refreshRequests += 1
      return pendingRefresh
    }
    profileRequests += 1
    if (profileRequests <= 2) {
      return jsonResponse({ code: 1006, message: 'access_token过期', data: null })
    }
    return jsonResponse({ code: 0, message: '成功', data: { id: profileRequests } })
  })
  globalThis.localStorage = storage

  const first = request('GET', '/api/users/me')
  const second = request('GET', '/api/users/me')
  await new Promise((resolve) => setTimeout(resolve, 0))

  assert.equal(refreshRequests, 1)
  releaseRefresh(jsonResponse({ code: 0, message: '成功', data: { access_token: 'new-access' } }))
  await Promise.all([first, second])

  assert.equal(refreshRequests, 1)
  assert.equal(profileRequests, 4)
})

test('uploadRequest uses the user token for a user avatar upload', async (context) => {
  const storage = createStorage({
    'blog-token': 'user-access',
    'blog-admin-token': 'admin-access',
  })
  let sentAuthorization = ''
  context.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/users/avatar/upload')
    sentAuthorization = options.headers.Authorization
    return jsonResponse({ code: 0, message: '上传成功', data: { url: 'https://cdn.example.com/avatar.png' } })
  })
  globalThis.localStorage = storage

  const data = await uploadRequest('/api/users/avatar/upload', new FormData(), false)

  assert.equal(sentAuthorization, 'user-access')
  assert.equal(data.url, 'https://cdn.example.com/avatar.png')
})

for (const forcedLogout of [
  { code: 1008, message: '账号已在其他地方登录' },
  { code: 1010, message: '账号已被封禁' },
]) {
  test(`request clears session and shows notice for code ${forcedLogout.code}`, async (context) => {
    const storage = createStorage({
      'blog-token': 'user-access',
      'blog-refresh-token': 'user-refresh',
      'blog-user': '{"id":1}',
    })
    const events = []
    context.mock.method(globalThis, 'fetch', async () => jsonResponse({
      code: forcedLogout.code,
      message: forcedLogout.message,
      data: null,
    }))
    globalThis.localStorage = storage
    globalThis.window = { dispatchEvent(event) { events.push(event.type) } }
    globalThis.CustomEvent = class CustomEvent { constructor(type) { this.type = type } }

    await assert.rejects(() => request('GET', '/api/users/me'))

    assert.equal(storage.getItem('blog-token'), null)
    assert.equal(storage.getItem('blog-refresh-token'), null)
    assert.equal(storage.getItem('blog-user'), null)
    assert.deepEqual(events, ['blog:session-replaced'])
    const notice = notices.value.find((item) => item.message === forcedLogout.message)
    assert.ok(notice)
    removeNotice(notice.id)
  })
}

test('request shows banned notice when token refresh is rejected for a banned user', async (context) => {
  const storage = createStorage({
    'blog-token': 'expired-access',
    'blog-refresh-token': 'valid-refresh',
    'blog-user': '{"id":1}',
  })
  const responses = [
    jsonResponse({ code: 1006, message: 'access_token过期', data: null }),
    jsonResponse({ code: 1010, message: '账号已被封禁', data: null }),
  ]
  context.mock.method(globalThis, 'fetch', async () => responses.shift())
  globalThis.localStorage = storage
  globalThis.window = { dispatchEvent() {} }
  globalThis.CustomEvent = class CustomEvent { constructor(type) { this.type = type } }

  await assert.rejects(() => request('GET', '/api/users/me'))

  assert.equal(storage.getItem('blog-token'), null)
  const notice = notices.value.find((item) => item.message === '账号已被封禁')
  assert.ok(notice)
  removeNotice(notice.id)
})
