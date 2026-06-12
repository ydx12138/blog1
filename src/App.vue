<template>
  <SiteHeader />
  <main class="main-content">
    <router-view />
  </main>
  <SiteFooter />
</template>

<script setup>
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
</script>

<style scoped>
.main-content {
  flex: 1;
}
</style>
