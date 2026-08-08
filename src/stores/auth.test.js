import assert from 'node:assert/strict'
import test from 'node:test'

import { isUsableToken, sessionFromLoginResponse } from './auth.js'

test('登录会话使用后端返回的 access_token', () => {
  const session = sessionFromLoginResponse({
    id: 26,
    email: 'user@example.com',
    nickname: '小26',
    access_token: 'access-token-value',
  })

  assert.deepEqual(session.user, {
    id: 26,
    email: 'user@example.com',
    nickname: '小26',
  })
  assert.equal(session.token, 'access-token-value')
})

test('旧版本写入的 undefined 不是有效 token', () => {
  assert.equal(isUsableToken('undefined'), false)
  assert.equal(isUsableToken(''), false)
  assert.equal(isUsableToken('access-token-value'), true)
})
