import assert from 'node:assert/strict'
import test from 'node:test'

import { notices, removeNotice, showError } from './useNotice.js'

// 测试提示函数是否能添加和删除指定提示。
// 参数：测试框架提供的上下文；返回值：无，通过断言报告结果。
test('showError adds a removable error notice', () => {
  const noticeId = showError('请输入标题')

  assert.equal(notices.value.some((notice) => notice.id === noticeId && notice.message === '请输入标题'), true)

  removeNotice(noticeId)

  assert.equal(notices.value.some((notice) => notice.id === noticeId), false)
})
