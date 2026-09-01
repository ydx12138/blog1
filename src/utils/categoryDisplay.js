// 生成顶部固定顺序的分类选项；参数为分类数组和显示数量；返回分类原始顺序的前 N 项。
export function getTopCategories(categories, limit = 5) {
  const safeLimit = Math.max(1, limit)
  return categories.slice(0, safeLimit)
}

// 按名称过滤分类；参数为分类数组和搜索词；返回保持原始顺序的匹配分类数组。
export function filterCategories(categories, keyword) {
  const normalizedKeyword = String(keyword || '').trim().toLocaleLowerCase()
  if (!normalizedKeyword) return categories

  return categories.filter((category) => (
    String(category.name || '').toLocaleLowerCase().includes(normalizedKeyword)
  ))
}
