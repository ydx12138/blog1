import { request } from './client.js'

// 获取已启用的友情链接列表
export function fetchLinks() {
  return request('GET', '/api/links')
}

// 后台：获取全部友情链接
export function adminListLinks() {
  return request('GET', '/api/admin/friend-links', undefined, true)
}

// 后台：新建友情链接
export function adminCreateLink(payload) {
  return request('POST', '/api/admin/friend-links', payload, true)
}

// 后台：更新友情链接
export function adminUpdateLink(id, payload) {
  return request('PUT', `/api/admin/friend-links/${id}`, payload, true)
}

// 后台：删除友情链接
export function adminDeleteLink(id) {
  return request('DELETE', `/api/admin/friend-links/${id}`, undefined, true)
}