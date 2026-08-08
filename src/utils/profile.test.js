import assert from 'node:assert/strict'
import test from 'node:test'

import { formatCreatedAt, profileRows } from './profile.js'

test('手机号为空时不创建手机号行', () => {
  const rows = profileRows({
    email: 'a@example.com',
    nickname: '阿明',
    phone: null,
    created_at: '2026-08-08T03:04:05Z',
  })

  assert.deepEqual(rows.map((row) => row.label), ['邮箱', '昵称', '账号创建时间'])
})

test('手机号存在时展示手机号', () => {
  const rows = profileRows({
    email: 'a@example.com',
    nickname: '阿明',
    phone: '13800000000',
    created_at: '2026-08-08T03:04:05Z',
  })

  assert.equal(rows.at(-1).label, '手机号')
  assert.equal(rows.at(-1).value, '13800000000')
})

test('ISO 时间格式化为本地日期时间', () => {
  assert.match(formatCreatedAt('2026-08-08T03:04:05Z'), /^2026-08-08 /)
})
