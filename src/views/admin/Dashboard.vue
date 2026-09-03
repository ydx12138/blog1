<template>
  <div class="dashboard-page">
    <header class="dashboard-header">
      <div>
        <p class="page-kicker">运营概览</p>
        <h1 class="page-title">数据面板</h1>
        <p class="page-description">内容、互动与用户数据均来自当前站点的实时汇总。</p>
      </div>
      <button class="refresh-button" type="button" :disabled="loading" @click="loadDashboard">{{ loading ? '正在刷新' : '刷新数据' }}</button>
    </header>

    <section class="hero-metrics" aria-label="核心运营指标">
      <article class="hero-metric hero-metric-views"><span class="metric-label">累计浏览</span><strong>{{ formatDashboardNumber(data.total_views) }}</strong><span class="metric-note">覆盖 {{ data.published_articles }} 篇已发布文章</span></article>
      <article class="hero-metric"><span class="metric-label">累计互动</span><strong>{{ formatDashboardNumber(interactionTotal) }}</strong><span class="metric-note">{{ data.total_likes }} 次点赞 · {{ data.total_comments }} 条评论</span></article>
      <article class="hero-metric"><span class="metric-label">内容资产</span><strong>{{ data.total_articles }}</strong><span class="metric-note">{{ data.published_articles }} 已发布 · {{ data.draft_articles }} 篇草稿</span></article>
      <article class="hero-metric"><span class="metric-label">用户规模</span><strong>{{ data.total_users }}</strong><span class="metric-note">近 14 天新增 {{ data.new_users }} 位用户</span></article>
    </section>

    <section class="dashboard-grid dashboard-grid-main">
      <article class="panel trend-panel">
        <div class="panel-heading"><div><p class="panel-eyebrow">近 14 天</p><h2>新增趋势</h2></div><div class="segmented-control" aria-label="趋势数据类型"><button v-for="option in trendOptions" :key="option.key" type="button" :class="{ active: activeTrend === option.key }" @click="activeTrend = option.key">{{ option.label }}</button></div></div>
        <div class="trend-summary"><strong>{{ activeTrendTotal }}</strong><span>{{ activeTrendLabel }}新增总量</span><em>峰值 {{ activeTrendPeak }}</em></div>
        <div class="trend-chart" aria-label="近十四天新增趋势图">
          <svg viewBox="0 0 600 180" preserveAspectRatio="none" role="img"><defs><linearGradient id="trend-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="var(--accent)" stop-opacity=".25" /><stop offset="100%" stop-color="var(--accent)" stop-opacity="0" /></linearGradient></defs><line v-for="line in [20, 65, 110, 155]" :key="line" x1="0" x2="600" :y1="line" :y2="line" class="chart-grid-line" /><path :d="trendAreaPath" class="trend-area" /><polyline :points="trendPointString" class="trend-line" /><circle v-for="(point, index) in trendPoints" :key="index" :cx="point.x" :cy="point.y" r="3.6" class="trend-point" /></svg>
          <div class="chart-labels"><span v-for="point in data.trend" :key="point.date">{{ shortDate(point.date) }}</span></div>
        </div>
      </article>

      <article class="panel content-panel">
        <div class="panel-heading"><div><p class="panel-eyebrow">内容状态</p><h2>内容结构</h2></div><button class="text-link" type="button" @click="goTo('/admin/articles')">管理文章</button></div>
        <div class="content-progress"><div class="progress-track" aria-label="已发布与草稿文章比例"><span class="progress-published" :style="{ width: `${publishedPercent}%` }"></span></div><div class="progress-legend"><span><i class="legend-dot published"></i>已发布 {{ data.published_articles }}</span><span><i class="legend-dot"></i>草稿 {{ data.draft_articles }}</span></div></div>
        <div class="structure-list"><div class="structure-item"><span>分类覆盖</span><strong>{{ data.total_categories }} 个分类</strong></div><div class="structure-item warning-text"><span>未分类文章</span><strong>{{ data.uncategorized_articles }} 篇</strong></div><div class="structure-item warning-text"><span>待审核评论</span><strong>{{ data.pending_comments }} 条</strong></div><div class="structure-item"><span>已隐藏评论</span><strong>{{ data.hidden_comments }} 条</strong></div></div>
      </article>
    </section>

    <section class="dashboard-grid dashboard-grid-secondary">
      <article class="panel ranking-panel">
        <div class="panel-heading"><div><p class="panel-eyebrow">内容表现</p><h2>文章排行榜</h2></div><div class="metric-switch"><button v-for="option in rankingOptions" :key="option.key" type="button" :class="{ active: rankingMetric === option.key }" @click="rankingMetric = option.key">{{ option.label }}</button></div></div>
        <div v-if="rankedArticles.length" class="ranking-list"><button v-for="(article, index) in rankedArticles" :key="article.id" class="ranking-row" type="button" @click="goTo(`/admin/articles/${article.id}/edit`)"><span class="ranking-index" :class="{ 'ranking-index-top': index < 3 }">{{ index + 1 }}</span><span class="ranking-title"><b>{{ article.title || '未命名文章' }}</b><small>{{ article.category_name || '未分类' }}</small></span><span class="ranking-value">{{ formatDashboardNumber(article[rankingMetric]) }}</span></button></div>
        <p v-else class="empty-state">发布文章后，这里会显示内容表现。</p>
      </article>

      <article class="panel category-panel">
        <div class="panel-heading"><div><p class="panel-eyebrow">内容分布</p><h2>分类贡献</h2></div><button class="text-link" type="button" @click="goTo('/admin/categories')">管理分类</button></div>
        <div v-if="data.categories.length" class="category-list"><div v-for="category in data.categories" :key="category.id" class="category-row"><div class="category-row-top"><span>{{ category.name }}</span><small>{{ category.article_count }} 篇 · {{ formatDashboardNumber(category.view_count) }} 浏览</small></div><div class="category-bar"><span :style="{ width: `${categoryPercent(category.article_count)}%` }"></span></div></div></div>
        <p v-else class="empty-state">创建分类后，这里会展示内容分布。</p>
      </article>

      <article class="panel todo-panel">
        <div class="panel-heading"><div><p class="panel-eyebrow">需要处理</p><h2>运营待办</h2></div></div>
        <button class="todo-item" type="button" @click="goTo('/admin/comments')"><span>待审核评论</span><strong>{{ data.pending_comments }}</strong><i>查看</i></button>
        <button class="todo-item" type="button" @click="goTo('/admin/drafts')"><span>待完善草稿</span><strong>{{ data.draft_articles }}</strong><i>查看</i></button>
        <button class="todo-item" type="button" @click="goTo('/admin/articles')"><span>未分类文章</span><strong>{{ data.uncategorized_articles }}</strong><i>查看</i></button>
      </article>
    </section>

    <section class="panel activity-panel">
      <div class="panel-heading"><div><p class="panel-eyebrow">最新动态</p><h2>站点近期活动</h2></div></div>
      <div class="activity-grid">
        <div class="activity-column"><div class="activity-title"><span>最新文章</span><button type="button" @click="goTo('/admin/articles')">全部文章</button></div><button v-for="article in data.recent_articles" :key="article.id" class="activity-row" type="button" @click="goTo(`/admin/articles/${article.id}/edit`)"><span>{{ article.title || '未命名文章' }}</span><small>{{ formatDate(article.created_at) }}</small></button><p v-if="!data.recent_articles.length" class="activity-empty">暂无文章动态</p></div>
        <div class="activity-column"><div class="activity-title"><span>最新评论</span><button type="button" @click="goTo('/admin/comments')">评论管理</button></div><button v-for="comment in data.recent_comments" :key="comment.id" class="activity-row" type="button" @click="goTo('/admin/comments')"><span>{{ comment.nickname || '匿名用户' }}：{{ comment.content || '无内容' }}</span><small>{{ formatDate(comment.created_at) }}</small></button><p v-if="!data.recent_comments.length" class="activity-empty">暂无评论动态</p></div>
        <div class="activity-column"><div class="activity-title"><span>最新用户</span><button type="button" @click="goTo('/admin/users')">用户管理</button></div><button v-for="user in data.recent_users" :key="user.id" class="activity-row" type="button" @click="goTo('/admin/users')"><span>{{ user.nickname || user.email || '未命名用户' }}</span><small>{{ formatDate(user.created_at) }}</small></button><p v-if="!data.recent_users.length" class="activity-empty">暂无用户动态</p></div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getDashboard } from '../../api/admin.js'
