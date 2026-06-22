<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-links">
        <a
          v-for="link in site.socialLinks"
          :key="link.name"
          :href="link.url"
          class="footer-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ link.name }}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
        </a>
      </div>
      <p class="footer-copy">&copy; {{ year }} {{ site.author.name }} &mdash; Powered by Vue &amp; Go</p>
    </div>
  </footer>
</template>

<script setup>
import { site } from '../data/site.js'
const year = new Date().getFullYear()
</script>

<style scoped>
.site-footer {
  padding: 40px 0 32px;
  border-top: 1px solid var(--border-light);
  margin-top: 48px;
}
.footer-inner { text-align: center; }
.footer-links {
  display: flex; justify-content: center; gap: 20px;
  margin-bottom: 10px;
}
.footer-link {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 13px; color: var(--text-secondary);
  transition: color var(--transition);
}
.footer-link:hover { color: var(--accent); }
.footer-copy {
  font-size: 12px; color: var(--text-muted);
}
</style>
