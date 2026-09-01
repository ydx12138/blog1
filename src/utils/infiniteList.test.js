import assert from 'node:assert/strict'
import test from 'node:test'

import { getHasMore, mergeUniquePosts } from './infiniteList.js'

test('mergeUniquePosts appends new articles without duplicating existing articles', () => {
  const current = [{ id: 1 }, { id: 2 }]
  const incoming = [{ id: 2 }, { id: 3 }, { id: 3 }]

  assert.deepEqual(mergeUniquePosts(current, incoming), [{ id: 1 }, { id: 2 }, { id: 3 }])
})

test('getHasMore uses the server flag for category batches', () => {
  assert.equal(getHasMore({ mode: 'category', hasMore: true, postsLength: 10, total: 10 }), true)
  assert.equal(getHasMore({ mode: 'category', hasMore: false, postsLength: 10, total: 100 }), false)
})

test('getHasMore uses the known total for the all-articles batch', () => {
  assert.equal(getHasMore({ mode: 'all', postsLength: 10, total: 11 }), true)
  assert.equal(getHasMore({ mode: 'all', postsLength: 11, total: 11 }), false)
})