import { buildTrendPoints, formatDashboardNumber } from '../../utils/dashboard.js'

const router = useRouter()
const loading = ref(false)
const activeTrend = ref('articles')
const rankingMetric = ref('view_count')
const trendOptions = [{ key: 'articles', label: '文章' }, { key: 'users', label: '用户' }, { key: 'comments', label: '评论' }]
const rankingOptions = [{ key: 'view_count', label: '浏览' }, { key: 'like_count', label: '点赞' }, { key: 'comment_count', label: '评论' }]
const data = ref(createEmptyDashboard())
const interactionTotal = computed(() => Number(data.value.total_likes || 0) + Number(data.value.total_comments || 0))
const publishedPercent = computed(() => { const total = Number(data.value.total_articles || 0); return total ? Math.round((Number(data.value.published_articles || 0) / total) * 100) : 0 })
const activeTrendLabel = computed(() => trendOptions.find((option) => option.key === activeTrend.value)?.label || '文章')
const activeTrendValues = computed(() => data.value.trend.map((point) => Number(point[activeTrend.value]) || 0))
const activeTrendTotal = computed(() => activeTrendValues.value.reduce((total, value) => total + value, 0))
const activeTrendPeak = computed(() => Math.max(...activeTrendValues.value, 0))
const trendPoints = computed(() => buildTrendPoints(activeTrendValues.value, 600, 155))
const trendPointString = computed(() => trendPoints.value.map((point) => `${point.x},${point.y}`).join(' '))
const trendAreaPath = computed(() => { if (!trendPoints.value.length) return ''; const points = trendPoints.value; return `M ${points[0].x} 155 L ${points.map((point) => `${point.x} ${point.y}`).join(' L ')} L ${points.at(-1).x} 155 Z` })
const rankedArticles = computed(() => [...data.value.top_articles].sort((left, right) => Number(right[rankingMetric.value] || 0) - Number(left[rankingMetric.value] || 0)))
const maxCategoryCount = computed(() => Math.max(...data.value.categories.map((item) => Number(item.article_count) || 0), 1))

