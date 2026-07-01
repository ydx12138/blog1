<template>
  <div class="admin-preview">
    <header class="preview-topbar">
      <router-link to="/admin/articles" class="back-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        返回文章管理
      </router-link>
      <span class="preview-badge">管理员预览（只读）</span>
    </header>

    <div class="preview-loading" v-if="loading">加载中...</div>
    <div class="preview-error" v-else-if="error">{{ error }}</div>

    <!-- 内容区：禁止一切点击 -->
    <div class="preview-body" v-else-if="article" style="pointer-events: none;">
      <article class="preview-article">
        <header class="post-header">
          <span class="post-category" v-if="article.category_name">{{ article.category_name }}</span>
          <h1 class="post-title">{{ article.title }}</h1>
          <div class="post-meta">
            <time>{{ formattedDate }}</time>
            <span class="meta-sep">·</span>
            <span>{{ article.view_count || 0 }} 次阅读</span>
            <span class="meta-sep">·</span>
            <span>{{ likeCount }} 次点赞</span>
            <span class="meta-sep">·</span>
            <span>{{ totalComments }} 条评论</span>
          </div>
          <div class="post-tags" v-if="tags.length">
            <span v-for="t in tags" :key="t" class="tag">{{ t }}</span>
          </div>
        </header>

        <div class="post-body">
          <div v-if="article.content_type === 1" class="rich-text" v-html="article.content"></div>
          <MdPreview v-else-if="article.content_type === 2" :modelValue="article.content" />
          <div v-else class="rich-text" v-html="article.content"></div>
        </div>
      </article>

      <!-- 点赞栏（只读展示） -->
      <div class="post-like-bar">
        <span class="like-btn-static">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
          </svg>
          点赞
        </span>
        <span class="like-count-text">{{ likeCount }} 次点赞</span>
      </div>

      <!-- 评论区（只读） -->
      <section class="comments-section">
        <h2 class="comments-title">评论 ({{ totalComments }})</h2>
        <div class="comment-list" v-if="comments.length">
          <div v-for="c in comments" :key="c.id" class="comment-item">
            <div class="comment-avatar">{{ c.nickname?.charAt(0)?.toUpperCase() || '?' }}</div>
            <div class="comment-body">
              <div class="comment-header">
                <span class="comment-author">{{ c.nickname }}</span>
                <span class="comment-time">{{ formatTime(c.created_at) }}</span>
              </div>
              <p class="comment-content">{{ c.content }}</p>
            </div>
          </div>
        </div>
        <p class="empty-comments" v-else>暂无评论</p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getAdminArticle } from '../../api/admin.js'
import { getComments } from '../../api/comments.js'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const route = useRoute()
const id = computed(() => Number(route.params.id))

const article = ref(null)
const loading = ref(false)
const error = ref('')
const comments = ref([])
const totalComments = ref(0)
const likeCount = ref(0)

const formattedDate = computed(() => {
  if (!article.value?.publish_time && !article.value?.created_at) return ''
  const d = new Date(article.value.publish_time || article.value.created_at)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
})

const tags = computed(() => {
  if (!article.value?.tags) return []
  if (Array.isArray(article.value.tags)) return article.value.tags
  return article.value.tags.split(',').map(t => t.trim()).filter(Boolean)
})

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }) + ' ' +
    d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

onMounted(async () => {
  loading.value = true
  try {
    article.value = await getAdminArticle(id.value)
    likeCount.value = article.value.like_count || 0
  } catch (e) {
    error.value = '加载失败：' + (e.message || '请确认后端服务已启动')
  }
  // 加载评论
  try {
    const data = await getComments(id.value, 1)
    comments.value = data.list || []
    totalComments.value = data.total || 0
  } catch (e) { console.error(e) }
  loading.value = false
})
</script>

<style scoped>
.admin-preview {
  min-height: 100vh;
  background: var(--bg);
}

.preview-topbar {
  display: flex; align-items: center; gap: 14px;
  height: 48px; padding: 0 24px;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-card);
  position: sticky; top: 0; z-index: 10;
}
.back-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; color: var(--text-secondary);
  text-decoration: none; transition: color var(--transition);
}
.back-btn:hover { color: var(--accent); }
.preview-badge {
  font-size: 11px; padding: 2px 10px;
  border-radius: 100px;
  background: var(--accent-light); color: var(--accent);
  font-family: var(--font-mono);
}

