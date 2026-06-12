<template>
  <section class="project-section">
    <h2 class="section-title">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="section-icon">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
      项目
    </h2>
    <div class="project-grid">
      <ProjectCard v-for="project in projects" :key="project.id" :project="project" />
    </div>
  </section>
</template>

<script setup>
import { projects } from '../data/projects.js'
import ProjectCard from './ProjectCard.vue'
</script>

<style scoped>
.project-section {
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

.project-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 768px) {
  .project-section {
    padding: 32px 0;
  }

  .section-title {
    font-size: 20px;
    margin-bottom: 16px;
  }

  .project-grid {
    grid-template-columns: 1fr;
  }
}
</style>
