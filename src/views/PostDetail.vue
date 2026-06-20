<template>
  <div class="post-detail-page">
    <router-link to="/posts" class="back-link">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
      </svg>
      返回文章列表
    </router-link>

    <div class="error-banner" v-if="fetchError">{{ fetchError }}</div>
    <div class="loading" v-if="loading">加载中...</div>
    <div class="not-found" v-else-if="!loading && !article && !fetchError">文章不存在</div>

    <article class="post-article" v-if="article">
      <header class="post-header">
        <span class="post-category" v-if="article.category_name">{{ article.category_name }}</span>
        <h1 class="post-title">{{ article.title }}</h1>
        <div class="post-meta">
          <time>{{ formattedDate }}</time>
          <span class="meta-divider">·</span>
          <span>{{ article.view_count || 0 }} 次阅读</span>
          <span class="meta-divider">·</span>
          <span>{{ article.comment_count || 0 }} 条评论</span>
        </div>
        <div class="post-tags" v-if="tags.length">
          <span v-for="tag in tags" :key="tag" class="post-tag">{{ tag }}</span>
        </div>
      </header>

      <div class="post-body">
        <!-- 富文本内容 -->
        <div v-if="article.content_type === 1" class="rich-text" v-html="article.content"></div>
        <!-- Markdown内容 - 使用md-editor-v3预览 -->
        <MdPreview v-else-if="article.content_type === 2" :modelValue="article.content" />
        <!-- 默认富文本 -->
        <div v-else class="rich-text" v-html="article.content"></div>
      </div>
    </article>

    <!-- 评论区 -->
    <section class="comments-section" v-if="article">
      <h2 class="comments-title">评论 ({{ totalComments }})</h2>

      <!-- 评论表单 -->
      <div class="comment-form" v-if="isLoggedIn">
        <textarea v-model="commentText" placeholder="写下你的评论..." rows="3" class="comment-input"></textarea>
        <div class="comment-form-footer">
          <span class="comment-hint" v-if="commentError">{{ commentError }}</span>
          <button class="btn-submit" @click="submitComment" :disabled="submitting || !commentText.trim()">
            {{ submitting ? '提交中...' : '发表评论' }}
          </button>
        </div>
      </div>
      <div class="comment-login-hint" v-else>
        <button class="link-btn" @click="showAuth">登录</button> 后发表评论
      </div>

      <!-- 评论列表 -->
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
      <div class="empty" v-else-if="!loadingComments">暂无评论</div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getArticleDetail } from '../api/articles.js'
import { getComments, createComment } from '../api/comments.js'
import { useAuth } from '../stores/auth.js'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const route = useRoute()
const articleId = computed(() => Number(route.params.id))

const { isLoggedIn } = useAuth()

const article = ref(null)
const loading = ref(false)
const comments = ref([])
const totalComments = ref(0)
const loadingComments = ref(false)
const commentText = ref('')
const commentError = ref('')
const submitting = ref(false)
const fetchError = ref('')

