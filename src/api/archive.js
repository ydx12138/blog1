import { request } from './client.js'

// getArchive 获取按年份分组的已发布文章归档；返回 {total, years:[{year,count,articles:[...]}]}。
export function getArchive() {
  return request('GET', '/api/articles/archive')
}