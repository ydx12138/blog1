import assert from 'node:assert/strict'
import test from 'node:test'

import { canCloseCropModal, clampCropOffset, coverScale, cropSourceRect } from './avatarCrop.js'

test('coverScale fills a square crop viewport', () => {
  assert.equal(coverScale(1600, 800, 240), 0.3)
  assert.equal(coverScale(800, 1600, 240), 0.3)
})

test('clampCropOffset keeps the viewport covered after dragging', () => {
  assert.deepEqual(
    clampCropOffset({ x: 999, y: -999 }, 480, 320, 240),
    { x: 0, y: -80 },
  )
})

test('cropSourceRect maps the crop viewport to image pixels', () => {
  assert.deepEqual(
    cropSourceRect({ x: -120, y: -60 }, 0.5, 240),
    { sx: 240, sy: 120, size: 480 },
  )
})

test('canCloseCropModal keeps user close blocked while upload is pending but allows successful upload to close', () => {
  assert.equal(canCloseCropModal(true), false)
  assert.equal(canCloseCropModal(true, true), true)
})
