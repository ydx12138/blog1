import assert from 'node:assert/strict'
import test from 'node:test'

import { formatDashboardNumber, buildTrendPoints } from './dashboard.js'

test('formatDashboardNumber formats large dashboard metrics in Chinese units', () => {
  assert.equal(formatDashboardNumber(0), '0')
  assert.equal(formatDashboardNumber(12500), '1.3万')
  assert.equal(formatDashboardNumber(1280000), '128万')
})

test('buildTrendPoints maps every trend value into the SVG viewport', () => {
  const points = buildTrendPoints([2, 6, 4], 300, 100)

  assert.deepEqual(points, [
    { x: 0, y: 66.67 },
    { x: 150, y: 0 },
    { x: 300, y: 33.33 },
  ])
})

test('buildTrendPoints keeps an all-zero series on the baseline', () => {
  assert.deepEqual(buildTrendPoints([0, 0], 100, 50), [
    { x: 0, y: 50 },
    { x: 100, y: 50 },
  ])
})
