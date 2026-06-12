<template>
  <div class="about-page">
    <h1 class="page-title">关于</h1>
    <div class="about-content">
      <p>
        你好，我是 <strong>{{ site.author.name }}</strong>，一名前端工程师，目前生活在{{ site.author.location }}。
      </p>
      <p>
        我是
        <a href="https://github.com/tw93/Pake" target="_blank" rel="noopener">Pake</a>、
        <a href="https://github.com/tw93/MiaoYan" target="_blank" rel="noopener">MiaoYan</a>、
        <a href="https://github.com/alibaba/x-render" target="_blank" rel="noopener">XRender</a>
        等开源项目的作者。
      </p>
      <p>
        我喜欢简洁的设计、高效的开发工具，和一切能让工作变得更优雅的事物。
        这个博客记录我在前端开发、开源项目和个人成长方面的心得。
      </p>

      <h2>关于本站</h2>
      <p>
        本博客使用 Vue 3 + Vite 构建，设计风格参考了
        <a href="https://github.com/tw93/tw93.github.io" target="_blank" rel="noopener">cosy-jekyll-theme</a>，
        追求简洁、温暖、易读的阅读体验。
      </p>

      <h2>联系我</h2>
      <div class="contact-links">
        <a
          v-for="link in site.socialLinks"
          :key="link.name"
          :href="link.url"
          class="contact-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ link.name }} →
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { site } from '../data/site.js'
</script>

<style scoped>
.about-page {
  padding: 32px 0;
  max-width: 680px;
}

.page-title {
  font-family: var(--font-serif);
  font-size: 36px;
  font-weight: 700;
  color: var(--heading);
  letter-spacing: -1px;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 2px solid var(--accent);
}

.about-content {
  font-size: 16px;
  line-height: 1.85;
  color: var(--text);
}

.about-content p {
  margin-bottom: 20px;
}

.about-content h2 {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 600;
  color: var(--heading);
  margin: 40px 0 16px;
}

.contact-links {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 8px;
}

.contact-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--text-secondary);
  transition: all var(--transition);
}

.contact-link:hover {
  color: var(--accent);
  border-color: var(--accent-border);
  box-shadow: var(--shadow);
  opacity: 1;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 28px;
  }

  .about-content {
    font-size: 15px;
  }
}
</style>
