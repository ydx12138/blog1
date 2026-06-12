<template>
  <a :href="project.url" class="project-card" target="_blank" rel="noopener noreferrer">
    <div class="project-header">
      <span class="project-icon">{{ project.icon }}</span>
      <span class="project-stars" v-if="project.stars">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="star-icon">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
        {{ project.stars }}
      </span>
    </div>
    <h3 class="project-name">{{ project.name }}</h3>
    <p class="project-desc">{{ project.description }}</p>
  </a>
</template>

<script setup>
defineProps({
  project: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.project-card {
  display: block;
  padding: 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: all var(--transition);
  text-decoration: none;
}

.project-card:hover {
  border-color: var(--accent-border);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.project-icon {
  font-size: 28px;
  line-height: 1;
}

.project-stars {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.star-icon {
  color: #eab308;
}

.project-name {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 600;
  color: var(--heading);
  margin-bottom: 6px;
}

.project-desc {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
