/**
 * 标签表 — 对应 tags 表
 * 字段: id, name, created_at, updated_at
 */
export const tags = [
  { id: 1, name: 'Rust' },
  { id: 2, name: 'Tauri' },
  { id: 3, name: '开源' },
  { id: 4, name: 'AI' },
  { id: 5, name: '效率' },
  { id: 6, name: '工具' },
  { id: 7, name: 'Swift' },
  { id: 8, name: 'macOS' },
  { id: 9, name: '设计' },
  { id: 10, name: '思考' },
  { id: 11, name: '周刊' },
  { id: 12, name: '前端' },
  { id: 13, name: '性能' },
  { id: 14, name: '实战' },
  { id: 15, name: '趋势' },
  { id: 16, name: '年度总结' },
]

/**
 * 根据 tag_id 查找标签名称
 */
export function getTagName(id) {
  const tag = tags.find((t) => t.id === id)
  return tag ? tag.name : ''
}
