// 合并文章批次并按文章 ID 去重；参数为已有文章和新批次；返回合并后的文章数组。
export function mergeUniquePosts(currentPosts, nextPosts) {
  const knownIDs = new Set(currentPosts.map((post) => post.id))
  const uniqueNextPosts = nextPosts.filter((post) => {
    if (knownIDs.has(post.id)) return false
    knownIDs.add(post.id)
    return true
  })
  return currentPosts.concat(uniqueNextPosts)
}

// 判断文章流是否还有下一批；分类模式使用后端标记，其他模式使用总数；返回是否继续加载。
export function getHasMore({ mode, hasMore, postsLength, total }) {
  if (mode === 'category') return Boolean(hasMore)
  return postsLength < total
}
