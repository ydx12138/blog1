<template>
  <div class="not-found-page">
    <div class="nf-content">
      <p class="nf-code">404</p>
      <h1 class="nf-title">页面不存在</h1>
      <p class="nf-desc">你访问的页面可能已被删除或移动</p>
      <router-link to="/" class="nf-link">← 返回首页</router-link>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}
.nf-code {
  font-family: var(--font-mono);
  font-size: 72px;
  font-weight: 700;
  color: var(--accent);
  line-height: 1;
  margin-bottom: 8px;
  opacity: 0.8;
}
.nf-title {
  font-family: var(--font-serif);
  font-size: 24px;
  font-weight: 600;
  color: var(--heading);
  margin-bottom: 8px;
}
.nf-desc {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 28px;
}
.nf-link {
  font-size: 14px;
  color: var(--accent);
  text-decoration: none;
  padding: 8px 20px;
  border: 1px solid var(--accent-border);
  border-radius: var(--radius-sm);
  transition: all var(--transition);
}
.nf-link:hover {
  background: var(--accent-light);
  color: var(--accent-hover);
}

@media (max-width: 768px) {
  .nf-code { font-size: 56px; }
  .nf-title { font-size: 20px; }
}
</style>
