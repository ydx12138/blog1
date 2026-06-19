<template>
  <SiteHeader />
  <main class="main-content">
    <router-view />
    <SiteFooter />
  </main>
</template>

<script setup>
import SiteHeader from './components/SiteHeader.vue'
import SiteFooter from './components/SiteFooter.vue'
</script>
