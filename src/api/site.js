import { request } from './client.js'

const ADMIN = true

export function getSiteSettings() {
  return request('GET', '/api/settings/site')
}

export function getAdminSiteSettings() {
  return request('GET', '/api/admin/settings/site', null, ADMIN)
}

export function updateAdminSiteSettings(data) {
  return request('PUT', '/api/admin/settings/site', data, ADMIN)
}