const formattedDate = computed(() => {
  if (!article.value?.created_at) return ''
  const d = new Date(article.value.created_at)
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

async function fetchArticle() {
  loading.value = true
  fetchError.value = ''
  try {
    article.value = await getArticleDetail(articleId.value)
  } catch (e) {
    fetchError.value = '加载失败：' + (e.message || '请确认后端服务已启动')
  }
  loading.value = false
}

async function fetchComments() {
  loadingComments.value = true
  try {
    const data = await getComments(articleId.value, 1)
    comments.value = data.list || []
    totalComments.value = data.total || 0
  } catch (e) {
    console.error('获取评论失败:', e)
  }
  loadingComments.value = false
}

async function submitComment() {
  commentError.value = ''
  if (!commentText.value.trim()) return
  submitting.value = true
  try {
    await createComment({
      article_id: articleId.value,
      content: commentText.value.trim(),
      parent_id: 0,
    })
    commentText.value = ''
    fetchComments()
  } catch (e) {
    commentError.value = e.message || '评论失败'
  }
  submitting.value = false
}

function showAuth() {
  // 触发登录弹窗 - 通过事件通知父组件
  window.dispatchEvent(new CustomEvent('show-auth-modal'))
}

onMounted(() => {
  fetchArticle()
  fetchComments()
})
watch(articleId, () => {
  fetchArticle()
  fetchComments()
})
</script>

<style scoped>
.post-detail-page { padding: 32px 0; max-width: 780px; }
.back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; color: var(--text-secondary); margin-bottom: 24px; transition: color var(--transition); }
.back-link:hover { color: var(--accent); opacity: 1; }
.error-banner { padding: 12px 16px; background: #fee2e2; color: #991b1b; border-radius: var(--radius-sm); margin-bottom: 16px; font-size: 14px; }
.loading, .not-found { text-align: center; padding: 64px 0; color: var(--text-muted); }

.post-header { margin-bottom: 36px; padding-bottom: 24px; border-bottom: 1px solid var(--border-light); }
.post-category { display: inline-block; font-size: 12px; padding: 3px 12px; border-radius: 100px; background: var(--accent-light); color: var(--accent); font-family: var(--font-mono); margin-bottom: 16px; }
.post-title { font-family: var(--font-serif); font-size: 34px; font-weight: 700; color: var(--heading); line-height: 1.3; letter-spacing: -1px; margin-bottom: 12px; }
.post-meta { font-size: 14px; color: var(--text-muted); font-family: var(--font-mono); display: flex; align-items: center; gap: 4px; margin-bottom: 12px; }
.meta-divider { margin: 0 4px; }
.post-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.post-tag { font-size: 12px; padding: 3px 10px; border-radius: 100px; background: var(--tag-bg); color: var(--tag-text); }

/* 文章正文 */
.post-body { font-size: 17px; line-height: 1.85; color: var(--text); margin-bottom: 48px; }
.rich-text :deep(h1), .markdown-body :deep(h1) { font-size: 28px; margin: 32px 0 16px; }
.rich-text :deep(h2), .markdown-body :deep(h2) { font-size: 22px; margin: 28px 0 14px; }
.rich-text :deep(h3), .markdown-body :deep(h3) { font-size: 18px; margin: 24px 0 12px; }
.rich-text :deep(p), .markdown-body :deep(p) { margin-bottom: 16px; }
.rich-text :deep(code), .markdown-body :deep(code) { background: var(--tag-bg); padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
.rich-text :deep(pre), .markdown-body :deep(pre) { background: var(--tag-bg); padding: 16px; border-radius: var(--radius); overflow-x: auto; margin: 16px 0; }
.rich-text :deep(blockquote) { border-left: 3px solid var(--accent); padding-left: 16px; color: var(--text-secondary); margin: 16px 0; }
.rich-text :deep(img), .markdown-body :deep(img) { max-width: 100%; border-radius: var(--radius); margin: 12px 0; }
.rich-text :deep(a), .markdown-body :deep(a) { color: var(--accent); text-decoration: underline; }
.rich-text :deep(ul), .rich-text :deep(ol), .markdown-body :deep(ul), .markdown-body :deep(ol) { padding-left: 24px; margin-bottom: 16px; }

/* 评论区 */
.comments-section { border-top: 2px solid var(--accent); padding-top: 32px; }
.comments-title { font-family: var(--font-serif); font-size: 22px; font-weight: 600; color: var(--heading); margin-bottom: 24px; }

.comment-form { margin-bottom: 32px; }
.comment-input { width: 100%; padding: 12px 14px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--bg); color: var(--text); font-size: 14px; font-family: var(--font-sans); resize: vertical; outline: none; transition: border-color var(--transition); }
.comment-input:focus { border-color: var(--accent-border); box-shadow: 0 0 0 3px var(--accent-light); }
.comment-form-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.comment-hint { font-size: 13px; color: #dc2626; }
.btn-submit { padding: 8px 24px; border: none; border-radius: var(--radius-sm); background: var(--accent); color: #fff; font-size: 14px; font-weight: 500; cursor: pointer; transition: all var(--transition); }
.btn-submit:hover:not(:disabled) { opacity: 0.9; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.comment-login-hint { text-align: center; padding: 24px; color: var(--text-muted); font-size: 14px; }
.link-btn { border: none; background: none; color: var(--accent); cursor: pointer; font-size: 14px; padding: 0; }
.link-btn:hover { text-decoration: underline; }

.comment-list { display: flex; flex-direction: column; gap: 20px; }
.comment-item { display: flex; gap: 14px; }
.comment-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--accent); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; flex-shrink: 0; }
.comment-body { flex: 1; min-width: 0; padding-bottom: 16px; border-bottom: 1px solid var(--border-light); }
.comment-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.comment-author { font-size: 14px; font-weight: 500; color: var(--heading); }
.comment-time { font-size: 12px; color: var(--text-muted); }
.comment-content { font-size: 15px; color: var(--text); line-height: 1.6; }
.empty { text-align: center; padding: 32px 0; color: var(--text-muted); font-size: 14px; }

@media (max-width: 768px) {
  .post-title { font-size: 26px; }
  .post-body { font-size: 16px; }
}
</style>