.preview-loading, .preview-error {
  text-align: center; padding: 80px 0;
  color: var(--text-muted); font-size: 14px;
}
.preview-error { color: var(--danger); }

.preview-body {
  max-width: 1200px; margin: 0 auto;
  padding: 40px 24px;
}

/* 文章头部 */
.post-header { margin-bottom: 36px; padding-bottom: 24px; border-bottom: 1px solid var(--border-light); }
.post-category {
  display: inline-block; font-size: 12px; padding: 3px 12px;
  border-radius: 100px; background: var(--accent-light); color: var(--accent);
  font-family: var(--font-mono); margin-bottom: 16px;
}
.post-title {
  font-family: var(--font-serif); font-size: 34px; font-weight: 700;
  color: var(--heading); line-height: 1.3; letter-spacing: -1px;
  margin-bottom: 12px;
  word-break: break-word; overflow-wrap: break-word;
}
.post-meta {
  font-size: 13px; color: var(--text-muted); font-family: var(--font-mono);
  display: flex; align-items: center; flex-wrap: wrap; gap: 4px;
  margin-bottom: 12px;
}
.meta-sep { margin: 0 4px; }
.post-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.tag {
  font-size: 11px; padding: 2px 10px; border-radius: 100px;
  background: var(--tag-bg); color: var(--tag-text); font-family: var(--font-mono);
}

/* 文章正文 */
.post-body {
  font-size: 17px; line-height: 1.85; color: var(--text);
  margin-bottom: 20px;
}
.rich-text :deep(h1) { font-size: 28px; margin: 32px 0 16px; }
.rich-text :deep(h2) { font-size: 22px; margin: 28px 0 14px; }
.rich-text :deep(h3) { font-size: 18px; margin: 24px 0 12px; }
.rich-text :deep(p) { margin-bottom: 16px; }
.rich-text :deep(code) { background: var(--tag-bg); padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
.rich-text :deep(pre) { background: var(--tag-bg); padding: 16px; border-radius: var(--radius); overflow-x: auto; margin: 16px 0; }
.rich-text :deep(blockquote) { border-left: 3px solid var(--accent); padding-left: 16px; color: var(--text-secondary); margin: 16px 0; }
.rich-text :deep(img) { max-width: 100%; border-radius: var(--radius); margin: 12px 0; }
.rich-text :deep(a) { color: var(--accent); text-decoration: underline; }

/* 点赞栏（只读） */
.post-like-bar {
  display: flex; align-items: center; gap: 14px;
  padding: 20px 0; margin-bottom: 24px;
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
}
.like-btn-static {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 20px;
  border: 1px solid var(--border); border-radius: var(--radius-sm);
  background: var(--bg-card); color: var(--text-secondary);
  font-size: 14px;
}
.like-count-text { font-size: 14px; color: var(--text-muted); font-family: var(--font-mono); }

/* 评论区 */
.comments-section { padding-top: 12px; }
.comments-title { font-family: var(--font-serif); font-size: 20px; font-weight: 600; color: var(--heading); margin-bottom: 24px; }
.comment-list { display: flex; flex-direction: column; gap: 18px; }
.comment-item { display: flex; gap: 12px; }
.comment-avatar {
  width: 34px; height: 34px; border-radius: 50%;
  background: var(--accent); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600; flex-shrink: 0;
}
.comment-body { flex: 1; min-width: 0; padding-bottom: 14px; border-bottom: 1px solid var(--border-light); }
.comment-header { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.comment-author { font-size: 14px; font-weight: 500; color: var(--heading); }
.comment-time { font-size: 12px; color: var(--text-muted); }
.comment-content { font-size: 15px; color: var(--text); line-height: 1.6; }
.empty-comments { text-align: center; padding: 32px 0; color: var(--text-muted); font-size: 14px; }

@media (max-width: 768px) {
  .preview-topbar { padding: 0 12px; }
  .preview-body { padding: 24px 16px; }
  .post-title { font-size: 26px; }
  .post-body { font-size: 16px; }
}
</style>
