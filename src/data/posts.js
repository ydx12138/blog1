/**
 * 文章数据 — 对应 articles 表
 * 字段: id, title, summary, content, cover, category_id, author_id,
 *        view_count, like_count, comment_count, status, publish_time,
 *        created_at, updated_at
 *
 * 标签关联 — 对应 article_tags 表 (article_id, tag_id)
 * 字段: tag_ids (number[])
 */
export const posts = [
  {
    id: 1,
    title: 'Pake 3.0 — 用 Rust 把网页打包成桌面应用的踩坑记录',
    summary:
      'Pake 3.0 带来了全新的架构升级，使用 Rust 重写核心逻辑，打包速度提升 3 倍，内存占用降低 40%。这篇文章记录了这个过程中的技术选型与实现细节。',
    content: '',
    cover: '',
    category_id: 2,
    author_id: 1,
    view_count: 12830,
    like_count: 456,
    comment_count: 82,
    status: 2,
    publish_time: '2025-06-01 10:00:00',
    created_at: '2025-06-01 09:00:00',
    updated_at: '2025-06-03 14:00:00',
    tag_ids: [1, 2, 3],
  },
  {
    id: 2,
    title: '我的 AI 辅助编程工作流 2025',
    summary:
      '从 Copilot 到 Claude Code，聊聊我日常开发中如何使用 AI 工具提高效率，以及一些实用的提示词技巧。',
    content: '',
    cover: '',
    category_id: 3,
    author_id: 1,
    view_count: 9520,
    like_count: 328,
    comment_count: 56,
    status: 2,
    publish_time: '2025-05-15 08:30:00',
    created_at: '2025-05-15 08:00:00',
    updated_at: '2025-05-16 12:00:00',
    tag_ids: [4, 5, 6],
  },
  {
    id: 3,
    title: 'MiaoYan 2.0 — 极简 Markdown 编辑器的设计哲学',
    summary:
      '妙言 2.0 重新思考了 Markdown 编辑器应该是什么样子。不去做 All-in-One，只做好一件事——让你专注于写作本身。',
    content: '',
    cover: '',
    category_id: 5,
    author_id: 1,
    view_count: 6750,
    like_count: 289,
    comment_count: 41,
    status: 2,
    publish_time: '2025-04-20 14:00:00',
    created_at: '2025-04-20 12:00:00',
    updated_at: '2025-04-21 09:00:00',
    tag_ids: [7, 8, 9],
  },
  {
    id: 4,
    title: '潮流周刊第 100 期 — 做开源这三年',
    summary:
      '从第一个项目到现在的 50k+ Star，聊聊做开源项目三年的心路历程、社区运营经验和对开源可持续性的思考。',
    content: '',
    cover: '',
    category_id: 4,
    author_id: 1,
    view_count: 18400,
    like_count: 712,
    comment_count: 135,
    status: 2,
    publish_time: '2025-03-08 09:00:00',
    created_at: '2025-03-08 08:00:00',
    updated_at: '2025-03-10 16:00:00',
    tag_ids: [3, 10, 11],
  },
  {
    id: 5,
    title: '前端性能优化实战：从 3s 到 300ms',
    summary:
      '记录一个实际项目的性能优化过程，涉及构建优化、资源加载策略、渲染性能等多个维度的实践方法。',
    content: '',
    cover: '',
    category_id: 1,
    author_id: 1,
    view_count: 11120,
    like_count: 398,
    comment_count: 67,
    status: 2,
    publish_time: '2025-02-14 11:00:00',
    created_at: '2025-02-14 10:00:00',
    updated_at: '2025-02-15 15:00:00',
    tag_ids: [12, 13, 14],
  },
  {
    id: 6,
    title: '2025 前端技术趋势个人观察',
    summary:
      '新的一年，聊聊我对前端技术发展的观察：Rust 工具链的崛起、AI Native 应用、以及边缘计算的实践落地。',
    content: '',
    cover: '',
    category_id: 1,
    author_id: 1,
    view_count: 15200,
    like_count: 534,
    comment_count: 98,
    status: 2,
    publish_time: '2025-01-01 10:00:00',
    created_at: '2025-01-01 09:00:00',
    updated_at: '2025-01-02 11:00:00',
    tag_ids: [12, 15, 16],
  },
]

/** 过滤出已发布的文章 */
export function getPublishedPosts() {
  return posts.filter((p) => p.status === 2)
}
