<template>
  <div class="post-detail-page">
    <a class="back-link" @click="goBack">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
      </svg>
      返回
    </a>

    <div class="error-banner" v-if="fetchError">{{ fetchError }}</div>
    <div class="status-msg" v-if="loading">加载中...</div>
    <div class="status-msg" v-else-if="!loading && !article && !fetchError">文章不存在</div>

    <article class="post-article" v-if="article">
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
          <span>{{ article.comment_count || 0 }} 条评论</span>
        </div>
        <div class="post-tags" v-if="tags.length">
          <span v-for="tag in tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </header>

      <div class="post-body">
        <div v-if="article.content_type === 1" class="rich-text" v-html="article.content"></div>
        <MdPreview v-else-if="article.content_type === 2" :modelValue="article.content" />
        <div v-else class="rich-text" v-html="article.content"></div>
      </div>
    </article>

    <!-- 点赞 -->
    <div class="post-like-bar" v-if="article">
      <button
        class="btn-like"
        :class="{ liked: hasLiked }"
        @click="handleLike"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" :fill="hasLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/>
        </svg>
        {{ hasLiked ? '已点赞' : '点赞' }}
      </button>
      <span class="like-count-text">{{ likeCount }} 次点赞</span>
    </div>

    <!-- 评论区 -->
    <section class="comments-section" v-if="article">
      <h2 class="comments-title">评论 ({{ totalComments }})</h2>

      <div class="comment-form" v-if="isLoggedIn">
        <textarea
          v-model="commentText"
          placeholder="写下你的评论..."
          rows="3"
          class="comment-input"
        ></textarea>
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
      <p class="empty-comments" v-else-if="!loadingComments">暂无评论，来做第一个评论的人吧</p>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getArticleDetail, likeArticle } from '../api/articles.js'
import { getComments, createComment } from '../api/comments.js'
import { useAuth } from '../stores/auth.js'
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

const route = useRoute()
const router = useRouter()
const articleId = computed(() => Number(route.params.id))
const { isLoggedIn } = useAuth()

function goBack() {
  // 优先回退浏览器历史，回退不了则去首页
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const article = ref(null)
const loading = ref(false)
const comments = ref([])
const totalComments = ref(0)
const loadingComments = ref(false)
const commentText = ref('')
const commentError = ref('')
const submitting = ref(false)
const fetchError = ref('')
const hasLiked = ref(false)
const likeLoading = ref(false)
const likeCount = ref(0)

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
  loading.value = true; fetchError.value = ''
  try {
    article.value = await getArticleDetail(articleId.value)
    likeCount.value = article.value.like_count || 0
  }
  catch (e) { fetchError.value = '加载失败：' + (e.message || '请确认后端服务已启动') }
  loading.value = false
}

async function handleLike() {
  if (likeLoading.value) return
  likeLoading.value = true
  try {
    await likeArticle(articleId.value)
    likeCount.value++
    hasLiked.value = true
  } catch (e) {
    // 静默失败
  }
  likeLoading.value = false
}

async function fetchComments() {
  loadingComments.value = true
  try {
    const data = await getComments(articleId.value, 1)
    comments.value = data.list || []
    totalComments.value = data.total || 0
  } catch (e) { console.error('获取评论失败:', e) }
  loadingComments.value = false
}

async function submitComment() {
  commentError.value = ''
  if (!commentText.value.trim()) return
  submitting.value = true
  try {
    await createComment({ article_id: articleId.value, content: commentText.value.trim(), parent_id: 0 })
    commentText.value = ''
    fetchComments()
  } catch (e) { commentError.value = e.message || '评论失败' }
  submitting.value = false
}

function showAuth() {
  window.dispatchEvent(new CustomEvent('show-auth-modal'))
}

onMounted(() => { fetchArticle(); fetchComments() })
watch(articleId, () => { fetchArticle(); fetchComments() })
</script>

<style scoped>
.post-detail-page { padding: 40px 0; max-width: 1200px; margin: 0 auto; }

.back-link {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 14px; color: var(--text-secondary);
  margin-bottom: 24px; transition: color var(--transition); cursor: pointer;
}
.back-link:hover { color: var(--accent); }

.error-banner {
  padding: 12px 16px; background: var(--danger-light); color: var(--danger);
  border-radius: var(--radius-sm); margin-bottom: 16px; font-size: 14px;
}
.status-msg { text-align: center; padding: 64px 0; color: var(--text-muted); font-size: 14px; }

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
.post-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
/* 点赞栏 */
.post-like-bar {
  display: flex; align-items: center; gap: 14px;
  padding: 20px 0;
  margin-bottom: 24px;
  border-top: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
}
.btn-like {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 20px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 14px; font-family: var(--font-sans);
  cursor: pointer;
  transition: all var(--transition);
}
.btn-like:hover:not(.liked) {
  border-color: var(--danger);
  color: var(--danger);
  background: var(--danger-light);
  transform: scale(1.05);
}
.btn-like:active:not(.liked) {
  transform: scale(0.95);
}
.btn-like.liked {
  border-color: var(--danger);
  background: var(--danger);
  color: #fff;
}
.like-count-text {
  font-size: 14px; color: var(--text-muted);
  font-family: var(--font-mono);
}
.tag {
  font-size: 11px; padding: 2px 10px; border-radius: 100px;
  background: var(--tag-bg); color: var(--tag-text); font-family: var(--font-mono);
}

/* 文章正文 */
.post-body {
  font-size: 17px; line-height: 1.85; color: var(--text);
  margin-bottom: 48px;
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
.rich-text :deep(ul), .rich-text :deep(ol) { padding-left: 24px; margin-bottom: 16px; }

/* 评论区 */
.comments-section { border-top: 2px solid var(--accent); padding-top: 32px; }
.comments-title { font-family: var(--font-serif); font-size: 20px; font-weight: 600; color: var(--heading); margin-bottom: 24px; }

.comment-form { margin-bottom: 32px; }
.comment-input {
  width: 100%; padding: 12px 14px;
  border: 1px solid var(--border); border-radius: var(--radius-sm);
  background: var(--bg); color: var(--text);
  font-size: 14px; font-family: var(--font-sans);
  resize: vertical; outline: none;
  transition: border-color var(--transition);
}
.comment-input:focus { border-color: var(--accent-border); box-shadow: 0 0 0 3px var(--accent-light); }
.comment-form-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.comment-hint { font-size: 13px; color: var(--danger); }
.btn-submit {
  padding: 8px 24px; border: none; border-radius: var(--radius-sm);
  background: var(--accent); color: #fff; font-size: 14px; font-weight: 500;
  cursor: pointer; font-family: var(--font-sans);
  transition: all var(--transition);
}
.btn-submit:hover:not(:disabled) { opacity: 0.9; }
.btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }

.comment-login-hint { text-align: center; padding: 24px; color: var(--text-muted); font-size: 14px; }
.link-btn { border: none; background: none; color: var(--accent); cursor: pointer; font-size: 14px; padding: 0; }
.link-btn:hover { text-decoration: underline; }

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
  .post-title { font-size: 26px; }
  .post-body { font-size: 16px; }
}
</style>
