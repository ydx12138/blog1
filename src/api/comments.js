import { request } from './client.js'

export function getComments(articleId, page = 1) {
  return request('GET', `/api/comments?article_id=${articleId}&page=${page}`)
}

export function createComment(data) {
  return request('POST', '/api/comments', data)
}