function createEmptyDashboard() { return { total_articles: 0, published_articles: 0, draft_articles: 0, total_comments: 0, pending_comments: 0, hidden_comments: 0, total_users: 0, total_views: 0, total_likes: 0, total_categories: 0, uncategorized_articles: 0, new_articles: 0, new_users: 0, new_comments: 0, trend: [], top_articles: [], categories: [], recent_articles: [], recent_comments: [], recent_users: [] } }
function normalizeDashboard(payload = {}) { const empty = createEmptyDashboard(); return { ...empty, ...payload, trend: Array.isArray(payload.trend) ? payload.trend : [], top_articles: Array.isArray(payload.top_articles) ? payload.top_articles : [], categories: Array.isArray(payload.categories) ? payload.categories : [], recent_articles: Array.isArray(payload.recent_articles) ? payload.recent_articles : [], recent_comments: Array.isArray(payload.recent_comments) ? payload.recent_comments : [], recent_users: Array.isArray(payload.recent_users) ? payload.recent_users : [] } }
function shortDate(value) { return String(value || '').slice(5).replace('-', '/') }
function formatDate(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? '刚刚' : `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
function categoryPercent(count) { return Math.max(6, Math.round(((Number(count) || 0) / maxCategoryCount.value) * 100)) }
function goTo(path) { router.push(path) }
async function loadDashboard() { loading.value = true; try { data.value = normalizeDashboard(await getDashboard()) } catch (error) { console.error('加载数据面板失败', error) } finally { loading.value = false } }
onMounted(loadDashboard)
</script>

<style scoped>
.dashboard-page{max-width:1540px;margin:0 auto;padding-bottom:40px}.dashboard-header{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;margin-bottom:28px}.page-kicker,.panel-eyebrow{color:var(--accent);font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase}.page-title{margin-top:3px;font-family:var(--font-serif);font-size:30px;color:var(--heading)}.page-description{margin-top:4px;color:var(--text-secondary);font-size:14px}.refresh-button{border:1px solid var(--border);border-radius:var(--radius-sm);background:var(--bg-card);color:var(--text);cursor:pointer;padding:8px 13px;font:inherit;font-size:13px;transition:all var(--transition)}.refresh-button:hover:not(:disabled){border-color:var(--accent);color:var(--accent);background:var(--accent-light)}.refresh-button:disabled{cursor:wait;opacity:.65}.hero-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border:1px solid var(--border);border-radius:var(--radius);background:var(--bg-card);overflow:hidden;margin-bottom:18px}.hero-metric{min-width:0;padding:23px 24px 21px;border-left:1px solid var(--border)}.hero-metric:first-child{border-left:0}.hero-metric-views{background:var(--accent-light)}.metric-label{display:block;color:var(--text-secondary);font-size:13px}.hero-metric strong{display:block;color:var(--heading);font-family:var(--font-mono);font-size:32px;line-height:1.15;margin:7px 0}.hero-metric-views strong{color:var(--accent)}.metric-note{display:block;overflow:hidden;color:var(--text-muted);font-size:12px;text-overflow:ellipsis;white-space:nowrap}.dashboard-grid{display:grid;gap:18px;margin-bottom:18px}.dashboard-grid-main{grid-template-columns:minmax(0,1.65fr) minmax(300px,.9fr)}.dashboard-grid-secondary{grid-template-columns:minmax(0,1.22fr) minmax(260px,.92fr) minmax(240px,.7fr)}.panel{min-width:0;border:1px solid var(--border);border-radius:var(--radius);background:var(--bg-card);box-shadow:var(--shadow);padding:23px}.panel-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}.panel h2{color:var(--heading);font-family:var(--font-serif);font-size:19px;margin-top:3px}.segmented-control,.metric-switch{display:inline-flex;border:1px solid var(--border);border-radius:var(--radius-sm);padding:3px}.segmented-control button,.metric-switch button{border:0;border-radius:4px;background:transparent;color:var(--text-secondary);cursor:pointer;font:inherit;font-size:12px;padding:5px 9px}.segmented-control button.active,.metric-switch button.active{background:var(--accent);color:#fff}.trend-summary{align-items:baseline;display:flex;gap:8px;margin-top:18px}.trend-summary strong{color:var(--heading);font-family:var(--font-mono);font-size:29px}.trend-summary span,.trend-summary em{color:var(--text-secondary);font-size:12px;font-style:normal}.trend-summary em{margin-left:auto}.trend-chart{margin-top:12px}.trend-chart svg{display:block;height:185px;overflow:visible;width:100%}.chart-grid-line{stroke:var(--border-light);stroke-width:1}.trend-area{fill:url(#trend-area)}.trend-line{fill:none;stroke:var(--accent);stroke-linecap:round;stroke-linejoin:round;stroke-width:3;vector-effect:non-scaling-stroke}.trend-point{fill:var(--bg-card);stroke:var(--accent);stroke-width:2.2;vector-effect:non-scaling-stroke}.chart-labels{display:grid;grid-template-columns:repeat(14,minmax(0,1fr));margin-top:-5px}.chart-labels span{color:var(--text-muted);font-family:var(--font-mono);font-size:10px;overflow:hidden;text-align:center;white-space:nowrap}.text-link{border:0;background:transparent;color:var(--accent);cursor:pointer;font:inherit;font-size:12px;padding:4px 0}.text-link:hover{color:var(--accent-hover);text-decoration:underline}.content-progress{margin:25px 0 20px}.progress-track{display:flex;height:10px;overflow:hidden;border-radius:999px;background:var(--border-light)}.progress-published{border-radius:inherit;background:var(--accent);transition:width .45s ease}.progress-legend{display:flex;justify-content:space-between;gap:8px;margin-top:9px;color:var(--text-secondary);font-size:12px}.legend-dot{display:inline-block;width:7px;height:7px;margin-right:5px;border-radius:999px;background:var(--border)}.legend-dot.published{background:var(--accent)}.structure-list{border-top:1px solid var(--border-light)}.structure-item{display:flex;justify-content:space-between;gap:14px;border-bottom:1px solid var(--border-light);color:var(--text-secondary);font-size:13px;padding:11px 0}.structure-item:last-child{border-bottom:0}.structure-item strong{color:var(--heading);font-family:var(--font-mono);font-size:12px}.warning-text strong{color:#b7791f}.ranking-list{margin-top:15px}.ranking-row{display:grid;grid-template-columns:25px minmax(0,1fr) auto;align-items:center;gap:10px;width:100%;border:0;border-bottom:1px solid var(--border-light);background:transparent;color:inherit;cursor:pointer;padding:10px 0;text-align:left}.ranking-row:last-child{border-bottom:0}.ranking-row:hover .ranking-title b{color:var(--accent)}.ranking-index{color:var(--text-muted);font-family:var(--font-mono);font-size:12px}.ranking-index-top{color:var(--accent);font-weight:700}.ranking-title{min-width:0}.ranking-title b{display:block;overflow:hidden;color:var(--text);font-size:13px;font-weight:600;text-overflow:ellipsis;transition:color var(--transition);white-space:nowrap}.ranking-title small{display:block;margin-top:2px;color:var(--text-muted);font-size:11px}.ranking-value{color:var(--heading);font-family:var(--font-mono);font-size:12px}.category-list{margin-top:17px}.category-row{margin-bottom:13px}.category-row:last-child{margin-bottom:0}.category-row-top{display:flex;justify-content:space-between;gap:8px;margin-bottom:6px}.category-row-top span{overflow:hidden;color:var(--text);font-size:13px;text-overflow:ellipsis;white-space:nowrap}.category-row-top small{color:var(--text-muted);font-family:var(--font-mono);font-size:10px;white-space:nowrap}.category-bar{height:6px;overflow:hidden;border-radius:999px;background:var(--border-light)}.category-bar span{display:block;height:100%;border-radius:inherit;background:var(--accent);transition:width .45s ease}.todo-panel{padding-bottom:13px}.todo-item{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:10px;width:100%;border:0;border-bottom:1px solid var(--border-light);background:transparent;color:var(--text-secondary);cursor:pointer;font:inherit;font-size:13px;padding:13px 0;text-align:left}.todo-item:last-child{border-bottom:0}.todo-item:hover span{color:var(--accent)}.todo-item strong{color:var(--heading);font-family:var(--font-mono);font-size:14px}.todo-item i{color:var(--text-muted);font-size:11px;font-style:normal}.activity-panel{padding-bottom:15px}.activity-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:25px;margin-top:18px}.activity-column+.activity-column{border-left:1px solid var(--border-light);padding-left:25px}.activity-title{align-items:center;display:flex;justify-content:space-between;margin-bottom:4px}.activity-title span{color:var(--heading);font-size:13px;font-weight:700}.activity-title button{border:0;background:transparent;color:var(--accent);cursor:pointer;font:inherit;font-size:11px}.activity-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;width:100%;border:0;border-bottom:1px solid var(--border-light);background:transparent;color:var(--text);cursor:pointer;font:inherit;font-size:12px;padding:9px 0;text-align:left}.activity-row span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.activity-row:hover span{color:var(--accent)}.activity-row small{color:var(--text-muted);font-family:var(--font-mono);font-size:10px}.activity-empty,.empty-state{color:var(--text-muted);font-size:13px;padding:24px 0 7px;text-align:center}.activity-empty{padding:17px 0;text-align:left}@media(max-width:1200px){.hero-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.hero-metric:nth-child(3){border-left:0;border-top:1px solid var(--border)}.hero-metric:nth-child(4){border-top:1px solid var(--border)}.dashboard-grid-secondary{grid-template-columns:repeat(2,minmax(0,1fr))}.todo-panel{grid-column:span 2}}@media(max-width:900px){.dashboard-grid-main,.dashboard-grid-secondary{grid-template-columns:1fr}.todo-panel{grid-column:auto}.activity-grid{grid-template-columns:1fr;gap:16px}.activity-column+.activity-column{border-left:0;border-top:1px solid var(--border-light);padding-left:0;padding-top:16px}}@media(max-width:620px){.dashboard-header{align-items:flex-start;flex-direction:column}.hero-metrics{grid-template-columns:1fr}.hero-metric,.hero-metric:nth-child(3),.hero-metric:nth-child(4){border-left:0;border-top:1px solid var(--border)}.hero-metric:first-child{border-top:0}.panel{padding:17px}.panel-heading{gap:10px}.segmented-control button{padding:5px 7px}.chart-labels span:nth-child(even){visibility:hidden}}
</style>
