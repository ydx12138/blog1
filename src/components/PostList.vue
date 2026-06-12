<template>
  <section class="post-list-section">
    <h2 class="section-title">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="section-icon">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
      文章
    </h2>
    <div class="post-list">
      <PostCard v-for="post in posts" :key="post.id" :post="post" />
    </div>
  </section>
</template>

<script setup>
import { getPublishedPosts } from '../data/posts.js'
import PostCard from './PostCard.vue'

const posts = getPublishedPosts()
</script>

<style scoped>
.post-list-section {
  padding: 48px 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-serif);
  font-size: 24px;
  font-weight: 700;
  color: var(--heading);
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--accent);
}

.section-icon {
  color: var(--accent);
}

@media (max-width: 768px) {
  .post-list-section {
    padding: 32px 0;
  }

  .section-title {
    font-size: 20px;
    margin-bottom: 16px;
  }
}
</style>
