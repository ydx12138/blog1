import { request } from './client.js'

export function getArticles(page = 1, pageSize = 10) {
  return request('GET', `/api/articles?page=${page}&page_size=${pageSize}`)
}

export function getArticleDetail(id) {
  return request('GET', `/api/articles/detail?id=${id}`)
}

export function searchArticles(keyword) {
  return request('GET', `/api/articles/search?keyword=${encodeURIComponent(keyword)}`)
}
