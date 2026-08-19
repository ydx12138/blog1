import assert from 'node:assert/strict'
import test from 'node:test'

import { buildSiteSettingsPayload } from './site.js'

test('buildSiteSettingsPayload includes the cropped avatar URL', () => {
  const payload = buildSiteSettingsPayload({
    registerEnabled: true,
    categoriesEnabled: true,
    profileEnabled: true,
    commentsEnabled: true,
    siteTitle: '懂你',
    profileGithub: 'https://github.com/ydx12138',
    profileEmail: 'name@example.com',
    profileAvatar: 'https://cdn.example.com/avatar.png',
  })

  assert.equal(payload.profile_avatar, 'https://cdn.example.com/avatar.png')
})
