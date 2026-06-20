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

export function getAdminArticle(id) {
  return request('GET', `${PREFIX}/articles/${id}`, null, ADMIN)
}

export function createArticle(data) {
  return request('POST', `${PREFIX}/articles`, data, ADMIN)
}

export function updateArticle(id, data) {
  return request('PUT', `${PREFIX}/articles/${id}`, { ...data, id }, ADMIN)
}

export function deleteArticle(id) {
  return request('DELETE', `${PREFIX}/articles/${id}`, { id }, ADMIN)
}

export function publishArticle(id) {
  return request('PUT', `${PREFIX}/articles/${id}/publish`, { id }, ADMIN)
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
export function getPendingComments(page = 1, pageSize = 10) {
  return request('GET', `${PREFIX}/comments/pending?page=${page}&page_size=${pageSize}`, null, ADMIN)
}

export function approveComment(id) {
  return request('PUT', `${PREFIX}/comments/${id}/approve`, { id }, ADMIN)
}

export function rejectComment(id) {
  return request('PUT', `${PREFIX}/comments/${id}/reject`, { id }, ADMIN)
}

export function deleteComment(id) {
  return request('DELETE', `${PREFIX}/comments/${id}`, { id }, ADMIN)
}

// Users
export function getUsers(page = 1, pageSize = 10) {
  return request('GET', `${PREFIX}/users?page=${page}&page_size=${pageSize}`, null, ADMIN)
}

export function banUser(id) {
  return request('PUT', `${PREFIX}/users/${id}/ban`, { id, status: 2 }, ADMIN)
}

export function unbanUser(id) {
  return request('PUT', `${PREFIX}/users/${id}/unban`, { id, status: 1 }, ADMIN)
}

export function deleteUser(id) {
  return request('DELETE', `${PREFIX}/users/${id}`, { id }, ADMIN)
}
