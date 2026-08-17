<template>
  <div class="app-inner" :class="{ 'has-sidebar': !isAdminRoute }">
    <SiteHeader v-if="!isAdminRoute" />
    <main class="main-content">
      <router-view />
      <SiteFooter v-if="!isAdminRoute" />
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

const route = useRoute()
const isAdminRoute = computed(() => route.path.startsWith('/admin'))
</script>
