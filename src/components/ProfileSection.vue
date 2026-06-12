<template>
  <section class="profile-section">
    <img
      :src="site.author.avatar"
      :alt="site.author.name"
      class="avatar"
      loading="lazy"
    />
    <h1 class="name">{{ site.author.name }}</h1>
    <p class="bio">{{ site.author.bio }}</p>
    <div class="location">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
      {{ site.author.location }}
    </div>
    <div class="social-links">
      <a
        v-for="link in site.socialLinks"
        :key="link.name"
        :href="link.url"
        :title="link.name"
        class="social-link"
        target="_blank"
        rel="noopener noreferrer"
      >
        <!-- GitHub Icon -->
        <svg v-if="link.icon === 'github'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
        <!-- Twitter/X Icon -->
        <svg v-else-if="link.icon === 'twitter'" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
        <!-- RSS Icon -->
        <svg v-else-if="link.icon === 'rss'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 11a9 9 0 0 1 9 9"/>
          <path d="M4 4a16 16 0 0 1 16 16"/>
          <circle cx="5" cy="19" r="1"/>
        </svg>
      </a>
    </div>
  </section>
</template>

<script setup>
import { site } from '../data/site.js'
</script>

<style scoped>
.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 64px 0 48px;
}

.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border);
  box-shadow: var(--shadow-md);
  margin-bottom: 24px;
  transition: transform var(--transition), box-shadow var(--transition);
}

.avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.name {
  font-family: var(--font-serif);
  font-size: 32px;
  font-weight: 700;
  color: var(--heading);
  letter-spacing: -1px;
  margin-bottom: 8px;
}

.bio {
  font-size: 16px;
  color: var(--text-secondary);
  max-width: 480px;
  line-height: 1.7;
  white-space: pre-line;
  margin-bottom: 12px;
}

.location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--text-muted);
  margin-bottom: 24px;
}

.social-links {
  display: flex;
  align-items: center;
  gap: 12px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  background: var(--bg-card);
  border: 1px solid var(--border);
  transition: all var(--transition);
}

.social-link:hover {
  color: var(--accent);
  border-color: var(--accent-border);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
  opacity: 1;
}

@media (max-width: 768px) {
  .profile-section {
    padding: 40px 0 32px;
  }

  .avatar {
    width: 80px;
    height: 80px;
  }

  .name {
    font-size: 26px;
  }

  .bio {
    font-size: 15px;
  }
}
</style>
