<template>
  <section class="site-management">
    <h1 class="page-title">网站管理</h1>
    <div class="empty-state">
      <p>网站管理功能将在此处配置。</p>
    </div>
  </section>
</template>

<style scoped>
.page-title {
  margin: 0 0 20px;
  color: var(--heading);
  font-family: var(--font-serif);
  font-size: 28px;
  font-weight: 700;
}

.empty-state {
  min-height: 240px;
  display: grid;
  place-items: center;
  border: 1px dashed var(--border);
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 14px;
}

.empty-state p { margin: 0; }
</style>
