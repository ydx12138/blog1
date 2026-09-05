import { request } from './client.js'

// fetchTagCloud 获取标签云（标签名 + 已发布文章数）；返回标签统计列表。
export function fetchTagCloud() {
  return request('GET', '/api/tags/cloud')
}

// getArticlesByTag 分页获取指定标签下的已发布文章；参数 tag 为标签名、page 为页码、pageSize 为每页数量。
export function getArticlesByTag(tag, page = 1, pageSize = 10) {
  return request('GET', `/api/tags/articles?tag=${encodeURIComponent(tag)}&page=${page}&page_size=${pageSize}`)
}
