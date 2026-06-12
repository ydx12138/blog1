<template>
  <footer class="site-footer">
    <div class="footer-social">
      <a
        v-for="link in site.socialLinks"
        :key="link.name"
        :href="link.url"
        :title="link.name"
        class="footer-social-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        {{ link.name }}
      </a>
    </div>
    <div class="footer-divider"></div>
    <p class="footer-copy">
      © {{ year }} {{ site.title }} — Powered by Vue &amp; Vite
    </p>
  </footer>
</template>

<script setup>
import { site } from '../data/site.js'

const year = new Date().getFullYear()
</script>

<style scoped>
.site-footer {
  text-align: center;
  padding: 48px 0 32px;
  margin-top: auto;
}

.footer-social {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-bottom: 24px;
}

.footer-social-link {
  font-size: 14px;
  color: var(--text-secondary);
  transition: color var(--transition);
  padding: 4px 0;
}

.footer-social-link:hover {
  color: var(--accent);
  opacity: 1;
}

.footer-divider {
  width: 60px;
  height: 1px;
  background: var(--border);
  margin: 0 auto 20px;
}

.footer-copy {
  font-size: 13px;
  color: var(--text-muted);
}
</style>
