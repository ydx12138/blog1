<template>
  <section class="profile">
    <div class="avatar-wrap">
      <svg v-if="!site.author.avatar" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
      <img v-else :src="site.author.avatar" :alt="site.author.name" />
    </div>
    <h1 class="name">{{ site.author.name }}</h1>
    <p class="bio">{{ site.author.bio }}</p>
  </section>
</template>

<script setup>
import { site } from '../data/site.js'
</script>

<style scoped>
.profile {
  text-align: center;
  padding: 48px 0 32px;
}
.avatar-wrap {
  width: 80px; height: 80px;
  border-radius: 50%;
  background: var(--accent-light);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 20px;
  color: var(--accent);
  overflow: hidden;
}
.avatar-wrap img {
  width: 100%; height: 100%; object-fit: cover;
}
.name {
  font-family: var(--font-serif);
  font-size: 30px; font-weight: 700;
  color: var(--heading);
  letter-spacing: -1px;
  margin-bottom: 8px;
}
.bio {
  font-size: 15px; color: var(--text-secondary);
  max-width: 400px; margin-left: auto; margin-right: auto;
}

@media (max-width: 768px) {
  .profile { padding: 32px 0 24px; }
  .name { font-size: 26px; }
  .avatar-wrap { width: 68px; height: 68px; }
}
</style>
