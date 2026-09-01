import assert from 'node:assert/strict'
import test from 'node:test'

import { filterCategories, getTopCategories } from './categoryDisplay.js'

test('getTopCategories keeps the top row order when a later category is selected', () => {
  const categories = [
    { id: 1, name: 'Go' },
    { id: 2, name: '前端' },
    { id: 3, name: '数据库' },
    { id: 4, name: '部署' },
  ]

  assert.deepEqual(getTopCategories(categories, 3), [
    { id: 1, name: 'Go' },
    { id: 2, name: '前端' },
    { id: 3, name: '数据库' },
  ])
})

test('getTopCategories limits the top row while keeping source order', () => {
  const categories = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]

  assert.deepEqual(getTopCategories(categories, 2), [{ id: 1 }, { id: 2 }])
})

test('filterCategories matches category names without changing source order', () => {
  const categories = [
    { id: 1, name: 'Go 后端' },
    { id: 2, name: 'Vue 前端' },
    { id: 3, name: 'Golang 实战' },
  ]

  assert.deepEqual(filterCategories(categories, 'go'), [
    { id: 1, name: 'Go 后端' },
    { id: 3, name: 'Golang 实战' },
  ])
})

test('filterCategories returns all categories for a blank keyword', () => {
  const categories = [{ id: 1, name: 'Go' }, { id: 2, name: '前端' }]

  assert.deepEqual(filterCategories(categories, '  '), categories)
})
