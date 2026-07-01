import { request, uploadRequest } from './client.js'

const ADMIN = true
const PREFIX = '/api/admin'

// Dashboard
export function getDashboard() {
  return request('GET', `${PREFIX}/dashboard`, null, ADMIN)
}

// Articles
export function getAdminArticles(params = {}) {
  const { page = 1, pageSize = 10, keyword = '', status = 0 } = params
  return request('GET', `${PREFIX}/articles?page=${page}&page_size=${pageSize}&keyword=${encodeURIComponent(keyword)}&status=${status}`, null, ADMIN)
}
// 获取文章详情
export function getAdminArticle(id) {
  return request('GET', `${PREFIX}/articles/${id}`, null, ADMIN)
}
// 创建文章
export function createArticle(data) {
  return request('POST', `${PREFIX}/articles`, data, ADMIN)
}

function numID(id) { return Number(id) }

export function updateArticle(id, data) {
  return request('PUT', `${PREFIX}/articles/${id}`, { ...data, id: numID(id) }, ADMIN)
}

export function deleteArticle(id) {
  return request('DELETE', `${PREFIX}/articles/${id}`, { id: numID(id) }, ADMIN)
}

export function publishArticle(id) {
  return request('PUT', `${PREFIX}/articles/${id}/publish`, { id: numID(id) }, ADMIN)
}

// Drafts
export function getDrafts(page = 1, pageSize = 10) {
  return request('GET', `${PREFIX}/drafts?page=${page}&page_size=${pageSize}`, null, ADMIN)
}

// Upload
export function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return uploadRequest(`${PREFIX}/upload`, formData)
}

// Comments
export function getAllComments(page = 1, pageSize = 10, keyword = '', type = '') {
  let url = `${PREFIX}/comments?page=${page}&page_size=${pageSize}`
  if (keyword) url += `&keyword=${encodeURIComponent(keyword)}&type=${type}`
  return request('GET', url, null, ADMIN)
}

export function setCommentStatus(id, status) {
  return request('PUT', `${PREFIX}/comments/${id}/status`, { status }, ADMIN)
}

export function getPendingComments(page = 1, pageSize = 10) {
  return request('GET', `${PREFIX}/comments/pending?page=${page}&page_size=${pageSize}`, null, ADMIN)
}

export function approveComment(id) {
  return request('PUT', `${PREFIX}/comments/${id}/approve`, { id: numID(id) }, ADMIN)
}

export function rejectComment(id) {
  return request('PUT', `${PREFIX}/comments/${id}/reject`, { id: numID(id) }, ADMIN)
}

export function deleteComment(id) {
  return request('DELETE', `${PREFIX}/comments/${id}`, { id: numID(id) }, ADMIN)
}

// Users
export function getUsers(page = 1, pageSize = 10, keyword = '', status = '') {
  let url = `${PREFIX}/users?page=${page}&page_size=${pageSize}`
  if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`
  if (status) url += `&status=${status}`
  return request('GET', url, null, ADMIN)
}

export function banUser(id) {
  return request('PUT', `${PREFIX}/users/${id}/ban`, { id: numID(id), status: 2 }, ADMIN)
}

export function unbanUser(id) {
  return request('PUT', `${PREFIX}/users/${id}/unban`, { id: numID(id), status: 1 }, ADMIN)
}

export function deleteUser(id) {
  return request('DELETE', `${PREFIX}/users/${id}`, { id: numID(id) }, ADMIN)
}
