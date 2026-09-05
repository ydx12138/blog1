import assert from 'node:assert/strict'
import test from 'node:test'

import { resolveTheme } from './theme.js'

test('resolveTheme keeps frontend and admin theme preferences isolated', () => {
  const storage = new Map([
    ['blog-theme', 'dark'],
    ['blog-admin-theme', 'light'],
  ])

  assert.equal(resolveTheme('blog-theme', () => storage.get('blog-theme'), true), 'dark')
  assert.equal(resolveTheme('blog-admin-theme', () => storage.get('blog-admin-theme'), true), 'light')
})

test('resolveTheme falls back to the system preference without a saved theme', () => {
  assert.equal(resolveTheme('blog-admin-theme', () => null, true), 'dark')
  assert.equal(resolveTheme('blog-admin-theme', () => null, false), 'light')
})
