import { request } from './client.js'

//首页分页展示，getArticles(page, pageSize) 获取文章列表，默认第一页，每页10条
export function getArticles(page = 1, pageSize = 10) {
  return request('GET', `/api/articles?page=${page}&page_size=${pageSize}`)
}

// getArticleRanking 获取按点赞数排序的热门文章；参数 limit 为最多返回篇数；返回文章摘要列表。
export function getArticleRanking(limit = 10) {
  return request('GET', `/api/articles/ranking?limit=${limit}`)
}
// 获取文章详情
export function getArticleDetail(id) {
  return request('GET', `/api/articles/detail?id=${id}`)
}
// 搜索文章
export function searchArticles(keyword) {
	return request('GET', `/api/articles/search?keyword=${encodeURIComponent(keyword)}`)
}

// 搜索独立结果页文章，返回带命中片段的真实文章列表。
export function searchArticleResults(keyword) {
	return request('GET', `/api/articles/search/results?keyword=${encodeURIComponent(keyword)}`)
}

// 获取搜索框真实建议文章，返回最多十条带命中片段的文章列表。
export function searchArticleSuggestions(keyword) {
	return request('GET', `/api/articles/search/suggestions?keyword=${encodeURIComponent(keyword)}`)
}
// 点赞文章
export function likeArticle(articleId) {
  return request('POST', '/api/articles/like', { article_id: articleId })
}
// 取消点赞文章
export function fetchTags() {
  return request('GET', '/api/tags')
}
