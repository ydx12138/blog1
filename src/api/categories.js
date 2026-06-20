import { request } from './client.js'

export function getCategories() {
  return request('GET', '/api/categories')
}

export function getCategoryArticles(categoryId, page = 1) {
  return request('GET', `/api/categories/articles?category_id=${categoryId}&page=${page}`)
}
