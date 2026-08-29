<template>
  <div class="frontend-layout" :class="{ 'frontend-layout--home': isHome }">
    <section class="frontend-layout__main">
      <slot />
    </section>

    <aside class="frontend-layout__aside" aria-label="页面扩展区域">
      <HomeRanking v-if="isHome" />
    </aside>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HomeRanking from '../components/HomeRanking.vue'

const route = useRoute()
const isHome = computed(() => route.name === 'home')
</script>

<style scoped>
.frontend-layout {
  width: min(100%, 1120px);
  min-height: calc(100vh - 80px);
  display: grid;
  grid-template-columns: minmax(0, 720px) 272px;
  align-items: start;
  column-gap: 56px;
  margin: 0 auto;
}

.frontend-layout__main { min-width: 0; }

.frontend-layout__aside {
  position: sticky;
  top: 40px;
  min-height: 360px;
}

@media (max-width: 1180px) {
  .frontend-layout { column-gap: 36px; }
}

@media (max-width: 1040px) {
  .frontend-layout {
    width: min(100%, 760px);
    grid-template-columns: minmax(0, 1fr);
  }

  .frontend-layout__aside { display: none; }
}

@media (max-width: 768px) {
  .frontend-layout { min-height: auto; }
}
</style>
