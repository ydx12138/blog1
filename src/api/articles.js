import { request } from './client.js'

//首页分页展示，getArticles(page, pageSize) 获取文章列表，默认第一页，每页10条
export function getArticles(page = 1, pageSize = 10) {
  return request('GET', `/api/articles?page=${page}&page_size=${pageSize}`)
}
// 获取文章详情
export function getArticleDetail(id) {
  return request('GET', `/api/articles/detail?id=${id}`)
}
// 搜索文章
export function searchArticles(keyword) {
  return request('GET', `/api/articles/search?keyword=${encodeURIComponent(keyword)}`)
}
// 点赞文章
export function likeArticle(articleId) {
  return request('POST', '/api/articles/like', { article_id: articleId })
}
// 取消点赞文章
export function fetchTags() {
  return request('GET', '/api/tags')
}
