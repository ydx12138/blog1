<template>
  <div class="app-inner" :class="{ 'has-sidebar': !isAdminRoute }">
    <SiteHeader v-if="!isAdminRoute" />
    <main class="main-content">
      <template v-if="isAdminRoute">
        <router-view />
      </template>
      <FrontendLayout v-else>
        <router-view />
        <SiteFooter />
      </FrontendLayout>
    </main>
    <NoticeCenter />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
import NoticeCenter from './components/NoticeCenter.vue'
import FrontendLayout from './layouts/FrontendLayout.vue'

const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
</script>
