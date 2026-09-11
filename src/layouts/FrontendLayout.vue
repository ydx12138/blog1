<template>
  <div class="frontend-layout" :class="{ 'frontend-layout--home': isHome, 'frontend-layout--post': isPostDetail }">
    <section class="frontend-layout__main">
      <slot />
    </section>

    <aside v-if="isHome" class="frontend-layout__aside" aria-label="页面扩展区域">
      <button class="ranking-toggle" type="button" :aria-expanded="rankingOpen" aria-controls="home-ranking-panel" @click="rankingOpen = !rankingOpen">热门文章 · 浏览量排行 {{ rankingOpen ? '−' : '+' }}</button>
      <div id="home-ranking-panel" class="ranking-panel" :class="{ 'is-open': rankingOpen }">
      <HomeRanking />
      </div>
    </aside>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import HomeRanking from '../components/HomeRanking.vue'

const route = useRoute()
const rankingOpen = ref(false)
const isHome = computed(() => route.name === 'home')
const isPostDetail = computed(() => route.name === 'post-detail')
</script>

<style scoped>
.frontend-layout {
  width: min(100%, 1120px);
  min-height: calc(100vh - 80px);
  display: grid;
  grid-template-columns: minmax(0, 720px);
  align-items: start;
  column-gap: 56px;
  margin: 0 auto;
}

/* 首页：正文 + 右侧排行榜 */
.frontend-layout--home {
  grid-template-columns: minmax(0, 720px) 272px;
}

/* 详情页：左侧目录 + 正文（正文保持 720px 阅读宽度） */
.frontend-layout--post {
  grid-template-columns: minmax(0, 960px);
}

.frontend-layout__main { min-width: 0; }
.ranking-toggle { display: none; }

.frontend-layout__aside {
  position: sticky;
  top: 40px;
  min-height: 360px;
}

@media (max-width: 1180px) {
  .frontend-layout { column-gap: 36px; }
}

@media (max-width: 1279px) {
  .frontend-layout,
  .frontend-layout--home,
  .frontend-layout--post {
    width: min(100%, 760px);
    grid-template-columns: minmax(0, 1fr);
  }

  .frontend-layout__aside { position: static; min-height: 0; grid-row: 1; margin: 24px 0 0; }
  .ranking-panel { display: none; }
  .ranking-panel.is-open { display: block; }
  .ranking-toggle { min-height: 44px; width: 100%; display: flex; align-items: center; padding: 8px 0; border: 0; border-bottom: 1px solid var(--border-light); background: transparent; font: inherit; cursor: pointer; color: var(--text-secondary); }
}

@media (max-width: 768px) {
  .frontend-layout { min-height: auto; }
}
</style>
