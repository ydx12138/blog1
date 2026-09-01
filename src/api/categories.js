import { request } from './client.js'

export function getCategories() {
  return request('GET', '/api/categories')
}

export function getCategoryArticles(categoryId, page = 1) {
  return request('GET', `/api/categories/articles?category_id=${categoryId}&page=${page}`)
}

// 获取分类文章的下一批数据；参数为分类 ID、页码和批量大小；返回文章列表及是否还有下一批。
export function getCategoryArticlesPage(categoryId, page = 1, pageSize = 10) {
  const params = new URLSearchParams({
    category_id: String(categoryId),
    page: String(page),
    page_size: String(pageSize),
  })
  return request('GET', `/api/categories/articles/page?${params.toString()}`)
}
