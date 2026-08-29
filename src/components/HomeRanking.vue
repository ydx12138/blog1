<template>
  <section class="home-ranking">
    <div class="ranking-heading">
      <span class="ranking-title">热门文章</span>
      <span class="ranking-caption">点赞排行</span>
    </div>

    <ol v-if="rankingItems.length" class="ranking-list">
      <li v-for="item in rankingItems" :key="item.id" class="ranking-item">
        <span class="ranking-place" :class="`ranking-place--${item.rank}`" aria-hidden="true">
          <svg v-if="item.rank <= 3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22c4 0 7-2.7 7-6.4 0-2.1-1-3.7-2.7-5.3.1 2.4-1 3.6-2.3 4.3.3-3.7-1.3-7-4.5-9.3.2 3.2-1.3 5.4-3.3 7.1C4.8 13.7 5 15.6 5 16.7 5 19.8 8 22 12 22Z" />
            <path v-if="item.rank === 1" d="M11.5 22c-1.8-1.8-1.8-4.1-.2-5.7.2 1.2.8 1.9 1.6 2.4.8-1.1 1.1-2.4.7-3.7 1.8 1.6 2.4 3.3 1.5 5.2" />
          </svg>
          <span v-else>{{ item.rank }}</span>
        </span>
        <router-link class="ranking-link" :to="`/posts/${item.id}`" :title="item.title">
          {{ item.title }}
        </router-link>
      </li>
    </ol>
    <p v-else class="ranking-empty">暂无热门文章</p>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { getArticleRanking } from '../api/articles.js'

const rankingItems = ref([])
let refreshTimer

// loadRanking 拉取最新点赞排行榜；无参数；返回接口请求结果。
async function loadRanking() {
  try {
    const articles = await getArticleRanking(10)
    rankingItems.value = (articles || []).map((article, index) => ({ ...article, rank: index + 1 }))
  } catch {
    rankingItems.value = []
  }
}

onMounted(() => {
  loadRanking()
  refreshTimer = window.setInterval(loadRanking, 30000)
})

onUnmounted(() => window.clearInterval(refreshTimer))
</script>

<style scoped>
.home-ranking {
  padding: 3px 0 0;
  border-top: 2px solid var(--heading);
}

.ranking-heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 13px 0 12px;
  border-bottom: 1px solid var(--border-light);
}

.ranking-title {
  color: var(--heading);
  font-family: var(--font-serif);
  font-size: 17px;
  font-weight: 700;
}

.ranking-caption {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
}

.ranking-list { list-style: none; }
.ranking-empty { padding: 22px 0; color: var(--text-muted); font-size: 13px; text-align: center; }

.ranking-item {
  display: grid;
  grid-template-columns: 25px minmax(0, 1fr);
  align-items: center;
  min-height: 39px;
  border-bottom: 1px solid var(--border-light);
}

.ranking-place {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 19px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.ranking-place svg { width: 17px; height: 17px; }
.ranking-place--1 { color: #d94f2b; }
.ranking-place--2 { color: #e87835; }
.ranking-place--3 { color: #d49a36; }

.ranking-link {
  overflow: hidden;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ranking-link:hover { color: var(--accent); }
</style>
